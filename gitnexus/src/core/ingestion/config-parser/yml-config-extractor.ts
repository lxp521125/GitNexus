/**
 * YML Configuration Extractor
 *
 * Parses Spring Boot application.yml / application.yaml files and extracts
 * configuration entries as first-class symbol nodes in the knowledge graph.
 *
 * Design:
 * - Standalone processor (no tree-sitter-yaml available)
 * - Uses js-yaml for parsing (already a project dependency)
 * - Config entries are stored as nodes with label 'ConfigEntry'
 * - The full property path (e.g., "myapp.database.host") becomes the symbol name
 * - Flat value nodes are created for primitive values
 *
 * This enables:
 * - `@Value("${myapp.database.host}")` → ConfigEntry linking
 * - Configuration inheritance tracking (Spring profiles)
 * - Impact analysis when config changes
 */

import { createRequire } from 'node:module';
import { generateId } from '../../../lib/utils.js';
import type { GraphNode, GraphRelationship } from 'gitnexus-shared';
import { KnowledgeGraph } from '../../graph/types.js';

const _require = createRequire(import.meta.url);
const yaml = _require('js-yaml') as typeof import('js-yaml');

export interface ConfigEntry {
  fullPath: string;
  key: string;
  value: unknown;
  parentPath: string | null;
  filePath: string;
  startLine: number;
  endLine: number;
}

const SPRING_CONFIG_PATTERNS = [
  'application.yml',
  'application.yaml',
  'application-local.yml',
  'application-dev.yml',
  'application-prod.yml',
  'application-test.yml',
  'bootstrap.yml',
  'bootstrap.yaml',
];

function isSpringConfigFile(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, '/');
  return SPRING_CONFIG_PATTERNS.some((pattern) => normalized.endsWith(pattern));
}

function flattenYaml(
  obj: unknown,
  prefix: string,
  filePath: string,
  lines: string[],
  result: ConfigEntry[],
): void {
  if (obj === null || obj === undefined) return;

  if (typeof obj === 'object' && !Array.isArray(obj)) {
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object' && value !== null) {
        flattenYaml(value, fullPath, filePath, lines, result);
      } else {
        const valueStr = String(value);
        const searchStr = `${key}: ${valueStr}`;
        let startLine = 1;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(searchStr) || lines[i].trim() === `${key}: ${valueStr}`) {
            startLine = i + 1;
            break;
          }
        }
        result.push({
          fullPath,
          key,
          value,
          parentPath: prefix || null,
          filePath,
          startLine,
          endLine: startLine,
        });
      }
    }
  }
}

export function parseYamlConfig(content: string, filePath: string): ConfigEntry[] {
  const result: ConfigEntry[] = [];
  try {
    const lines = content.split('\n');
    const parsed = yaml.load(content, { schema: yaml.JSON_SCHEMA });
    flattenYaml(parsed, '', filePath, lines, result);
  } catch {
    // Invalid YAML - skip
  }
  return result;
}

export function processYamlConfig(
  graph: KnowledgeGraph,
  filePath: string,
  content: string,
): void {
  if (!isSpringConfigFile(filePath)) return;

  const entries = parseYamlConfig(content, filePath);
  if (entries.length === 0) return;

  const fileId = generateId('File', filePath);
  if (graph.getNode(fileId) === undefined) return;

  for (const entry of entries) {
    const nodeId = generateId('ConfigEntry', entry.fullPath);

    if (graph.getNode(nodeId) !== undefined) continue;

    const node: GraphNode = {
      id: nodeId,
      label: 'CodeElement',
      properties: {
        name: entry.fullPath,
        filePath: entry.filePath,
        startLine: entry.startLine,
        endLine: entry.endLine,
        isConfig: true,
        configEntryPath: entry.fullPath,
      },
    };

    graph.addNode(node);

    const relId = generateId('CONTAINS', `${fileId}->${nodeId}`);
    const relationship: GraphRelationship = {
      id: relId,
      type: 'CONTAINS',
      sourceId: fileId,
      targetId: nodeId,
      confidence: 1.0,
      reason: 'yml-config',
    };

    graph.addRelationship(relationship);
  }
}

export function isYamlConfigFile(filePath: string): boolean {
  return isSpringConfigFile(filePath);
}