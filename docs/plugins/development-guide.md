# GitNexus Plugin Development Guide

## 1. Overview

The GitNexus plugin system allows developers to extend parsing capabilities, supporting more file types and language features. This guide details how to develop GitNexus plugins.

## 2. Plugin Architecture

### 2.1 Core Components

```
┌─────────────────────────────────────────────────┐
│                     GitNexus Core                     │
├─────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ Parser API  │  │ Analyzer API│  │ Processor API│   │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
├─────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ Plugin A    │  │ Plugin B    │  │ Plugin C    │   │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────┘
```

### 2.2 Plugin Types

| Plugin Type | Purpose | Interface |
|---------|------|------|
| **Parser Plugin** | Parse specific file types | `ParserPlugin` |
| **Analyzer Plugin** | Analyze code semantics | `AnalyzerPlugin` |
| **Processor Plugin** | Process specific language features | `ProcessorPlugin` |
| **Integration Plugin** | Integrate external tools | `IntegrationPlugin` |

## 3. Environment Setup

### 3.1 Creating a Plugin Project

```bash
# Enter the plugins directory
cd gitnexus-plugins/

# Create the plugin directory
mkdir gitnexus-my-plugin
cd gitnexus-my-plugin/

# Initialize the project
npm init -y
```

### 3.2 Project Structure

```
gitnexus-my-plugin/
├── src/
│   └── index.ts          # Plugin main file
├── package.json
├── tsconfig.json
└── README.md
```

### 3.3 package.json Configuration

```json
{
  "name": "gitnexus-my-plugin",
  "version": "1.0.0",
  "type": "module",
  "description": "My custom plugin for GitNexus",
  "main": "dist/index.js",
  "gitnexus": { "plugin": true },
  "scripts": {
    "build": "tsc"
  },
  "dependencies": {
    "gitnexus-shared": "*"
  }
}
```

**Note**: GitNexus uses **npm workspaces** to manage plugin dependencies. The root `package.json` declares `gitnexus-shared` and `gitnexus-plugins/*` as workspaces. Use `"gitnexus-shared": "*"` in your plugin's `package.json` — npm will automatically resolve and link the correct version. No manual `file:` paths or `npm link` needed.

After creating the plugin, run `npm install` **from the repo root** (not the plugin directory) to link everything:

```bash
cd /path/to/GitNexus   # repo root
npm install
```

### 3.4 tsconfig.json Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"]
}
```

## 4. Developing a Parser Plugin

### 4.1 Parser Plugin Interface

```typescript
import { ParserPlugin, ParseResult, ParserRegistry, GraphNode, GraphRelationship, createNode, createEdge } from 'gitnexus-shared';

export interface MyPluginConfig {
  strictMode?: boolean;
}

export class MyParserPlugin implements ParserPlugin {
  name = 'gitnexus-my-plugin';
  version = '1.0.0';
  description = 'My custom parser plugin';
  extensions = ['.myext', '.myformat'];
  
  private config: MyPluginConfig = {};
  
  async init(config: MyPluginConfig): Promise<void> {
    this.config = config;
  }
  
  async parse(content: string, filePath: string): Promise<ParseResult> {
    const nodes: GraphNode[] = [];
    const edges: GraphRelationship[] = [];
    
    try {
      // Parse content
      const parsed = this.parseContent(content, filePath);
      
      // Generate nodes
      for (const item of parsed.items) {
        const node = createNode('MyNode', {
          name: item.name,
          value: item.value,
          filePath
        });
        nodes.push(node);
        
        // Generate edges (if there is a parent node)
        if (item.parent) {
          edges.push(createEdge('CONTAINS', item.parent, node.id, {
            confidence: 1.0,
            reason: 'parent-child relationship'
          }));
        }
      }
      
      return {
        nodes,
        edges,
        metadata: {
          format: 'myformat',
          itemCount: parsed.items.length
        }
      };
    } catch (error) {
      return {
        nodes: [],
        edges: [],
        metadata: {},
        error: (error as Error).message
      };
    }
  }
  
  private parseContent(content: string, filePath: string): any {
    // Implement parsing logic
    return { items: [] };
  }
  
  register(registry: ParserRegistry): void {
    registry.registerParser(this);
  }
  
  supports(filePath: string): boolean {
    return this.extensions.some(ext => filePath.endsWith(ext));
  }
  
  async dispose(): Promise<void> {
    // Clean up resources
  }
}

export default new MyParserPlugin();
```

### 4.2 Parse Result Format

```typescript
interface ParseResult {
  /** Nodes generated from parsing */
  nodes: GraphNode[];
  
