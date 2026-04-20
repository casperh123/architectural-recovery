import { query } from "$app/server";
import { __baseDir } from "$lib/constants";
import { DependencyGraph } from "$lib/sourceAnalysis/dependencyGraph";
import { FileExplorer } from "$lib/sourceAnalysis/fileExploration";
import path from "path";
import z from "zod";

export const getGraph = query(
  z.int(),
  async (depth) => {
    const filePath = path.join(__baseDir, "../../libs/dokploy");

    if (filePath === "") return new Map();
    const explorer = new FileExplorer();
    const files = await explorer.getJavaScriptFiles(filePath);
    const dependencyGraphBuilder = new DependencyGraph(filePath, depth);
    return await dependencyGraphBuilder.build(files);
  }
);
