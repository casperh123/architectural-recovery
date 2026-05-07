import { query } from "$app/server";
import { __baseDir } from "$lib/constants";
import { DependencyGraph } from "$lib/sourceAnalysis/dependencyGraph";
import { FileExplorer } from "$lib/sourceAnalysis/fileExploration";
import path from "path";
import z from "zod";

export const getGraph = query(
  z.tuple([z.int(), z.string()]),
  async (args) => {
    let filePath = path.join(__baseDir, "../../libs/dokploy");
    const focusedPath = args[1];

    if(focusedPath != "") {
      filePath = path.join(filePath, focusedPath);
    }

    if (filePath === "") return new Map();
    const explorer = new FileExplorer();
    const files = await explorer.getJavaScriptFiles(filePath);
    const dependencyGraph = new DependencyGraph(filePath, args[0]);
    const graph = await dependencyGraph.build(files);
    const modules = dependencyGraph.getModulePaths();

    console.log(modules);

    return {graph, modules};
  }
);
