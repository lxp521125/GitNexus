// src/core/plugins/types.ts

/**
 * 插件基类接口
 */
export interface Plugin {
  /** 插件名称 */
  name: string;
  
  /** 插件版本 */
  version: string;
  
  /** 插件描述 */
  description?: string;
  
  /** 初始化插件 */
  init?(config: PluginConfig): Promise<void>;
  
  /** 清理资源 */
  dispose?(): Promise<void>;
}

/**
 * 解析器插件接口
 */
export interface ParserPlugin extends Plugin {
  /** 支持的文件扩展名 */
  extensions: string[];
  
  /** 解析文件内容 */
  parse(content: string, filePath: string): Promise<ParseResult>;
  
  /** 注册到解析器注册表 */
  register(registry: ParserRegistry): void;
  
  /** 检查文件是否支持 */
  supports(filePath: string): boolean;
}

/**
 * 分析器插件接口
 */
export interface AnalyzerPlugin extends Plugin {
  /** 支持的语言 */
  languages: string[];
  
  /** 分析代码语义 */
  analyze(node: any, context: AnalysisContext): Promise<AnalysisResult>;
  
  /** 注册到分析器注册表 */
  register(registry: AnalyzerRegistry): void;
  
  /** 检查语言是否支持 */
  supports(language: string): boolean;
}

/**
 * 处理器插件接口
 */
export interface ProcessorPlugin extends Plugin {
  /** 处理阶段 */
  phase: string;
  
  /** 处理优先级 */
  priority?: number;
  
  /** 处理数据 */
  process(data: any, context: ProcessContext): Promise<any>;
  
  /** 注册到处理器注册表 */
  register(registry: ProcessorRegistry): void;
}

/**
 * 集成插件接口
 */
export interface IntegrationPlugin extends Plugin {
  /** 集成目标 */
  target: string;
  
  /** 执行集成操作 */
  execute(data: any, context: IntegrationContext): Promise<IntegrationResult>;
  
  /** 注册到集成注册表 */
  register(registry: IntegrationRegistry): void;
}

/**
 * 插件配置
 */
export interface PluginConfig {
  /** 插件配置项 */
  [key: string]: any;
  
  /** 全局配置 */
  global?: Record<string, any>;
  
  /** 项目配置 */
  project?: Record<string, any>;
  
  /** 环境变量 */
  env?: Record<string, string>;
}

/**
 * 解析结果
 */
export interface ParseResult {
  /** 解析生成的节点 */
  nodes: Node[];
  
  /** 解析生成的边 */
  edges: Edge[];
  
  /** 元数据 */
  metadata: Record<string, any>;
  
  /** 错误信息 */
  error?: string;
}

/**
 * 节点结构
 */
export interface Node {
  /** 节点 ID */
  id: string;
  
  /** 节点类型 */
  label: string;
  
  /** 节点属性 */
  properties: Record<string, any>;
  
  /** 源文件路径 */
  filePath: string;
  
  /** 开始行号 */
  startLine?: number;
  
  /** 结束行号 */
  endLine?: number;
}

/**
 * 边结构
 */
export interface Edge {
  /** 边 ID */
  id: string;
  
  /** 边类型 */
  type: string;
  
  /** 源节点 ID */
  source: string;
  
  /** 目标节点 ID */
  target: string;
  
  /** 边属性 */
  properties: Record<string, any>;
  
  /** 置信度 */
  confidence?: number;
  
  /** 原因 */
  reason?: string;
}

/**
 * 分析上下文
 */
export interface AnalysisContext {
  /** 当前文件路径 */
  filePath: string;
  
  /** 当前语言 */
  language: string;
  
  /** 语义模型 */
  semanticModel: any;
  
  /** 解析器实例 */
  parser: any;
  
  /** 分析配置 */
  config: AnalysisConfig;
}

/**
 * 分析配置
 */
export interface AnalysisConfig {
  /** 分析深度 */
  depth?: number;
  
  /** 是否启用缓存 */
  cache?: boolean;
  
  /** 分析超时时间（毫秒） */
  timeout?: number;
  
  /** 自定义配置 */
  [key: string]: any;
}

/**
 * 分析结果
 */
export interface AnalysisResult {
  /** 分析结果 */
  results: any[];
  
  /** 元数据 */
  metadata: Record<string, any>;
}

/**
 * 处理上下文
 */
export interface ProcessContext {
  /** 处理阶段 */
  phase: string;
  
  /** 项目路径 */
  projectPath: string;
  
  /** 知识图谱 */
  knowledgeGraph: any;
  
  /** 处理配置 */
  config: ProcessConfig;
}

/**
 * 处理配置
 */
export interface ProcessConfig {
  /** 是否并行处理 */
  parallel?: boolean;
  
