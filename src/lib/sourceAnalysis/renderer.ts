import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import elk from 'cytoscape-elk';
import coseBilkent from 'cytoscape-cose-bilkent';
import type { Node } from './types/node';

cytoscape.use(elk);

function graphToElements(
  graph: Map<string, Map<string, number>>, 
  include: Set<string> | undefined,
  nodes: Map<string, Node>
) {
  const diagramNodes = new Map();
  const layerNodes = new Map();  
  const edges: any[] = [];

  for (const [module, deps] of graph) {
    if (include != undefined && !include.has(module)) continue;
    
    if (!diagramNodes.has(module)) {
      const node = nodes.get(module);
      const layer = node?.layer;
      
      if (!layerNodes.has(layer)) {
        layerNodes.set(layer, { data: { id: layer, label: layer, layer: layer } });
      }

      diagramNodes.set(module, { 
        data: { id: module, label: module, layer, parent: layer, type: node?.type } 
      });
    }

    for (const [target, count] of deps) {
      if (!diagramNodes.has(target)) {
        const node = nodes.get(target);
        const layer = node?.layer;
        if (!layerNodes.has(layer)) {
          layerNodes.set(layer, { data: { id: layer, label: layer, layer: layer } });
        }
        diagramNodes.set(target, { 
          data: { id: target, label: target, layer, parent: layer } 
        });
      }
      edges.push({
        data: { id: `${module}->${target}`, source: module, target, label: String(count) }
      });
    }
  }

  return [...layerNodes.values(), ...diagramNodes.values(), ...edges];
}

// Thanks to ArchLens for VS Code for this very nice graph styling
export function renderGraph(
  container: HTMLElement,
  graph: Map<string, Map<string, number>>,
  include: Set<string> | undefined,
  nodes: Map<string, Node>
) {
  const elements = graphToElements(graph, include, nodes);
  const font_height = 15;
  const block_extra_length = 50;
  const font_width = font_height * 0.61;
  const border_width = 2;
  function getLabelLength(node: any) {
    return node.data('label')?.length ?? 0;
  }
  const cy = cytoscape({
    container,
    elements,
    style: [
      {
        selector: 'node',
        style: {
          'background-color': '#F0FFFF',
          'width': (node: any) =>
            getLabelLength(node) * font_width + block_extra_length,
          'height': 40,
          'shape': 'polygon',
          'shape-polygon-points': (node: any) => {
            const label_width = getLabelLength(node) * font_width;
            const total = label_width + block_extra_length;
            const label_ratio = label_width / total;
            const angle_ratio = 10 / total;
            return [
              -1, -1,
              label_ratio, -1,
              label_ratio + angle_ratio, -0.1,
              1, -0.1,
              1, 1,
              -1, 1,
              -1, -1,
              -1, -0.1,
              label_ratio + angle_ratio, -0.1,
              -1, -0.1,
              -1, -1
            ];
          },
          'color': '#000000',
          'border-width': border_width,
          'border-color': '#000000',
          'border-cap': 'butt',
          'label': 'data(label)',
          'text-halign': 'right',
          'text-valign': 'top',
          'text-margin-x': (node: any) =>
            getLabelLength(node) * font_width * -1 - block_extra_length + 10,
          'text-margin-y': font_height + 1,
          'font-family': 'monospace',
          'font-size': font_height
        }
      },
      {
        selector: ':parent',
        style: {
          'background-opacity': 0.1,
          'border-width': 2,
          'label': 'data(label)'
        }
      },
      {
        selector: ':parent[layer = "Application"]',
        style: { 'background-color': '#D0E8FF', 'border-color': '#4A90D9' }
      },
      {
        selector: ':parent[layer = "Database"]',
        style: { 'background-color': '#D0FFD6', 'border-color': '#4AD95A' }
      },
      {
        selector: ':parent[layer = "Infrastructure"]',
        style: { 'background-color': '#FFF3D0', 'border-color': '#D9A84A' }
      },
      {
        selector: ':parent[layer = "Presentation"]',
        style: { 'background-color': '#F0D0FF', 'border-color': '#A84AD9' }
      },
      {
        selector: ':parent[layer = "External"]',
        style: { 'background-color': '#FFD0D0', 'border-color': '#D94A4A' }
      },
      {
        selector: ':parent[layer = "Unknown"]',
        style: { 'background-color': '#F0F0F0', 'border-color': '#999999' }
      },
      {
        selector: 'edge',
        style: {
          'width': 2,
          'line-color': '#000000',
          'target-arrow-shape': 'triangle-backcurve',
          'curve-style': 'bezier',
          'arrow-scale': 1.5,
          'label': 'data(label)',
          'color': '#fff',
          'text-valign': 'center',
          'font-family': 'monospace'
        }
      },
      {
        selector: 'edge[label]',
        style: {
          'label': 'data(label)',
        }
      },
      {
        selector: 'edge:selected',
        style: {
          'line-color': 'yellow',
          'target-arrow-color': 'yellow'
        }
      }
    ],
    layout: {
  name: 'elk',
  animate: false,
  nodeDimensionsIncludeLabels: true,
  elk: {
    algorithm: 'layered',
    'elk.direction': 'DOWN',
    'elk.layered.spacing.nodeNodeBetweenLayers': '100',
    'elk.spacing.nodeNode': '80',
    'elk.layered.compaction.onlyFinalLayersFrontsideNodeNodeBetweenLayers': 'true',
    'elk.padding': '[top=50, left=50, bottom=50, right=50]',
  }
}
  });
  cy.center();
  cy.one('layoutstop', () => cy.fit(undefined, 40));
  return cy;
}
