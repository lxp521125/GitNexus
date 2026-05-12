import { SupportedLanguages } from 'gitnexus-shared';
import { defineLanguage } from '../language-provider.js';

export const yamlProvider = defineLanguage({
  id: SupportedLanguages.Yaml,
  parseStrategy: 'standalone',
  extensions: ['.yaml', '.yml'],
  entryPointPatterns: [],
  astFrameworkPatterns: [],
  treeSitterQueries: '',
  typeConfig: {
    declarationNodeTypes: new Set(),
    extractDeclaration: () => null,
    extractParameter: () => null,
  },
  exportChecker: () => false,
  importResolver: () => null,
});
