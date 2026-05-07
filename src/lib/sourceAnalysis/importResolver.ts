import path from "path";

export class ImportResolver {

  constructor(
    private rootDir: string,
    private filterDir: string,
    private depth: number
  ) {

  }
  
  
  public toModule(filePath: string): string {
    const relative = path.relative(this.rootDir, filePath);
    return this.toLevel(relative);
  }
  
  
  public resolveImport(imp: string, fromFile: string): string | undefined {
    if (imp.startsWith('.')) {
      const resolved = path.resolve(path.dirname(fromFile), imp);
      const relative = path.relative(this.rootDir, resolved);
      return this.toLevel(relative);
    }

    if(imp.startsWith("@dokploy") || imp.startsWith("@/dokploy")) {
      const parts = imp.split('/');
      return parts.slice(1, this.depth).join('/')
    }

    if (imp.startsWith('@/')) {
      return this.toLevel(imp.slice(2));
    }

    if (imp.startsWith('@')) {
      const parts = imp.split('/');
      return parts[0];
    }

    return undefined;
  }

  private toLevel(p: string): string {
    const parts = p.split(path.sep).filter(Boolean);

    return parts.slice(0, this.depth).join('/');
  }
}
