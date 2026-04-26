# GitNexus 插件系统

GitNexus 插件系统是一个可扩展的架构，允许开发者通过插件扩展 GitNexus 的功能。插件系统设计为 LLM 友好，支持通过大语言模型快速生成和开发插件。

## 核心特性

- **易于开发**：简单的接口定义，最小化开发成本
- **高度可扩展**：支持解析器、分析器、处理器等多种插件类型
- **LLM 友好**：提供标准模板和示例，支持通过 LLM 快速生成插件
- **热插拔**：运行时加载和卸载插件
- **配置管理**：支持全局和项目级插件配置

## 插件类型

| 插件类型 | 作用 | 接口 |
|---------|------|------|
| **解析器插件** | 解析特定文件类型 | `ParserPlugin` |
| **分析器插件** | 分析代码语义 | `AnalyzerPlugin` |
| **处理器插件** | 处理特定语言特性 | `ProcessorPlugin` |
| **集成插件** | 集成外部工具 | `IntegrationPlugin` |

## 快速开始

### 安装插件

```bash
# 从本地路径安装
gitnexus plugin load ./my-plugin

# 从 npm 包安装
gitnexus plugin load gitnexus-xml-plugin

# 启用插件
gitnexus plugin enable gitnexus-xml-plugin
```

### 列出插件

```bash
gitnexus plugin list
```

### 分析项目

插件会在 `gitnexus analyze` 时自动生效：

```bash
gitnexus analyze
```

## 文档结构

```
docs/plugins/
├── README.md              # 本文档 - 插件系统总览
├── development-guide.md   # 插件开发指南
├── api-reference.md       # 插件 API 参考
├── llm-guide.md           # LLM 辅助开发指南
└── examples/
    ├── README.md          # 示例插件总览
    ├── parser-plugins/    # 解析器插件示例
    │   └── xml-parser/    # XML 解析插件
    └── analyzer-plugins/  # 分析器插件示例
        └── spring-analyzer/ # Spring 分析器插件
```

## 开发工作流

1. **创建插件项目**
   ```bash
   mkdir gitnexus-my-plugin
   cd gitnexus-my-plugin
   npm init -y
   ```

2. **实现插件接口**
   ```typescript
   import { ParserPlugin, ParseResult, ParserRegistry } from 'gitnexus-shared';
   
   export class MyPlugin implements ParserPlugin {
     name = 'gitnexus-my-plugin';
     extensions = ['.myext'];
     
     async parse(content: string, filePath: string): Promise<ParseResult> {
       // 解析逻辑
       return { nodes: [], edges: [], metadata: {} };
     }
     
     register(registry: ParserRegistry): void {
       registry.registerParser(this);
     }
     
     supports(filePath: string): boolean {
       return filePath.endsWith('.myext');
     }
   }
   
   export default new MyPlugin();
   ```

3. **测试插件**
   ```bash
   npm run build
   gitnexus plugin load ./my-plugin
   gitnexus analyze
   ```

4. **发布插件**
   ```bash
   npm publish
   ```

## LLM 辅助开发

使用 LLM 可以快速生成插件代码：

```
请为 GitNexus 创建一个解析器插件，用于解析 YAML 配置文件。

要求：
1. 插件名称：gitnexus-yaml-plugin
2. 支持扩展名：.yml, .yaml
3. 使用 js-yaml 库进行解析
4. 提取 YAML 中的键值对作为节点
5. 生成 HAS_PROPERTY 边关系
6. 遵循 GitNexus 插件接口规范

请生成完整的 TypeScript 代码。
```

详见 [LLM 开发指南](llm-guide.md)。

## 配置文件

### 全局配置

在 `~/.gitnexus/plugins.json` 中配置：

```json
{
  "plugins": [
    {
      "name": "gitnexus-xml-plugin",
      "enabled": true,
      "config": {
        "strictMode": false
      }
    }
  ]
}
```

### 项目级配置

在项目 `.gitnexus/plugins.json` 中配置：

```json
{
  "plugins": [
    {
      "name": "gitnexus-spring-plugin",
      "enabled": true,
      "config": {}
    }
  ]
}
```

## CLI 命令

| 命令 | 描述 |
|------|------|
| `gitnexus plugin list` | 列出所有已安装的插件 |
| `gitnexus plugin load <path>` | 加载插件 |
| `gitnexus plugin unload <name>` | 卸载插件 |
| `gitnexus plugin enable <name>` | 启用插件 |
| `gitnexus plugin disable <name>` | 禁用插件 |
| `gitnexus plugin status` | 显示插件系统状态 |
| `gitnexus plugin scan [dir]` | 扫描插件目录 |

## 示例插件

### XML 解析插件

解析 XML 文件，提取元素、属性和文本内容。

详见 [XML 解析插件示例](examples/parser-plugins/xml-parser/)。

### Spring 分析器插件

分析 Spring 框架代码，识别组件和注解。

详见 [Spring 分析器插件示例](examples/analyzer-plugins/spring-analyzer/)。

## 相关文档

- [开发指南](development-guide.md) - 详细的插件开发流程
- [API 参考](api-reference.md) - 完整的插件 API 文档
- [LLM 开发指南](llm-guide.md) - 如何使用 LLM 辅助开发插件

## 常见问题

**Q: 如何创建新的插件类型？**
A: 参考 `src/core/plugins/types.ts` 中的接口定义，实现相应的接口并注册到对应的注册表。

**Q: 插件之间有冲突怎么办？**
A: 使用 `priority` 属性调整处理器插件的执行顺序，使用 `supports` 方法进行精确的文件匹配。

**Q: 如何调试插件？**
A: 设置 `GITNEXUS_DEBUG=1` 环境变量，查看 `~/.gitnexus/logs/plugin.log` 日志文件。

## 联系我们

- **GitHub Issues**：https://github.com/gitnexus/gitnexus/issues
- **Discord**：https://discord.gg/gitnexus
- **Email**：support@gitnexus.io

---

**版本**：1.0.0
**最后更新**：2026-04-26
**维护者**：GitNexus 团队