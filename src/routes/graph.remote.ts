import { query } from "$app/server";
import { __baseDir } from "$lib/constants";
import { DependencyGraph } from "$lib/sourceAnalysis/dependencyGraph";
import { FileExplorer } from "$lib/sourceAnalysis/fileExploration";
import path from "path";
import z from "zod";

export const getGraph = query(
  z.tuple([z.int(), z.string()]),
  async (args) => {
    const baseDir = path.join(__baseDir, "../../libs/dokploy");
    const focusedPath = args[1];
    const filePath = focusedPath !== "" ? path.join(baseDir, focusedPath) : baseDir

    const explorer = new FileExplorer();
    const files = await explorer.getJavaScriptFiles(filePath);
    const dependencyGraph = new DependencyGraph(baseDir, filePath, args[0]);
    const graph = await dependencyGraph.build(files);
    const modules = dependencyGraph.getModulePaths();
    const nodes = new Map(
      [...dependencyGraph.getNodes().entries()].map(([k, v]) => [k, v.toJSON()])
    );

    console.log(nodes);
    
    return { graph, nodes, modules };
  }
);
