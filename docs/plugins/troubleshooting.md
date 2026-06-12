# GitNexus Plugin Troubleshooting Guide

This guide helps you solve common issues encountered during plugin development and usage.

## Table of Contents

- [Plugin Loading Issues](#plugin-loading-issues)
- [Parsing Issues](#parsing-issues)
- [Performance Issues](#performance-issues)
- [Configuration Issues](#configuration-issues)
- [Debugging Tips](#debugging-tips)

---

## Plugin Loading Issues

### 1. Plugin Load Failure

**Symptoms**:
```
Error: Cannot find module 'gitnexus-my-plugin'
```

**Possible Causes**:
- Plugin not properly built
- Incorrect path
- Missing dependencies

**Solutions**:

```bash
# 1. Ensure the plugin is built
cd /path/to/your/plugin
npm run build

# 2. Check the path is correct
# Use absolute path
gitnexus plugin load /absolute/path/to/plugin

# 3. Install dependencies
cd /path/to/your/plugin
npm install
```

### 2. Dependency Resolution (`gitnexus-shared` not found)

**Symptoms**:
```
Error: Cannot find package 'gitnexus-shared'
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'gitnexus-shared'
```

**Root Cause**: The plugin cannot resolve `gitnexus-shared`. This usually happens when npm workspaces are not properly linked.

**Solutions**:

```bash
# 1. Make sure the plugin uses the workspace reference in package.json
#    "dependencies": { "gitnexus-shared": "*" }  (NOT "file:...")

# 2. Run npm install from the repo root to link all workspaces
cd /path/to/GitNexus   # repo root
npm install

# 3. Verify the symlink exists
ls -la node_modules/gitnexus-shared
# Should show: gitnexus-shared -> ../gitnexus-shared

# 4. Verify the root package.json includes the workspaces
#    "workspaces": ["gitnexus-shared", "gitnexus-plugins/*"]
```

### 3. TypeScript Compilation Errors

**Symptoms**:
```
error TS2307: Cannot find module 'gitnexus-shared'
```

**Solutions**:

```json
// tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true
  }
}
```

---

## Parsing Issues

### 1. Plugin Does Not Recognize File

**Symptoms**: Plugin is loaded but file is not being parsed

**Diagnostic Steps**:

```bash
# 1. Confirm plugin supports the file type
gitnexus plugin list

# 2. Check plugin status
gitnexus plugin status
```

**Solutions**:

Check the `supports` method:

```typescript
supports(filePath: string): boolean {
  const ext = filePath.split('.').pop()?.toLowerCase();
  return this.extensions.includes(`.${ext}`);
}
```

### 2. Parse Result Is Empty

**Symptoms**: `parse` method returns empty arrays

**Diagnostic Steps**:

Add debug logging:

```typescript
async parse(content: string, filePath: string): Promise<ParseResult> {
  console.log('Parsing file:', filePath);
  console.log('Content length:', content.length);
  
  try {
    const result = this.doParse(content, filePath);
    console.log('Parse result:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('Parse error:', error);
    return { nodes: [], edges: [], metadata: {}, error: (error as Error).message };
  }
}
```

### 3. Node ID Conflicts

**Symptoms**: Duplicate nodes appear in the graph

**Solutions**: Use unique node IDs

```typescript
// Bad example
const nodeId = `user:${name}`;

// Good example
const nodeId = `user:${filePath}:${name}:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
```

---

## Performance Issues

### 1. Large File Parsing Timeout

**Symptoms**: Timeout when parsing large files

**Solutions**:

```typescript
async parse(content: string, filePath: string): Promise<ParseResult> {
  // Stream-process large files
  if (content.length > 1024 * 1024) { // > 1MB
    return this.parseLargeFile(content, filePath);
  }
  return this.parseSmallFile(content, filePath);
}

private async parseLargeFile(content: string, filePath: string): Promise<ParseResult> {
  // Process in chunks
  const chunkSize = 64 * 1024; // 64KB
  const chunks = [];
  
  for (let i = 0; i < content.length; i += chunkSize) {
    const chunk = content.slice(i, i + chunkSize);
    const result = this.parseChunk(chunk, filePath, i);
    chunks.push(result);
  }
  
  return this.mergeResults(chunks);
}
```

### 2. High Memory Usage

**Symptoms**: Memory keeps growing after parsing

**Solutions**:

```typescript
class MyPlugin implements ParserPlugin {
  private cache = new Map<string, ParseResult>();
  private maxCacheSize = 100;
  
  async parse(content: string, filePath: string): Promise<ParseResult> {
    const cacheKey = `${filePath}:${content.length}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    const result = await this.doParse(content, filePath);
    
    // LRU Cache
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(cacheKey, result);
    
    return result;
  }
  
  async dispose(): Promise<void> {
    this.cache.clear();
  }
}
```

### 3. Repeated Parsing of Same File

**Symptoms**: Files are being parsed repeatedly

**Solutions**: Use caching and incremental parsing

```typescript
class MyPlugin implements ParserPlugin {
  private lastModified = new Map<string, number>();
  
  async parse(content: string, filePath: string): Promise<ParseResult> {
    const stats = fs.statSync(filePath);
    const modified = stats.mtimeMs;
    
    if (this.lastModified.get(filePath) === modified) {
      console.log('File not changed, skipping:', filePath);
      return { nodes: [], edges: [], metadata: { cached: true } };
    }
    
    this.lastModified.set(filePath, modified);
    return this.doParse(content, filePath);
  }
}
```

---

## Configuration Issues

### 1. Configuration File Format Error

**Symptoms**:
```
SyntaxError: Unexpected token
```

**Correct Format**:

```json
{
  "plugins": [
    {
      "name": "gitnexus-my-plugin",
      "enabled": true,
      "config": {
        "strictMode": false
      }
    }
  ]
}
```

### 2. Plugin Configuration Not Taking Effect

**Diagnostic Steps**:

```bash
# Check configuration file locations
# Global: ~/.gitnexus/plugins.json
# Project-level: .gitnexus/plugins.json
```

**Solutions**:

Ensure the configuration plugin name matches the actual plugin name:

```typescript
// Plugin name
name = 'gitnexus-my-plugin';

// Configuration file must also use this name
{
  "name": "gitnexus-my-plugin",
  "enabled": true
}
```

### 3. Environment Variable Configuration

**Solutions**:

```typescript
class MyPlugin implements ParserPlugin {
  private config = {
    apiKey: process.env.MY_PLUGIN_API_KEY,
    debug: process.env.MY_PLUGIN_DEBUG === 'true'
  };
}
```

---

## Debugging Tips

### 1. Enable Debug Mode

```bash
# Linux/macOS
GITNEXUS_DEBUG=1 gitnexus analyze

# Windows (PowerShell)
$env:GITNEXUS_DEBUG=1; gitnexus analyze
```

### 2. View Detailed Logs

```bash
# View logs in real-time
tail -f ~/.gitnexus/logs/plugin.log

# View last 100 lines
tail -n 100 ~/.gitnexus/logs/plugin.log
```

### 3. Using VSCode Debugger

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Plugin",
      "program": "${workspaceFolder}/node_modules/.bin/gitnexus",
      "args": ["analyze"],
      "env": {
        "GITNEXUS_DEBUG": "1"
      }
    }
  ]
}
```

### 4. Test Single File

Create test script `test-plugin.ts`:

```typescript
import { pluginManager } from './src/core/plugins/index.js';

async function test() {
  // Load plugin
  await pluginManager.loadPlugin({
    pluginPath: './src/plugins/my-plugin'
  });
  
  // Get parser
  const parser = pluginManager.parserRegistry.getParser('/path/to/test.file');
  
  if (!parser) {
    console.error('Parser not found!');
    return;
  }
  
  // Parse file
  const fs = await import('fs');
  const content = fs.readFileSync('/path/to/test.file', 'utf8');
  const result = await parser.parse(content, '/path/to/test.file');
  
  console.log('Parse result:', JSON.stringify(result, null, 2));
}

test().catch(console.error);
```

Run:

```bash
npx ts-node test-plugin.ts
```

### 5. Check Plugin Status

```bash
# List all plugins
gitnexus plugin list

# View detailed status
gitnexus plugin status

# Test specific file
gitnexus analyze --verbose --path /path/to/project
```

### 6. Common Error Codes

| Error Code | Description | Solution |
|------------|-------------|----------|
| 1001 | Plugin load failure | Check dependencies and path |
| 2001 | Parse error | Check file format |
| 2002 | Unsupported file type | Check supports method |
| 3001 | Analysis error | Check AST structure |
| 4001 | Processing error | Check processing logic |

---

## Getting Help

If the above methods cannot resolve your issue:

1. Browse [GitHub Issues](https://github.com/gitnexus/gitnexus/issues)
2. Join the [Discord Community](https://discord.gg/gitnexus)
3. Send an email to support@gitnexus.io

---

**Last Updated**: 2026-04-26
