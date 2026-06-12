# GitNexus Plugin Quick Start

This guide will help you create and run your first GitNexus plugin in 5 minutes.

## Prerequisites

- Node.js 18+
- npm 8+
- GitNexus CLI installed

## Step 1: Create the Plugin Project

```bash
# Navigate to the plugins directory
cd gitnexus-plugins/

# Create the plugin directory
mkdir gitnexus-hello-plugin
cd gitnexus-hello-plugin

# Initialize npm project
npm init -y
```

## Step 2: Create Project Configuration

Create `package.json`:

```json
{
  "name": "gitnexus-hello-plugin",
  "version": "1.0.0",
  "type": "module",
  "description": "Hello World plugin for GitNexus",
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

Create `tsconfig.json`:

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

## Step 3: Write Plugin Code

Create `src/index.ts`:

```typescript
import { 
  ParserPlugin, 
  ParseResult, 
  ParserRegistry,
  createNode,
  createEdge,
  GraphNode,
  GraphRelationship 
} from 'gitnexus-shared';

/**
 * Hello World Parser Plugin
 * Parses .hello files, extracting simple key-value pairs
 */
export class HelloParserPlugin implements ParserPlugin {
  name = 'gitnexus-hello-plugin';
  version = '1.0.0';
  description = 'Hello World plugin for GitNexus';
  extensions = ['.hello'];
  
  async parse(content: string, filePath: string): Promise<ParseResult> {
    const nodes: GraphNode[] = [];
    const edges: GraphRelationship[] = [];
    
    // Parse simple key-value format
    // Format: key=value
    const lines = content.split('\n');
    let lineNumber = 0;
    
    for (const line of lines) {
      lineNumber++;
      const trimmed = line.trim();
      
      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      // Parse key=value format
      const equalIndex = trimmed.indexOf('=');
      if (equalIndex > 0) {
        const key = trimmed.substring(0, equalIndex).trim();
        const value = trimmed.substring(equalIndex + 1).trim();
        
        // Create node
        const node = createNode('HelloKey', {
          name: key,
          value,
          filePath,
          line: lineNumber
        });
        nodes.push(node);
        
        // Create a category node if it's a config type
        if (key.startsWith('config.')) {
          nodes.push(createNode('HelloConfig', {
            name: key,
            filePath,
            line: lineNumber
          }));
        }
      }
    }
    
    return {
      nodes,
      edges,
      metadata: {
        format: 'hello',
        linesProcessed: lineNumber
      }
    };
  }
  
  register(registry: ParserRegistry): void {
    registry.registerParser(this);
  }
  
  supports(filePath: string): boolean {
    return filePath.endsWith('.hello');
  }
}

export default new HelloParserPlugin();
```

## Step 4: Build the Plugin

```bash
# Install dependencies from the repo root (npm workspaces)
cd ../../   # Go to the repo root (GitNexus/)
npm install

# Build the plugin
cd gitnexus-plugins/gitnexus-hello-plugin
npm run build
```

## Step 5: Test the Plugin

### Create a Test File

Create `test.hello`:

```
# Hello World Configuration File
config.app.name=MyApp
config.app.version=1.0.0
database.host=localhost
database.port=5432
```

### Load and Test the Plugin

```bash
# Navigate to the GitNexus CLI directory
cd gitnexus/

# Scan and load plugins
gitnexus plugin scan ../gitnexus-plugins/

# List plugins to confirm it's loaded
gitnexus plugin list
```

## Complete Example: JSON Parser Plugin

If you need to parse more complex formats (like JSON), here is a complete example:

```typescript
import { 
  ParserPlugin, 
  ParseResult, 
  ParserRegistry,
  createNode,
  createEdge,
  GraphNode,
  GraphRelationship 
} from 'gitnexus-shared';

export class JsonParserPlugin implements ParserPlugin {
  name = 'gitnexus-json-plugin';
  version = '1.0.0';
  description = 'JSON parser plugin for GitNexus';
  extensions = ['.json'];
  
  async parse(content: string, filePath: string): Promise<ParseResult> {
    const nodes: GraphNode[] = [];
    const edges: GraphRelationship[] = [];
    
    try {
      const data = JSON.parse(content);
      this.processValue('root', data, filePath, null, nodes, edges);
      
      return {
        nodes,
        edges,
        metadata: {
          format: 'json',
          size: content.length
        }
      };
    } catch (error) {
      return {
        nodes: [],
        edges: [],
        metadata: {},
        error: `JSON parse error: ${(error as Error).message}`
      };
    }
  }
  
  private processValue(
    key: string, 
    value: any, 
    filePath: string, 
    parentId: string | null,
    nodes: GraphNode[],
    edges: GraphRelationship[]
  ): void {
    const node = createNode('JsonProperty', {
      name: key,
      value: typeof value === 'object' ? null : String(value),
      type: Array.isArray(value) ? 'array' : typeof value,
      filePath
    });
    nodes.push(node);
    
    if (parentId) {
      edges.push(createEdge('HAS_PROPERTY', parentId, node.id, {
        confidence: 1.0,
        reason: 'JSON property'
      }));
    }
    
    if (typeof value === 'object' && value !== null) {
      for (const [childKey, childValue] of Object.entries(value)) {
        this.processValue(childKey, childValue, filePath, node.id, nodes, edges);
      }
    }
  }
  
  register(registry: ParserRegistry): void {
    registry.registerParser(this);
  }
  
  supports(filePath: string): boolean {
    return filePath.endsWith('.json');
  }
}

export default new JsonParserPlugin();
```

## Next Steps

- Read the [full development guide](../gitnexus-plugins/README.md) for advanced features
- Read the [API Reference](api-reference.md) for all available interfaces
- Read the [LLM Development Guide](llm-guide.md) for AI-assisted plugin development
- Browse the [plugins directory](../gitnexus-plugins/) for more reference

## FAQ

**Q: Plugin is loaded but not working?**
A: Make sure the plugin is enabled: `gitnexus plugin enable <plugin-name>`

**Q: How to debug a plugin?**
A: Set the environment variable `GITNEXUS_DEBUG=1` and check the logs.

**Q: Can plugins depend on other npm packages?**
A: Yes, just add them to the `dependencies` in your `package.json`.

**Q: How to reference gitnexus-shared?**
A: Use `"gitnexus-shared": "*"` in your plugin's `package.json`. GitNexus uses npm workspaces, so `npm install` at the repo root links everything automatically. No manual `file:` paths or `npm link` needed.
