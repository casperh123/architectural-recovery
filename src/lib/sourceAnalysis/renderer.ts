import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';

cytoscape.use(dagre);

function graphToElements(graph: Map<string, Map<string, number>>) {
  const nodes = new Map();
  const edges: any[] = [];

  for (const [module, deps] of graph) {
    if (!nodes.has(module)) {
      nodes.set(module, { data: { id: module, label: module } });
    }

    for (const [target, count] of deps) {
      if (!nodes.has(target)) {
        nodes.set(target, { data: { id: target, label: target } });
      }

      edges.push({
        data: {
          id: `${module}->${target}`,
          source: module,
          target: target,
          label: String(count)
        }
      });
    }
  }

  return [...nodes.values(), ...edges];
}

// Thanks to ArchLens for VS Code for this very nice graph styling
export function renderGraph(
  container: HTMLElement,
  graph: Map<string, Map<string, number>>
) {
  const elements = graphToElements(graph);

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
        selector: '.DELETED',
        style: {
          'background-color': '#f00',
          'line-color': '#f00'
        }
      },

      {
        selector: '.CREATED',
        style: {
          'background-color': '#0f0',
          'line-color': '#0f0'
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
      name: 'dagre',
      rankDir: 'TB',
      nodeSep: 50,
      rankSep: 60,
      edgeSep: 80,
      spacingFactor: 1.5
    }
  });

  cy.center();

  return cy;
}
