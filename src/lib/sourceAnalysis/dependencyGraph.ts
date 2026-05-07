import fs from 'node:fs/promises';
import * as parser from '@babel/parser';
import _traverse from '@babel/traverse';
import { ImportResolver } from './importResolver';
import path from 'node:path';

const traverse = (_traverse as any).default ?? _traverse;


export class DependencyGraph {

  private importResolver: ImportResolver;
  private internalGraph: Map<string, Map<string, number>> | undefined;

  constructor(
    rootDir: string,
    level: number = 3
  ) {
    this.importResolver = new ImportResolver(rootDir, level)
  }

  async build(filePaths: string[]): Promise<Map<string, Map<string, number>>> {
    this.internalGraph = new Map<string, Map<string, number>>();

    for (const filePath of filePaths) {
      const source = this.importResolver.toModule(filePath);
      if (!source) continue;

      const code = await this.read(filePath);
      if (!code) continue;

      const imports = this.getImports(code);

      for (const imp of imports) {
        const target = this.importResolver.resolveImport(imp, filePath);
        if (!target || target === source) continue;

        if (!this.internalGraph.has(source)) this.internalGraph.set(source, new Map());

        const deps = this.internalGraph.get(source)!;
        deps.set(target, (deps.get(target) ?? 0) + 1);
      }
    }

    return this.internalGraph;
  }

  public getModulePaths(): string[] {
    if(this.internalGraph == undefined) {
      return [];
    }

    const uniquePaths: Set<string> = new Set();

    for (const modulePath of this.internalGraph?.keys()) {
      const pathPrefixes = this.extractAllPathPrefixes(modulePath);

      for(const uniquePath of pathPrefixes) {
        uniquePaths.add(uniquePath);
      }
    }
    
    return Array.from(uniquePaths.values());
  }

  private extractAllPathPrefixes(path: string): Set<string> {
    const parts = path.split("/");
    const prefixes = new Set<string>();

    for(let i = 0; i < parts.length; i++) {
      const path = parts.slice(0, i).join("/");

      if(path == "") {
        continue;
      }

      prefixes.add(path);
    }

    return prefixes;
  }

  private async read(filePath: string) {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch {
      return null;
    }
  }


  private getImports(code: string): string[] {
    const imports: string[] = [];

    try {
      const ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx']
      });

      traverse(ast, {
        ImportDeclaration(path: any) {
          imports.push(path.node.source.value);
        }
      });
    } catch {}

    return imports;
  }
}