  /** Edges generated from parsing */
  edges: GraphRelationship[];
  
  /** Metadata */
  metadata: Record<string, any>;
  
  /** Error message */
  error?: string;
}

interface GraphNode {
  id: string;
  label: NodeLabel;
  properties: NodeProperties;
  filePath: string;
  startLine?: number;
  endLine?: number;
}

interface GraphRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationshipType;
  confidence: number;
  reason: string;
  properties?: Record<string, any>;
}
```

## 5. Developing an Analyzer Plugin

### 5.1 Analyzer Plugin Interface

```typescript
import { 
  AnalyzerPlugin, 
  AnalysisResult, 
  AnalyzerRegistry, 
  AnalysisContext 
} from 'gitnexus-shared';

export class MyAnalyzerPlugin implements AnalyzerPlugin {
  name = 'gitnexus-my-analyzer';
  version = '1.0.0';
  description = 'My custom analyzer plugin';
  languages = ['java', 'typescript'];
  
  async analyze(node: any, context: AnalysisContext): Promise<AnalysisResult> {
    const results = [];
    
    // Analyze node
    if (node.type === 'class_declaration') {
      results.push({
        type: 'my.analyzed_class',
        name: node.name?.text,
        location: {
          filePath: context.filePath,
          startLine: node.startLine,
          endLine: node.endLine
        },
        properties: {
          modifiers: node.modifiers?.map((m: any) => m.text) || []
        }
      });
    }
    
    return {
      results,
      metadata: {
        analyzer: this.name,
        language: context.language
      }
    };
  }
  
  register(registry: AnalyzerRegistry): void {
    registry.registerAnalyzer(this);
  }
  
  supports(language: string): boolean {
    return this.languages.includes(language);
  }
}

export default new MyAnalyzerPlugin();
```

### 5.2 Analysis Context

```typescript
interface AnalysisContext {
  filePath: string;
  language: string;
  semanticModel: any;
  parser: any;
  config: AnalysisConfig;
}

interface AnalysisConfig {
  depth?: number;
  cache?: boolean;
  timeout?: number;
  [key: string]: any;
}
```

## 6. Developing a Processor Plugin

### 6.1 Processor Plugin Interface

```typescript
import { 
  ProcessorPlugin, 
  ProcessorRegistry, 
  ProcessContext 
} from 'gitnexus-shared';

export class MyProcessorPlugin implements ProcessorPlugin {
  name = 'gitnexus-my-processor';
  version = '1.0.0';
  description = 'My custom processor plugin';
  phase = 'post-parse';
  priority = 100;
  
  async process(data: any, context: ProcessContext): Promise<any> {
    // Process data
    const { knowledgeGraph } = context;
    
    // Add extra nodes and edges
    const extraNodes = this.generateExtraNodes(data);
    const extraEdges = this.generateExtraEdges(data);
    
    // Add extra nodes and edges to the knowledge graph
    for (const node of extraNodes) {
      knowledgeGraph.addNode(node);
    }
    for (const edge of extraEdges) {
      knowledgeGraph.addEdge(edge);
    }
    
    return {
      ...data,
      processed: true,
      processor: this.name
    };
  }
  
  private generateExtraNodes(data: any): any[] {
    return [];
  }
  
  private generateExtraEdges(data: any): any[] {
    return [];
  }
  
  register(registry: ProcessorRegistry): void {
    registry.registerProcessor(this);
  }
}

export default new MyProcessorPlugin();
```

### 6.2 Process Context

```typescript
interface ProcessContext {
  phase: string;
  projectPath: string;
  knowledgeGraph: any;
  config: ProcessConfig;
}

interface ProcessConfig {
  parallel?: boolean;
  threads?: number;
  batchSize?: number;
  [key: string]: any;
}
```

## 7. Developing an Integration Plugin

### 7.1 Integration Plugin Interface

```typescript
import { 
  IntegrationPlugin, 
  IntegrationRegistry, 
  IntegrationContext,
  IntegrationResult 
} from 'gitnexus-shared';

export class MyIntegrationPlugin implements IntegrationPlugin {
  name = 'gitnexus-my-integration';
  version = '1.0.0';
  description = 'My custom integration plugin';
  target = 'my-service';
  
