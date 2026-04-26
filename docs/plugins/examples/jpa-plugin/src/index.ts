import { ParserPlugin, AnalyzerPlugin, ParseResult, AnalysisResult, ParserRegistry, AnalyzerRegistry, AnalysisContext, createNode, createEdge } from 'gitnexus-shared';

/**
 * JPA 插件
 * 解析 JPA 框架的实体类和仓库接口
 */
export class JPAPlugin implements ParserPlugin, AnalyzerPlugin {
  name = 'gitnexus-jpa-plugin';
  version = '1.0.0';
  description = 'JPA plugin for GitNexus';
  extensions = ['.java'];
  languages = ['java'];
  
  /**
   * 解析文件内容
   */
  async parse(content: string, filePath: string): Promise<ParseResult> {
    const nodes = [];
    const edges = [];
    
    // Java 文件由分析器处理
    
    return {
      nodes,
      edges,
      metadata: {
        format: 'java',
        filePath
      }
    };
  }
  
  /**
   * 分析代码语义
   */
  async analyze(node: any, context: AnalysisContext): Promise<AnalysisResult> {
    const results = [];
    
    // 分析 JPA 实体类
    if (node.type === 'class_declaration') {
      const className = node.name?.text;
      const annotations = node.annotations || [];
      
      // 检查是否为 JPA 实体类
      if (this.isJpaEntity(annotations)) {
        results.push({
          type: 'jpa.entity',
          name: className,
          location: {
            filePath: context.filePath,
            startLine: node.startLine,
            endLine: node.endLine
          },
          properties: this.extractEntityProperties(node, annotations)
        });
      }
    }
    
    // 分析 JPA 仓库接口
    if (node.type === 'interface_declaration') {
      const interfaceName = node.name?.text;
      
      // 检查是否为 JPA 仓库接口
      if (this.isJpaRepository(node)) {
        results.push({
          type: 'jpa.repository',
          name: interfaceName,
          location: {
            filePath: context.filePath,
            startLine: node.startLine,
            endLine: node.endLine
          },
          properties: this.extractRepositoryProperties(node)
        });
      }
    }
    
    // 分析 JPA 字段注解
    if (node.type === 'field_declaration') {
      const fieldName = node.declarators[0]?.name?.text;
      const annotations = node.annotations || [];
      
      for (const annotation of annotations) {
        const annotationName = annotation.name?.text;
        if (this.isJpaFieldAnnotation(annotationName)) {
          results.push({
            type: 'jpa.field',
            name: fieldName,
            annotation: annotationName,
            location: {
              filePath: context.filePath,
              startLine: node.startLine,
              endLine: node.endLine
            },
            properties: this.extractFieldProperties(node, annotation)
          });
        }
      }
    }
    
    return {
      results,
      metadata: {
        analyzer: this.name,
        language: context.language
      }
    };
  }
  
  /**
   * 检查是否为 JPA 实体类
   */
  private isJpaEntity(annotations: any[]): boolean {
    for (const annotation of annotations) {
      const annotationName = annotation.name?.text;
      if (annotationName === 'Entity' || annotationName === 'Embeddable' || annotationName === 'MappedSuperclass') {
        return true;
      }
    }
    return false;
  }
  
  /**
   * 检查是否为 JPA 仓库接口
   */
  private isJpaRepository(node: any): boolean {
    // 检查是否继承自 JpaRepository 或其他 Spring Data 仓库接口
    if (node.extends) {
      const extendsName = node.extends.text;
      return extendsName.includes('Repository') || 
             extendsName.includes('JpaRepository') ||
             extendsName.includes('CrudRepository') ||
             extendsName.includes('PagingAndSortingRepository');
    }
    return false;
  }
  
  /**
   * 检查是否为 JPA 字段注解
   */
  private isJpaFieldAnnotation(annotationName: string): boolean {
    const jpaFieldAnnotations = [
      'Id',
      'GeneratedValue',
      'Column',
      'JoinColumn',
      'OneToOne',
      'OneToMany',
      'ManyToOne',
      'ManyToMany',
      'Embedded',
      'EmbeddedId',
      'Transient',
      'Temporal',
      'Enumerated',
      'Lob'
    ];
    return jpaFieldAnnotations.includes(annotationName);
  }
  