  /** 处理线程数 */
  threads?: number;
  
  /** 批处理大小 */
  batchSize?: number;
  
  /** 自定义配置 */
  [key: string]: any;
}

/**
 * 集成上下文
 */
export interface IntegrationContext {
  /** 集成目标 */
  target: string;
  
  /** 项目路径 */
  projectPath: string;
  
  /** 知识图谱 */
  knowledgeGraph: any;
  
  /** 集成配置 */
  config: IntegrationConfig;
}

/**
 * 集成配置
 */
export interface IntegrationConfig {
  /** 认证信息 */
  auth?: Record<string, string>;
  
  /** API 端点 */
  endpoint?: string;
  
  /** 自定义配置 */
  [key: string]: any;
}

/**
 * 集成结果
 */
export interface IntegrationResult {
  /** 集成是否成功 */
  success: boolean;
  
  /** 集成结果数据 */
  data?: any;
  
  /** 错误信息 */
  error?: string;
  
  /** 元数据 */
  metadata?: Record<string, any>;
}

/**
 * 解析器注册表
 */
export interface ParserRegistry {
  /** 注册解析器 */
  registerParser(parser: ParserPlugin): void;
  
  /** 获取解析器 */
  getParser(filePath: string): ParserPlugin | undefined;
  
  /** 获取所有解析器 */
  getParsers(): ParserPlugin[];
  
  /** 注销解析器 */
  unregisterParser(name: string): void;
}

/**
 * 分析器注册表
 */
export interface AnalyzerRegistry {
  /** 注册分析器 */
  registerAnalyzer(analyzer: AnalyzerPlugin): void;

  /** 获取分析器（可选按语言过滤） */
  getAnalyzers(language?: string): AnalyzerPlugin[];

  /** 注销分析器 */
  unregisterAnalyzer(name: string): void;
}

/**
 * 处理器注册表
 */
export interface ProcessorRegistry {
  /** 注册处理器 */
  registerProcessor(processor: ProcessorPlugin): void;

  /** 获取处理器（可选按阶段过滤） */
  getProcessors(phase?: string): ProcessorPlugin[];

  /** 注销处理器 */
  unregisterProcessor(name: string): void;
}

/**
 * 集成注册表
 */
export interface IntegrationRegistry {
  /** 注册集成 */
  registerIntegration(integration: IntegrationPlugin): void;
  
  /** 获取集成 */
  getIntegration(target: string): IntegrationPlugin | undefined;
  
  /** 获取所有集成 */
  getIntegrations(): IntegrationPlugin[];
  
  /** 注销集成 */
  unregisterIntegration(name: string): void;
}

/**
 * 插件注册表
 */
export interface PluginRegistry {
  /** 注册插件 */
  registerPlugin(plugin: Plugin): void;
  
  /** 获取插件 */
  getPlugin(name: string): Plugin | undefined;
  
  /** 获取所有插件 */
  getPlugins(): Plugin[];
  
  /** 注销插件 */
  unregisterPlugin(name: string): void;
  
  /** 启用插件 */
  enablePlugin(name: string): void;
  
  /** 禁用插件 */
  disablePlugin(name: string): void;
  
  /** 获取插件状态 */
  getPluginStatus(name: string): PluginStatus;
}

/**
 * 插件状态
 */
export interface PluginStatus {
  /** 插件名称 */
  name: string;
  
  /** 插件版本 */
  version: string;
  
  /** 是否启用 */
  enabled: boolean;
  
  /** 插件类型 */
  type: 'parser' | 'analyzer' | 'processor' | 'integration';
  
  /** 错误信息 */
  error?: string;
}

/**
 * 插件加载选项
 */
export interface PluginLoadOptions {
  /** 插件路径 */
  pluginPath: string;
  
  /** 插件配置 */
  config?: PluginConfig;
  
  /** 是否启用 */
  enabled?: boolean;
}

/**
 * 插件事件类型
 */
export type PluginEvent = 
  | { type: 'plugin.loaded'; data: { pluginName: string } }
  | { type: 'plugin.unloaded'; data: { pluginName: string } }
  | { type: 'plugin.enabled'; data: { pluginName: string } }
  | { type: 'plugin.disabled'; data: { pluginName: string } }
  | { type: 'plugin.error'; data: { pluginName: string; error: string } };

/**
 * 事件监听器
 */
export type EventListener = (event: PluginEvent) => void;

/**
 * 事件发射器
 */
export interface EventEmitter {
  /** 监听事件 */
  on(event: string, listener: EventListener): void;
  
  /** 监听事件（仅一次） */
  once(event: string, listener: EventListener): void;
  
  /** 移除事件监听 */
  off(event: string, listener: EventListener): void;
  
  /** 触发事件 */
  emit(event: string, data: any): void;
}