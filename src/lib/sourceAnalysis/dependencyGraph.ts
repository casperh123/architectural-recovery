import fs from 'node:fs/promises';
import path from 'node:path';
import * as parser from '@babel/parser';
import _traverse from '@babel/traverse';

const traverse = (_traverse as any).default ?? _traverse;


export class DependencyGraph {

  constructor(
    private rootDir: string,
    private level: number = 3
  ) {}

  async build(filePaths: string[]): Promise<Map<string, Map<string, number>>> {
    const graph = new Map<string, Map<string, number>>();

    for (const filePath of filePaths) {
      const source = this.toModule(filePath);
      if (!source) continue;

      const code = await this.read(filePath);
      if (!code) continue;

      const imports = this.getImports(code);

      for (const imp of imports) {
        const target = this.resolveImport(imp, filePath);
        if (!target || target === source) continue;

        if (!graph.has(source)) graph.set(source, new Map());

        const deps = graph.get(source)!;
        deps.set(target, (deps.get(target) ?? 0) + 1);
      }
    }

    return graph;
  }

  private async read(filePath: string) {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch {
      return null;
    }
  }

  private toModule(filePath: string): string {
    const relative = path.relative(this.rootDir, filePath);
    return this.toLevel(relative);
  }

  private resolveImport(imp: string, fromFile: string): string | undefined {
    

    if (imp.startsWith('.')) {
      const resolved = path.resolve(path.dirname(fromFile), imp);
      const relative = path.relative(this.rootDir, resolved);
      return this.toLevel(relative);
    }

    if (imp.startsWith('@/')) {
      return this.toLevel(imp.slice(2));
    }

    if (imp.startsWith('@')) {
      const parts = imp.split('/');
      return parts.slice(0, 2).join('/');
    }

    return undefined;
  }

  private toLevel(p: string): string {
    const parts = p.split(path.sep).filter(Boolean);

    return parts.slice(0, this.level).join('/');
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