  /**
   * 提取实体类属性
   */
  private extractEntityProperties(node: any, annotations: any[]): Record<string, any> {
    const properties: Record<string, any> = {};
    
    // 提取表名
    for (const annotation of annotations) {
      if (annotation.name?.text === 'Table') {
        properties.table = this.extractArguments(annotation.arguments);
      } else if (annotation.name?.text === 'Entity') {
        properties.entity = this.extractArguments(annotation.arguments);
      }
    }
    
    if (node.extends) {
      properties.extends = node.extends.text;
    }
    
    if (node.implements) {
      properties.implements = node.implements.map((i: any) => i.text);
    }
    
    return properties;
  }
  
  /**
   * 提取仓库接口属性
   */
  private extractRepositoryProperties(node: any): Record<string, any> {
    const properties: Record<string, any> = {};
    
    if (node.extends) {
      properties.extends = node.extends.text;
    }
    
    if (node.typeParameters) {
      properties.typeParameters = node.typeParameters.map((t: any) => t.text);
    }
    
    // 提取查询方法
    if (node.body && node.body.methods) {
      properties.queryMethods = node.body.methods.map((m: any) => ({
        name: m.name?.text,
        returnType: m.returnType?.text
      }));
    }
    
    return properties;
  }
  
  /**
   * 提取字段属性
   */
  private extractFieldProperties(node: any, annotation: any): Record<string, any> {
    const properties: Record<string, any> = {};
    
    if (annotation.arguments) {
      properties.annotationArguments = this.extractArguments(annotation.arguments);
    }
    
    if (node.type) {
      properties.type = node.type.text;
    }
    
    return properties;
  }
  
  /**
   * 提取参数
   */
  private extractArguments(argumentsNode: any): Record<string, any> {
    const args: Record<string, any> = {};
    
    if (argumentsNode.type === 'annotation_argument_list') {
      for (const arg of argumentsNode.arguments) {
        if (arg.type === 'assignment_expression') {
          const name = arg.left.text;
          const value = this.extractArgumentValue(arg.right);
          args[name] = value;
        } else {
          args.value = this.extractArgumentValue(arg);
        }
      }
    }
    
    return args;
  }
  
  /**
   * 提取参数值
   */
  private extractArgumentValue(valueNode: any): any {
    if (valueNode.type === 'string_literal') {
      return valueNode.value;
    } else if (valueNode.type === 'number_literal') {
      return Number(valueNode.value);
    } else if (valueNode.type === 'boolean_literal') {
      return valueNode.value === 'true';
    } else if (valueNode.type === 'array_expression') {
      return valueNode.elements.map((e: any) => this.extractArgumentValue(e));
    } else if (valueNode.type === 'object_expression') {
      const obj: Record<string, any> = {};
      for (const prop of valueNode.properties) {
        const name = prop.key.text;
        const value = this.extractArgumentValue(prop.value);
        obj[name] = value;
      }
      return obj;
    } else if (valueNode.type === 'member_expression') {
      return valueNode.text;
    } else {
      return valueNode.text || valueNode.value;
    }
  }
  
  /**
   * 注册到解析器注册表
   */
  register(registry: ParserRegistry | AnalyzerRegistry): void {
    if ('registerParser' in registry) {
      registry.registerParser(this);
    } else if ('registerAnalyzer' in registry) {
      registry.registerAnalyzer(this);
    }
  }
  
  /**
   * 检查文件是否支持
   */
  supports(filePath: string): boolean {
    return this.extensions.some(ext => filePath.endsWith(ext));
  }
  
  /**
   * 检查语言是否支持
   */
  supportsLanguage(language: string): boolean {
    return this.languages.includes(language);
  }
  
  /**
   * 初始化插件
   */
  async init(config: any): Promise<void> {
    console.log(`Initialized ${this.name} with config:`, config);
  }
  
  /**
   * 清理资源
   */
  async dispose(): Promise<void> {
    console.log(`Disposed ${this.name}`);
  }
}

// 导出插件实例
export default new JPAPlugin();