  async execute(data: any, context: IntegrationContext): Promise<IntegrationResult> {
    try {
      // Execute integration operation
      const result = await this.callExternalService(data, context);
      
      return {
        success: true,
        data: result,
        metadata: {
          integration: this.name,
          target: this.target
        }
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }
  
  private async callExternalService(data: any, context: IntegrationContext): Promise<any> {
    // Call external service
    return {};
  }
  
  register(registry: IntegrationRegistry): void {
    registry.registerIntegration(this);
  }
}

export default new MyIntegrationPlugin();
```

## 8. Markdown Plugin (Profile System)

GitNexus provides a powerful Markdown plugin that supports customized parsing of different document types through **Profiles**.

### 8.1 Built-in Profiles

| Profile | Match Condition | Parsed Content |
|---------|-----------|----------|
| `generic` | Default match for all Markdown files | Headings, code blocks, links, images, TODOs, tables |
| `api-docs` | Contains `@api`/`## API`/`swagger` | Same as above + API-specific parsing |
| `adr` | Contains `## Status`/`Architecture Decision Record` | Same as above + ADR structure |

### 8.2 Custom Profile

Create `my-profile.ts`:

```typescript
import { MarkdownProfile, SectionParser, createNode, GraphNode } from 'gitnexus-shared';

// Custom parser: extract specific sections
class MySectionParser implements SectionParser {
  name = 'my-section';
  
  parse(lines: string[], startIndex: number, filePath: string, context: any) {
    const line = lines[startIndex];
    const match = line.match(/^## My Special Section$/);
    if (!match) return null;
    
    // Extract section content
    const contentLines: string[] = [];
    let j = startIndex + 1;
    while (j < lines.length && !lines[j].startsWith('## ')) {
      contentLines.push(lines[j]);
      j++;
    }
    
    const sectionNode = createNode('MySection', {
      name: 'My Special Section',
      filePath,
      content: contentLines.join('\n'),
      startLine: startIndex + 1
    });
    
    const nodes: GraphNode[] = [sectionNode];
    const edges = [];
    
    if (context.currentHeadingId) {
      edges.push(createEdge('HAS_SECTION', context.currentHeadingId, sectionNode.id, {}));
    }
    
    return { nodes, edges, nextIndex: j };
  }
}

// Custom Profile
export const myDocProfile: MarkdownProfile = {
  name: 'my-doc',
  detect: (content: string) => content.includes('## My Special Section'),
  parsers: [new MySectionParser()],
  priority: 20 // High priority
};
```

### 8.3 Loading a Custom Profile

```bash
# Method 1: Load via plugin configuration
gitnexus plugin load ../gitnexus-plugins/markdown-plugin \
  --config '{"customProfiles":["./my-profile.js"]}'

# Method 2: Use built-in profiles
# (api-docs, adr, etc. are auto-detected)
```

## 9. Testing Plugins

### 9.1 Unit Testing

```typescript
import { describe, it, expect, beforeEach } from 'jest';
import { MyParserPlugin } from '../src/index';

describe('MyParserPlugin', () => {
  let plugin: MyParserPlugin;
  
  beforeEach(() => {
    plugin = new MyParserPlugin();
  });
  
  it('should have correct name', () => {
    expect(plugin.name).toBe('gitnexus-my-plugin');
  });
  
  it('should support correct file extensions', () => {
    expect(plugin.supports('test.myext')).toBe(true);
    expect(plugin.supports('test.txt')).toBe(false);
  });
  
  it('should parse valid content', async () => {
    const content = 'sample content';
    const result = await plugin.parse(content, '/path/to/test.myext');
    
    expect(result.nodes).toBeDefined();
    expect(result.edges).toBeDefined();
    expect(result.error).toBeUndefined();
  });
  
  it('should handle parse errors', async () => {
    const content = 'invalid content';
    const result = await plugin.parse(content, '/path/to/test.myext');
    
    expect(result.error).toBeDefined();
  });
});
```

### 9.2 Integration Testing

```typescript
import { describe, it, expect } from 'jest';
import { pluginManager } from 'gitnexus-core/plugins';
import { loadPlugin, unloadPlugin } from 'gitnexus-core/plugins/plugin-loader';

describe('Plugin Integration', () => {
  beforeEach(async () => {
    // Load test plugin
    await loadPlugin({ pluginPath: './test-plugin' });
  });
  
  afterEach(async () => {
    // Cleanup
    unloadPlugin('gitnexus-test-plugin');
  });
  
  it('should load and register plugin', () => {
    const plugin = pluginManager.getPlugin('gitnexus-test-plugin');
    expect(plugin).toBeDefined();
  });
  
  it('should parse files using plugin', async () => {
    const parser = pluginManager.parserRegistry.getParser('/path/to/test.myext');
    expect(parser).toBeDefined();
  });
});
```

## 10. Debugging Tips

### 10.1 Enable Debug Mode

```bash
GITNEXUS_DEBUG=1 gitnexus analyze
```

### 10.2 View Logs

```bash
# View plugin logs
cat ~/.gitnexus/logs/plugin.log

# View logs in real time
tail -f ~/.gitnexus/logs/plugin.log
```

### 10.3 Test a Single Plugin

```bash
# Load the plugin
gitnexus plugin load ../gitnexus-plugins/my-plugin/

# Test the plugin
gitnexus analyze --verbose

# Check plugin status
gitnexus plugin status
```

## 11. Publishing Plugins

### 11.1 Publish to npm

```bash
# Log in to npm
npm login

# Publish
cd gitnexus-plugins/my-plugin/
npm publish

# Publish with a specific tag
npm publish --tag beta
```

### 11.2 Plugin Naming Conventions

- Parser plugin: `gitnexus-[format]-plugin`
- Analyzer plugin: `gitnexus-[language]-plugin`
- Processor plugin: `gitnexus-[feature]-plugin`
- Integration plugin: `gitnexus-[service]-integration`

Examples:
- `gitnexus-xml-plugin`
- `gitnexus-java-plugin`
- `gitnexus-spring-plugin`
- `gitnexus-github-integration`

## 12. Best Practices

### 12.1 Performance Optimization

- **Cache parse results**: Avoid re-parsing the same content
- **Streaming processing**: Use streaming parsing for large files
- **Parallel processing**: Utilize Worker threads for parallel processing
- **Lazy loading**: Load plugin features on demand

### 12.2 Error Handling

```typescript
async parse(content: string, filePath: string): Promise<ParseResult> {
  try {
    // Parse logic
  } catch (error) {
    // Log error
    console.error(`Parse error in ${filePath}:`, error);
    
    // Return error result
    return {
      nodes: [],
      edges: [],
      metadata: {},
      error: `Parse failed: ${(error as Error).message}`
    };
  }
}
```

### 12.3 Configuration Management

```typescript
interface PluginConfig {
  strictMode?: boolean;
  cacheEnabled?: boolean;
  maxFileSize?: number;
  customOption?: string;
}

async init(config: PluginConfig = {}): Promise<void> {
  this.config = {
    strictMode: false,
    cacheEnabled: true,
    maxFileSize: 1024 * 1024,
    ...config
  };
}
```

### 12.4 Resource Cleanup

```typescript
private resources: any[] = [];

async dispose(): Promise<void> {
  // Clean up all resources
  for (const resource of this.resources) {
    if (typeof resource.dispose === 'function') {
      resource.dispose();
    }
  }
  this.resources = [];
  
  // Clear cache
  this.cache?.clear();
  
  // Close connections
  await this.connection?.close();
}
```

## 13. Frequently Asked Questions

### 13.1 Plugin Loading Failure

**Problem**: `Module not found` error when loading a plugin, especially `Cannot find package 'gitnexus-shared'`

**Solutions**:
- Ensure you ran `npm install` **from the repo root** so npm workspaces create the correct symlinks
- Verify your plugin's `package.json` uses `"gitnexus-shared": "*"` (not a `file:` path)
- Check the root `package.json` includes `"gitnexus-plugins/*"` in the `workspaces` array
- Verify Node.js version compatibility

### 13.2 Parsing Performance Issues

**Problem**: Poor performance when parsing large files

**Solutions**:
- Implement streaming parsing
- Use Worker threads for parallel processing
- Enable caching mechanism

### 13.3 Plugin Conflicts

**Problem**: Multiple plugins handling the same file type

**Solutions**:
- Adjust plugin priorities
- Clarify plugin processing scope
- Use the `supports` method for precise matching

## 14. Related Documentation

- [Plugin System Overview](../gitnexus-plugins/README.md) - View all available plugins
- [API Reference](api-reference.md) - Complete plugin API documentation
- [LLM Development Guide](llm-guide.md) - How to use LLMs to assist plugin development
- [Quick Start](quickstart.md) - Create your first plugin in 5 minutes
- [Troubleshooting](troubleshooting.md) - Common problem resolution

## 15. Contact

- **GitHub Issues**: https://github.com/abhigyanpatwari/GitNexus/issues
- **Discord**: https://discord.gg/gitnexus
- **Email**: support@gitnexus.io

---

**Version**: 1.1.0
**Last Updated**: 2026-05-07
**Maintainer**: GitNexus Team
