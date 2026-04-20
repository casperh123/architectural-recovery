import fs from 'node:fs/promises';

export class Diagram {
  public async saveGraph(graph: Map<string, Map<string, number>>): Promise<void> {
    const gexf = this.exportToGexf(graph);
    await fs.writeFile('graph.gexf', gexf, 'utf-8');
    console.log(`Graph written to graph.gexf — ${graph.size} nodes`);
  }

  private exportToGexf(graph: Map<string, Map<string, number>>): string {
    const allNodes = new Set<string>();
    
    for (const [module, deps] of graph) {
      allNodes.add(module);
      for (const dep of deps.keys()) allNodes.add(dep);
    }

    const nodeIndex = new Map<string, number>();
    [...allNodes].forEach((n, i) => nodeIndex.set(n, i));

    const nodeXml = [...allNodes].map(n =>
      `      <node id="${nodeIndex.get(n)}" label="${n}"/>`
    ).join('\n');

    let edgeId = 0;
    const edgeXml: string[] = [];
    for (const [module, deps] of graph) {
      for (const [dep, count] of deps) {
        edgeXml.push(`      <edge id="${edgeId++}" source="${nodeIndex.get(module)}" target="${nodeIndex.get(dep)}" weight="${count}"/>`);
      }
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
  <gexf xmlns="http://www.gexf.net/1.2draft">
    <graph defaultedgetype="directed">
      <nodes>
  ${nodeXml}
      </nodes>
      <edges>
  ${edgeXml.join('\n')}
      </edges>
    </graph>
  </gexf>`;
  }
}
