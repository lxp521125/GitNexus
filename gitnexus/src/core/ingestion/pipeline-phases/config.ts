/**
 * Phase: config
 *
 * Processes Spring Boot YAML configuration files (application.yml, etc.)
 * and extracts configuration entries as first-class symbol nodes in the
 * knowledge graph. Also handles @Value annotation references to config entries.
 *
 * This enables:
 * - Config entry → Java `@Value("${...}")` reference linking
 * - Impact analysis when config changes
 * - Configuration inheritance tracking (Spring profiles)
 *
 * @deps    structure, parse
 * @reads   scannedFiles (from structure), configReferences (from parse)
 * @writes  graph (ConfigEntry nodes + CONTAINS edges from File, ACCESSES edges from fields)
 */

import type { PipelinePhase, PipelineContext, PhaseResult } from './types.js';
import { getPhaseOutput } from './types.js';
import { processYamlConfig, isYamlConfigFile } from '../config-parser/yml-config-extractor.js';
import { readFileContents } from '../filesystem-walker.js';
import type { StructureOutput } from './structure.js';
import type { ParseOutput } from './parse.js';
import { isDev } from '../utils/env.js';
import { generateId } from '../../../lib/utils.js';

export interface ConfigOutput {
  configFiles: number;
  configEntries: number;
  configReferences: number;
}

export const configPhase: PipelinePhase<ConfigOutput> = {
  name: 'config',
  deps: ['structure', 'parse'],

  async execute(
    ctx: PipelineContext,
    deps: ReadonlyMap<string, PhaseResult<unknown>>,
  ): Promise<ConfigOutput> {
    const { scannedFiles } = getPhaseOutput<StructureOutput>(deps, 'structure');
    const parseOutput = getPhaseOutput<ParseOutput>(deps, 'parse');

    const configScanned = scannedFiles.filter((f) => isYamlConfigFile(f.path));

    let totalEntries = 0;
    if (configScanned.length > 0) {
      const configContents = await readFileContents(
        ctx.repoPath,
        configScanned.map((f) => f.path),
      );

      for (const { path } of configScanned) {
        const content = configContents.get(path);
        if (!content) continue;

        const beforeNodes = ctx.graph.nodeCount;
        processYamlConfig(ctx.graph, path, content);
        const afterNodes = ctx.graph.nodeCount;
        totalEntries += afterNodes - beforeNodes;
      }
    }

    // Process @Value annotation references
    let configReferencesLinked = 0;
    const configReferences = parseOutput.configReferences || [];
    for (const ref of configReferences) {
      // Find the field node (Property)
      const fieldId = generateId('Property', `${ref.filePath}:${ref.fieldName}`);
      const fieldNode = ctx.graph.getNode(fieldId);
      
      if (!fieldNode) continue;

      // Find the config entry node
      const configEntryId = generateId('ConfigEntry', ref.configPath);
      const configNode = ctx.graph.getNode(configEntryId);

      if (!configNode) continue;

      // Create ACCESSES relationship
      const relId = generateId('ACCESSES', `${fieldId}->${configEntryId}`);
      ctx.graph.addRelationship({
        id: relId,
        type: 'ACCESSES',
        sourceId: fieldId,
        targetId: configEntryId,
        confidence: 1.0,
        reason: 'spring-value',
      });
      configReferencesLinked++;
    }

    if (isDev) {
      console.log(
        `  Config: ${configScanned.length} YML files, ${totalEntries} config entries, ${configReferencesLinked} @Value references linked`,
      );
    }

    return {
      configFiles: configScanned.length,
      configEntries: totalEntries,
      configReferences: configReferencesLinked,
    };
  },
};