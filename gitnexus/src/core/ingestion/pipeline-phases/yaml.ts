import type { PipelinePhase, PipelineContext, PhaseResult } from './types.js';
import { getPhaseOutput } from './types.js';
import { processYaml } from '../yaml-processor.js';
import { readFileContents } from '../filesystem-walker.js';
import type { StructureOutput } from './structure.js';
import { isDev } from '../utils/env.js';
import { logger } from '../../logger.js';

export interface YamlOutput {
  filesProcessed: number;
  nodesCreated: number;
  edgesCreated: number;
}

export const yamlPhase: PipelinePhase<YamlOutput> = {
  name: 'yaml',
  deps: ['structure'],

  async execute(
    ctx: PipelineContext,
    deps: ReadonlyMap<string, PhaseResult<unknown>>,
  ): Promise<YamlOutput> {
    const { scannedFiles } = getPhaseOutput<StructureOutput>(deps, 'structure');

    const yamlScanned = scannedFiles.filter(
      (f) => f.path.endsWith('.yaml') || f.path.endsWith('.yml'),
    );

    if (yamlScanned.length === 0) {
      return { filesProcessed: 0, nodesCreated: 0, edgesCreated: 0 };
    }

    const yamlContents = await readFileContents(
      ctx.repoPath,
      yamlScanned.map((f) => f.path),
    );
    const yamlFiles = yamlScanned
      .filter((f) => yamlContents.has(f.path))
      .map((f) => ({ path: f.path, content: yamlContents.get(f.path)! }));
    const result = processYaml(ctx.graph, yamlFiles);

    if (isDev) {
      logger.info(
        `  YAML: ${result.nodesCreated} config entries from ${result.filesProcessed} files`,
      );
    }

    return result;
  },
};
