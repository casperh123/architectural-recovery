import fs from 'node:fs/promises';
import * as parser from '@babel/parser';
import _traverse from '@babel/traverse';
import { ImportResolver } from './importResolver';
import { Node } from './types/node';

const traverse = (_traverse as any).default ?? _traverse;


export class DependencyGraph {

  private importResolver: ImportResolver;
  private internalGraph: Map<string, Map<string, number>> | undefined;
  private nodes: Map<string, Node>;

  constructor(
    rootDir: string,
    level: number = 3
  ) {
    this.importResolver = new ImportResolver(rootDir, level);
    this.nodes = new Map<string, Node>;
  }

  async build(filePaths: string[]): Promise<Map<string, Map<string, number>>> {
    this.internalGraph = new Map<string, Map<string, number>>();

    for (const filePath of filePaths) {
      const sourcePath = this.importResolver.toModule(filePath);

      if (!this.nodes.has(sourcePath)) {
        this.nodes.set(sourcePath, new Node(sourcePath));
      }

      const code = await this.read(filePath);
      if (!code) continue;

      const { imports, loc } = this.getProgramInformation(code);

      for (const imp of imports) {
        const target = this.importResolver.resolveImport(imp, filePath);
        
        if (!target || target === sourcePath) continue;

        if(!this.nodes.has(target)) {
          this.nodes.set(target, new Node(target));
        }

        if (!this.internalGraph.has(sourcePath)) this.internalGraph.set(sourcePath, new Map());

        const deps = this.internalGraph.get(sourcePath)!;
        deps.set(target, (deps.get(target) ?? 0) + 1);
      }
    }

    return this.internalGraph;
  }

  public getNodes(): Map<string, Node> {
    return this.nodes;
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


  private getProgramInformation(code: string): { imports: string[], loc: number} {
    const imports: string[] = [];
    let loc = 0;

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

    return { imports, loc};
  }
}
