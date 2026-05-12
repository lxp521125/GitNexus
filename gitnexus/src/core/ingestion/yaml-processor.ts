import * as path from 'node:path';
import * as yaml from 'js-yaml';
import type { GraphNode, GraphRelationship } from 'gitnexus-shared';
import type { KnowledgeGraph } from '../graph/types.js';

interface YamlWalkContext {
  nodes: GraphNode[];
  edges: GraphRelationship[];
  filePath: string;
}

function walkYaml(data: unknown, parentId: string, ctx: YamlWalkContext, depth: number): void {
  if (data === null || data === undefined) return;

  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const nodeId = `${parentId}[${i}]`;

      if (typeof item !== 'object' || item === null) {
        ctx.nodes.push({
          id: nodeId,
          label: 'CodeElement',
          properties: {
            name: `[${i}]`,
            index: i,
            value: item === null ? 'null' : String(item),
            configType: item === null ? 'null' : typeof item,
            configEntryType: 'yaml-array-item',
            filePath: ctx.filePath,
            depth,
          },
        });
      } else {
        ctx.nodes.push({
          id: nodeId,
          label: 'CodeElement',
          properties: {
            name: `[${i}]`,
            index: i,
            filePath: ctx.filePath,
            depth,
            configEntryType: 'yaml-array-item',
          },
        });
        walkYaml(item, nodeId, ctx, depth + 1);
      }

      ctx.edges.push({
        id: `${parentId}->${nodeId}`,
        sourceId: parentId,
        targetId: nodeId,
        type: 'CONTAINS',
        confidence: 1.0,
        reason: 'yaml-array-item',
      });
    }
  } else if (typeof data === 'object' && data !== null) {
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const nodeId = `${parentId}:${key}`;

      if (typeof value === 'object' && value !== null) {
        ctx.nodes.push({
          id: nodeId,
          label: 'CodeElement',
          properties: {
            name: key,
            filePath: ctx.filePath,
            depth,
            configType: 'group',
            configEntryType: 'yaml-section',
          },
        });
        walkYaml(value, nodeId, ctx, depth + 1);
      } else {
        ctx.nodes.push({
          id: nodeId,
          label: 'CodeElement',
          properties: {
            name: key,
            value: value === null ? 'null' : String(value),
            configType:
              value === null
                ? 'null'
                : typeof value === 'number'
                  ? 'number'
                  : typeof value === 'boolean'
                    ? 'boolean'
                    : 'string',
            configEntryType: 'yaml-property',
            filePath: ctx.filePath,
            depth,
          },
        });
      }

      ctx.edges.push({
        id: `${parentId}->${nodeId}`,
        sourceId: parentId,
        targetId: nodeId,
        type: 'CONTAINS',
        confidence: 1.0,
        reason: 'yaml-hierarchy',
      });
    }
  }
}

export interface YamlProcessResult {
  filesProcessed: number;
  nodesCreated: number;
  edgesCreated: number;
}

export function processYaml(
  graph: KnowledgeGraph,
  files: { path: string; content: string }[],
): YamlProcessResult {
  let filesProcessed = 0;
  let nodesCreated = 0;
  let edgesCreated = 0;

  for (const file of files) {
    try {
      const data = yaml.load(file.content);
      if (data === undefined || data === null) continue;

      filesProcessed++;

      const rootId = `yaml:${file.path}`;
      graph.addNode({
        id: rootId,
        label: 'CodeElement',
        properties: {
          name: path.basename(file.path),
          filePath: file.path,
          configType: 'yaml',
          configEntryType: 'yaml-config',
        },
      });
      nodesCreated++;

      if (typeof data === 'object') {
        const ctx: YamlWalkContext = { nodes: [], edges: [], filePath: file.path };
        walkYaml(data, rootId, ctx, 1);

        for (const node of ctx.nodes) {
          graph.addNode(node);
          nodesCreated++;
        }
        for (const edge of ctx.edges) {
          graph.addRelationship(edge);
          edgesCreated++;
        }
      } else {
        const valueId = `${rootId}:value`;
        graph.addNode({
          id: valueId,
          label: 'CodeElement',
          properties: {
            name: path.basename(file.path),
            value: String(data),
            configType: typeof data,
            configEntryType: 'yaml-property',
            filePath: file.path,
            depth: 1,
          },
        });
        nodesCreated++;
        graph.addRelationship({
          id: `${rootId}->${valueId}`,
          sourceId: rootId,
          targetId: valueId,
          type: 'CONTAINS',
          confidence: 1.0,
          reason: 'yaml-hierarchy',
        });
        edgesCreated++;
      }
    } catch {
      continue;
    }
  }

  return { filesProcessed, nodesCreated, edgesCreated };
}
