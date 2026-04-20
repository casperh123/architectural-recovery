import fs from 'node:fs/promises';
import path from 'node:path';
import { Dirent } from 'node:fs';

export class FileExplorer {
  private javaScriptExtensions: Set<string> = new Set([
    "js",
    "ts",
    "jsx",
    "tsx"
  ]);

  constructor() {
  }

  public async getJavaScriptFiles(baseDir: string): Promise<Array<string>> {
    let queue = await fs.readdir(baseDir, { withFileTypes: true });
    let javascriptFiles: Array<string> = [];

    while (queue.length > 0) {
      const includedFiles = this.filterJavascriptFiles(queue);
      
      javascriptFiles = javascriptFiles.concat(includedFiles);
      queue = this.includeDirectories(queue);

      const nextDir = queue.pop();

      if (nextDir == undefined) continue;

      const nextDirPath = path.join(nextDir.parentPath, nextDir.name);
      const nextDirFiles = await fs.readdir(nextDirPath, { withFileTypes: true });
      queue = queue.concat(nextDirFiles);
    }

    return javascriptFiles;
  }

  private isJavascript(fileName: string): boolean {
    const fileExtension = fileName.lastIndexOf(".") + 1;

    return this.javaScriptExtensions.has(fileName.slice(fileExtension))
  }

  private includeDirectories(files: Dirent<string>[]): Dirent<string>[] {
    return files.filter(e => e.isDirectory() && !e.name.startsWith('.') && e.name !== 'node_modules');
  }

  private filterJavascriptFiles(files: Dirent<string>[]): Array<string> {
    return files
      .filter(e => e.isFile() && this.isJavascript(e.name))
      .map(e => path.join(e.parentPath, e.name));
  }
}
