# GitNexus 图结构 Java/Spring Boot 场景缺失分析报告

## 1. 现有图结构概览

GitNexus 当前图模型定义了 34 种节点标签（NodeLabel）和 22 种关系类型（RelationshipType），覆盖了从项目、包、文件到类、方法、变量等通用代码结构。所有类型定义在 `gitnexus-shared/src/graph/types.ts` 中作为唯一真相源，数据库 schema 常量在 `gitnexus-shared/src/lbug/schema-constants.ts` 中维护。

### 1.1 现有节点类型清单

| 类别 | 节点类型 | Java 相关性 |
|------|---------|------------|
| 项目/组织 | Project, Package, Module, Folder, File | 通用 |
| OOP 核心 | Class, Interface, Enum, Annotation, Constructor | 核心 |
| 函数/方法 | Function, Method | 核心 |
| 数据成员 | Variable, Property, Const, Static | 核心 |
| 类型系统 | Type, TypeAlias, Template, Typedef, Record | 部分相关 |
| 继承/实现 | Impl, Trait | 部分相关 |
| 装饰/注解 | Decorator, Import | 核心 |
| 结构体 | Struct, Union, Namespace | 低相关 |
| 分析产物 | Community, Process, CodeElement | 通用 |
| Web/工具 | Route, Tool, Section, Delegate, Macro | 部分相关 |

### 1.2 现有关系类型清单

| 关系类型 | 语义 | Spring Boot 场景覆盖 |
|---------|------|---------------------|
| CONTAINS | 包含（文件含类） | 部分 |
| CALLS | 函数/方法调用 | 部分（不覆盖 DI 调用） |
| INHERITS | 类继承 | 覆盖 |
| METHOD_OVERRIDES | 方法覆盖 | 覆盖 |
| METHOD_IMPLEMENTS | 方法实现接口 | 覆盖 |
| IMPORTS | 文件级导入 | 覆盖 |
| USES | 使用依赖/工具 | 部分 |
| DEFINES | 定义符号 | 覆盖 |
| DECORATES | 装饰器/注解应用 | 覆盖（但 Spring 语义缺失） |
| IMPLEMENTS | 类实现接口 | 覆盖 |
| EXTENDS | 扩展父类型 | 覆盖 |
| HAS_METHOD | 类含方法 | 覆盖 |
| HAS_PROPERTY | 类含属性 | 覆盖 |
| ACCESSES | 读/写访问 | 覆盖 |
| MEMBER_OF | 属于容器 | 覆盖 |
| STEP_IN_PROCESS | 过程步骤 | 通用 |
| HANDLES_ROUTE | 处理路由 | 部分（不识别 Spring MVC） |
| FETCHES | 获取数据 | 部分 |
| HANDLES_TOOL | 处理/调用工具 | 低相关 |
| ENTRY_POINT_OF | 入口点 | 部分（Spring 入口不识别） |
| WRAPS | 包装行为 | 可用于 AOP，但当前无语义 |
| QUERIES | 查询/数据库访问 | 部分（不识别 JPA） |

### 1.3 当前 Java 语言支持现状

Java 语言提供器（`gitnexus/src/core/ingestion/languages/java.ts`）仅 47 行代码，提供纯通用 Java AST 解析能力：使用 JVM 风格的类型提取、调用提取、字段提取和方法提取。采用 `implements-split` MRO 策略和 `interfaceNamePattern: /^I[A-Z]/`。没有任何 Spring 相关逻辑。

框架检测系统（`gitnexus/src/core/ingestion/framework-detection.ts`，943 行）虽然能识别 Spring 模式（如 `/controller/` 路径、`@RestController`/`@Controller`/`@GetMapping`/`@PostMapping`/`@RequestMapping` 注解），但它仅产出 `FrameworkHint`，包含 `entryPointMultiplier` 和 `reason`，只影响入口点评分乘数，不生成任何框架感知的图节点或边。

Spring 分析器插件（`docs/plugins/examples/analyzer-plugins/spring-analyzer/README.md`）仅为文档示例，不存在实际源代码文件。它定义的输出类型 `spring.component`、`spring.annotation`、`spring.method` 也不是标准 GitNexus NodeLabel。

### 1.4 Java 图结构的特殊设计模式

根据集成测试（`test/integration/java-class-impact.test.ts`），Java 图结构有两个重要的设计决策：CALLS 边指向 Constructor（而非 Class），IMPORTS 边指向 File（而非 Class）。这意味着在当前设计中，Java 的依赖关系在文件级别解析，方法调用通过构造函数间接表达，无法直接追踪到接口级别的依赖注入。

---

## 2. 通用 Java 场景缺失分析

以下缺失项不仅影响 Spring Boot，也影响纯 Java 代码的分析质量。

### 2.1 方法参数类型缺失 — 优先级 P0

**现状**：Method 和 Function 节点仅有 `parameterCount: number`，缺少 `parameterTypes: string[]` 属性。Constructor 节点同样只有 `parameterCount`。

**影响**：Java 是强类型语言，方法签名由参数类型唯一确定（方法重载依赖参数类型区分）。没有参数类型信息，以下分析场景完全无法实现：

- 方法重载解析：无法区分 `process(String)` 和 `process(Integer)`
- 依赖注入追踪：无法知道构造函数参数的接口类型（Spring 构造器注入的核心）
- 调用目标消歧：CALLS 边无法关联到正确的重载方法
- 影响分析精度：修改一个接口后，无法精确定位哪些方法参数受影响

**建议**：

```
// 新增属性
Method.parameterTypes: string[]    // 如 ["java.lang.String", "int"]
Constructor.parameterTypes: string[] // 如 ["com.example.UserService"]
Function.parameterTypes: string[]   // 如 ["Request", "Response"]
```

**技术可行性**：scope-extractor.ts 中已有 `@declaration.parameter-types` 捕获机制（RFC #909），scope-based resolution pipeline 的 Java 迁移完成后可自动获取。但 Java 仍在使用 legacy DAG，需优先完成 scope-based migration。

### 2.2 异常声明缺失 — 优先级 P2

**现状**：Method 节点没有 `throwsTypes: string[]` 属性。

**影响**：Java 的 checked exception 是方法签名的一部分，影响调用链分析。无法追踪异常传播路径，无法分析哪些方法可能抛出特定异常。

**建议**：

```
Method.throwsTypes: string[]  // 如 ["java.io.IOException", "SQLException"]
```

### 2.3 Lambda 和匿名类缺失 — 优先级 P2

**现状**：没有 Lambda 或 AnonymousClass 节点类型。Java 8+ 的 lambda 表达式和匿名类是 Spring Boot 代码中的常见模式（如 `stream().map()`、`Runnable` 实现、`Comparator` 匿名类等）。

**影响**：Lambda 内的方法调用和变量捕获不会出现在图中，导致调用链断裂。Spring WebFlux 的响应式编程大量使用 lambda，缺失后几乎无法分析 Reactive 流。

**建议**：新增 `Lambda` 节点类型，或复用 `Function` 节点并添加 `isLambda: boolean` 和 `capturedVariables: string[]` 属性。

### 2.4 枚举值缺失 — 优先级 P3

**现状**：Enum 节点没有枚举值列表属性。

**影响**：无法追踪枚举值的使用场景（如 `DayOfWeek.MONDAY`），对配置类枚举和状态机分析有影响。

**建议**：在 Enum 节点添加 `values: string[]` 属性，或在 Enum 与 Const 之间建立 CONTAINS 边。

### 2.5 泛型实例化信息缺失 — 优先级 P2

**现状**：Class 节点有 `parameterCount`（类型参数数量），但没有类型参数名称和边界信息。Variable 和 Property 的 `declaredType` 仅存储原始类型字符串，无法解析泛型实例化。

**影响**：`List<User>` 和 `List<Order>` 在图中是同一个 `List` 类型，无法区分。Spring Data 的 `JpaRepository<User, Long>` 和 `JpaRepository<Order, Long>` 无法追踪到正确的实体类型，Repository 与 Entity 的关联断裂。

**建议**：

```
Class.typeParameters: string[]          // 如 ["T", "E"]
Class.typeParameterBounds: string[][]   // 如 [["T","Comparable<T>"]]
Variable.genericArgs: string[]          // 如 ["User"]（来自 List<User>）
```

---

## 3. Spring Boot 框架场景缺失分析

Spring Boot 的核心设计理念是"约定优于配置"，大量行为通过注解驱动而非显式代码调用。当前图结构仅能捕获注解的存在（DECORATES 边），但无法表达注解的运行时语义，这是 Spring Boot 分析的根本性缺口。

### 3.1 依赖注入关系缺失 — 优先级 P0

**现状**：没有表示依赖注入的关系类型。Spring 的 `@Autowired`、`@Inject`、构造器注入等机制在图中仅体现为 DECORATES 边（Method → Decorator），无法表达"Bean A 被注入到 Bean B"的语义。

**影响**：这是 Spring Boot 分析最致命的缺口。依赖注入是 Spring 的核心机制，一个典型的 Spring Boot 项目中 70% 以上的类间关系通过 DI 建立。没有 DI 关系：

- 无法追踪 Bean 之间的依赖图
- 无法分析修改一个 Bean 的影响范围
- 无法识别循环依赖
- 无法理解 Controller → Service → Repository 的经典分层调用链
- Constructor CALLS 边指向 Constructor 而非 Interface，无法解析到具体实现

**建议**：新增 `INJECTS_INTO` 关系类型。

```
// 新增关系
INJECTS_INTO: Bean(Class/Method) → Class(Constructor/Field)

// 属性
injectionType: 'constructor' | 'field' | 'setter' | 'method'
qualifier?: string              // @Qualifier 值
isRequired: boolean             // @Autowired(required=false)
```

**示例**：

```
Class:UserService ──INJECTS_INTO──→ Constructor:UserController
  injectionType: "constructor"
  qualifier: null

Class:UserRepository ──INJECTS_INTO──→ Field:UserService.userRepository
  injectionType: "field"
  qualifier: null
```

### 3.2 Bean 定义与生命周期缺失 — 优先级 P0

**现状**：没有 Bean 节点类型。Spring Bean 的定义可以通过 `@Component`、`@Service`、`@Repository`、`@Controller`、`@Configuration` + `@Bean` 等多种方式声明，但当前图中只有 Class 节点上的 `annotations` 字段记录了注解名称，无法区分普通类和 Spring Bean。

**影响**：

- 无法识别哪些 Class 是 Spring 管理的 Bean
- 无法追踪 `@Bean` 方法产生的 Bean（返回类型的 Class 和声明方法之间缺少关联）
- 无法区分 Bean 的作用域（Singleton/Prototype/Request/Session）
- 无法分析 `@Configuration` 类中 `@Bean` 方法之间的依赖
- 无法识别条件化 Bean（`@ConditionalOnProperty` 等）

**建议方案 A（推荐）**：新增 `Bean` 节点类型。

```
// 新增节点
Bean:
  name: string                  // Bean 名称（默认为类名首字母小写）
  filePath: string
  startLine: number
  endLine: number
  language: string
  beanType: 'component' | 'service' | 'repository' | 'controller' | 'configuration' | 'bean-method'
  scope: string                 // singleton | prototype | request | session
  isPrimary: boolean            // @Primary
  isLazy: boolean               // @Lazy
  conditionalOn: string[]       // 条件注解列表
  qualifier: string             // @Qualifier 值
  annotations: string[]
```

**建议方案 B（轻量）**：在 Class 节点添加 Bean 相关属性。

```
Class.isBean: boolean
Class.beanType: string          // component/service/repository/controller/configuration
Class.beanScope: string
Class.beanQualifier: string
```

方案 A 优势：可以表示 `@Bean` 方法产生的 Bean（不对应一个独立 Class），可以表示 Bean 的条件化装载。方案 B 优势：不需要新增节点类型，改动较小，但无法表达 `@Bean` 方法 Bean。

### 3.3 配置属性绑定缺失 — 优先级 P1

**现状**：Spring Boot 的 `@ConfigurationProperties`、`@Value` 等注解将 `application.yml`/`application.properties` 中的配置绑定到 Java 类或字段，但图中没有表示这种绑定的关系。Section 节点虽可表示配置文件的节，但不与代码中的属性绑定关联。

**影响**：

- 无法追踪配置变更对代码的影响（修改 `spring.datasource.url` 影响哪些类？）
- 无法识别配置类与配置键的映射关系
- `@Value("${some.property}")` 的引用链断裂
- 环境变量和配置文件中的占位符解析无法追踪

**建议**：

```
// 新增节点
ConfigProperty:
  name: string                  // 配置键名，如 "spring.datasource.url"
  filePath: string              // 配置文件路径
  startLine: number
  endLine: number
  language: string              // 'yaml' | 'properties'
  defaultValue: string          // 默认值
  configType: string            // 配置值类型

// 新增关系
BINDS_TO: ConfigProperty → Class/Property/Field
  bindingType: 'configuration-properties' | 'value-injection'
  prefix: string                // @ConfigurationProperties(prefix=...)
```

**示例**：

```
ConfigProperty:"spring.datasource.url" ──BINDS_TO──→ Property:DataSourceConfig.url
  bindingType: "value-injection"

ConfigProperty:"spring.datasource" ──BINDS_TO──→ Class:DataSourceProperties
  bindingType: "configuration-properties"
  prefix: "spring.datasource"
```

### 3.4 AOP 切面关系缺失 — 优先级 P1

**现状**：Spring AOP 的 `@Aspect`、`@Before`、`@After`、`@Around` 等注解定义了横切关注点，但图中无法表达"切面 A 通知了方法 B"的关系。现有 WRAPS 边的语义（"包装行为"）理论上可用于 AOP，但没有被 AOP 语义填充。

**影响**：

- 无法追踪切面的影响范围（修改切面影响哪些方法？）
- 无法分析事务、安全、日志等横切关注点的覆盖
- 方法调用链在切面处断裂
- `@Transactional` 虽然不完全是 AOP，但其代理机制类似，同样无法追踪

**建议**：

```
// 新增关系
ADVISES: Class(Method) → Method/Class
  adviceType: 'before' | 'after' | 'around' | 'after-returning' | 'after-throwing'
  pointcutExpression: string    // 切点表达式，如 "execution(* com.example.service.*.*(..))"
```

**示例**：

```
Class:LoggingAspect ──ADVISES──→ Method:UserService.getUser
  adviceType: "around"
  pointcutExpression: "execution(* com.example.service.*.*(..))"
```

### 3.5 事务管理缺失 — 优先级 P1

**现状**：`@Transactional` 注解在 DECORATES 边中仅记录为注解名称，无法表达事务边界和传播行为。

**影响**：

- 无法识别事务边界（哪些方法在事务中执行？）
- 无法分析事务传播行为（REQUIRED/REQUIRES_NEW/NESTED 等）
- 无法追踪事务回滚规则（rollbackFor/noRollbackFor）
- 数据一致性分析无法进行

**建议**：在 Method 节点添加事务属性，或通过 ADVISES 关系表达。

```
Method.transactional:
  propagation: string           // REQUIRED | REQUIRES_NEW | NESTED | ...
  isolation: string             // READ_COMMITTED | SERIALIZABLE | ...
  rollbackFor: string[]         // 回滚异常类
  noRollbackFor: string[]       // 不回滚异常类
  readOnly: boolean
```

### 3.6 Spring Security 授权链缺失 — 优先级 P2

**现状**：Spring Security 的 `@PreAuthorize`、`@Secured`、`@RolesAllowed` 等注解定义了方法级安全策略，`SecurityFilterChain` Bean 定义了 URL 级安全策略，但图中无法表达。

**影响**：

- 无法识别哪些端点需要认证/授权
- 无法追踪角色/权限与方法的关联
- 安全审计无法进行
- 修改权限配置的影响分析无法实现

**建议**：

```
// 新增关系
SECURES: Class(Method) → Method/Route
  securityType: 'pre-authorize' | 'secured' | 'roles-allowed' | 'filter-chain'
  expression: string            // SpEL 表达式，如 "hasRole('ADMIN')"
  roles: string[]               // 角色列表
```

### 3.7 事件系统缺失 — 优先级 P2

**现状**：Spring 的事件机制（`@EventListener`、`ApplicationEventPublisher.publishEvent()`、`@TransactionalEventListener`）在图中无对应表示。

**影响**：

- 事件驱动架构的调用链断裂
- 无法追踪事件发布者和监听者的关联
- `@Async @EventListener` 的异步事件处理无法识别
- 无法分析事件处理的顺序（`@Order`）

**建议**：

```
// 新增关系
PUBLISHES: Method → Class(CodeElement)
  eventType: string             // 事件类名
  isAsync: boolean

SUBSCRIBES_TO: Method → Class(CodeElement)
  eventType: string
  listenerType: 'event-listener' | 'transactional-event-listener'
  phase: string                 // BEFORE_COMMIT | AFTER_COMMIT | AFTER_ROLLBACK | AFTER_COMPLETION
  order: number
```

### 3.8 缓存注解缺失 — 优先级 P2

**现状**：Spring Cache 的 `@Cacheable`、`@CacheEvict`、`@CachePut` 注解无法在图中表达语义。

**影响**：

- 无法识别缓存操作的覆盖范围
- 无法追踪缓存键与方法的关联
- 缓存一致性分析无法进行

**建议**：在 Method 节点添加缓存属性。

```
Method.cache:
  operation: 'cacheable' | 'cache-evict' | 'cache-put'
  cacheNames: string[]          // 缓存名称列表
  key: string                   // SpEL 缓存键表达式
  condition: string             // SpEL 条件表达式
```

### 3.9 定时任务缺失 — 优先级 P3

**现状**：`@Scheduled` 注解定义的定时任务在图中无对应表示。

**影响**：无法识别系统中的后台定时任务，无法分析定时任务的执行频率和依赖。

**建议**：

```
Method.scheduled:
  cron: string                  // cron 表达式
  fixedRate: number             // 固定频率
  fixedDelay: number            // 固定延迟
  initialDelay: number          // 初始延迟
```

### 3.10 异步方法缺失 — 优先级 P3

**现状**：`@Async` 注解标记的异步方法在图中无语义表示。

**影响**：无法区分同步调用和异步调用，调用链分析会错误地将异步调用当作同步处理。

**建议**：在 Method 节点添加 `isAsyncExecution: boolean` 属性（与现有的 `isAsync` 区分，后者用于 async/await 语义），或新增 `EXECUTES_ASYNC` 关系。

### 3.11 消息监听器缺失 — 优先级 P3

**现状**：Spring Kafka/RabbitMQ 的 `@KafkaListener`、`@RabbitListener` 等消息监听注解无对应图结构。

**影响**：消息驱动架构的消费者端无法识别，无法追踪消息队列与处理方法的关联。

**建议**：

```
// 新增关系
CONSUMES_FROM: Method → CodeElement(Queue/Topic)
  listenerType: 'kafka-listener' | 'rabbit-listener' | 'jms-listener'
  destination: string           // topic/queue 名称
  group: string                 // consumer group
```

### 3.12 Spring Data Repository 与实体关联缺失 — 优先级 P2

**现状**：`JpaRepository<User, Long>` 的泛型参数表达了 Repository 与 Entity 的绑定关系，但当前图结构无法解析泛型实例化，此关联断裂。

**影响**：

- 无法追踪 Repository 操作的实体类型
- 无法分析实体变更对 Repository 的影响
- `@Query` 注解中的 JPQL/SQL 无法关联到具体实体

**建议**：在参数类型解析完成后，通过泛型参数建立关联；或在 Repository 类上添加 `entityType: string` 属性。

```
Class(UserRepository):
  entityType: "com.example.User"  // 来自 JpaRepository<User, Long>
  
// 或新增关系
MANAGES: Class(Repository) → Class(Entity)
  repositoryType: 'jpa' | 'mongo' | 'redis' | 'elasticsearch'
```

### 3.13 自动配置缺失 — 优先级 P3

**现状**：Spring Boot 的自动配置机制（`@EnableAutoConfiguration`、`spring.factories`、`@Conditional*` 系列）在图中无表示。

**影响**：Spring Boot 最核心的"约定优于配置"机制完全不可追踪。条件化 Bean 的装载/不装载无法分析，自动配置类的生效条件无法识别。

**建议**：这是一个复杂的元级问题，建议在 P0/P1 问题解决后再考虑。可以优先通过 `conditionalOn` 属性在 Bean 节点上记录条件信息。

---

## 4. 构建系统和配置文件缺失分析

### 4.1 Maven/Gradle 构建依赖缺失 — 优先级 P2

**现状**：GitNexus 的语言配置加载器（`gitnexus/src/core/ingestion/language-config.ts`）支持 TypeScript、Go、PHP、C#、Swift 的语言级配置，但完全没有 Java/Maven/Gradle 配置加载器。Java 使用硬编码的 JVM import 配置。

**影响**：

- Maven/Gradle 的依赖声明（`pom.xml`/`build.gradle`）不会被索引
- 无法识别项目的外部依赖（Spring Boot Starter、第三方库）
- 多模块 Maven 项目的模块间依赖不可追踪
- 依赖版本冲突检测无法实现
- BOM（Bill of Materials）导入和版本管理不可分析

**建议**：

```
// 新增节点
BuildDependency:
  name: string                  // groupId:artifactId
  filePath: string              // pom.xml 或 build.gradle 路径
  startLine: number
  endLine: number
  language: string              // 'maven' | 'gradle'
  groupId: string
  artifactId: string
  version: string
  scope: string                 // compile | test | provided | runtime
  type: string                  // jar | pom | war

// 新增关系
DEPENDS_ON: Project/Module → BuildDependency
  scope: string
  isOptional: boolean
  isTransitive: boolean
```

### 4.2 应用配置文件缺失 — 优先级 P2

**现状**：`application.yml`、`application.properties`、`application-{profile}.yml` 等 Spring Boot 配置文件不在图索引范围内。Section 节点可以表示 YAML 的节结构，但没有被 Spring 配置文件的解析流程使用。

**影响**：

- 配置项与代码的引用关系完全断裂
- Spring Boot 的 `@ConfigurationProperties(prefix=...)` 绑定无法追踪
- Profile 特定配置的覆盖关系不可分析
- 配置项的废弃/迁移影响无法评估

**建议**：与 3.3 节的 ConfigProperty 节点方案配合，解析 application.yml/properties 并建立 BINDS_TO 关系。

```
// 配置文件解析产出
Section:"spring.datasource" ──CONTAINS──→ ConfigProperty:"spring.datasource.url"
Section:"spring.datasource" ──CONTAINS──→ ConfigProperty:"spring.datasource.username"
```

---

## 5. 实施优先级矩阵

综合以上所有缺失项，按影响范围和实施难度排列优先级：

| 优先级 | 缺失项 | 影响范围 | 实施难度 | 前置依赖 |
|--------|--------|---------|---------|---------|
| P0 | 方法参数类型 (parameterTypes) | 全 Java 代码分析 | 中 | scope-based Java migration |
| P0 | 依赖注入关系 (INJECTS_INTO) | Spring Boot 核心分析 | 中 | parameterTypes (P0) |
| P0 | Bean 节点 | Spring Boot 核心分析 | 中-高 | 无 |
| P1 | 配置属性绑定 (ConfigProperty + BINDS_TO) | 配置影响分析 | 中 | Bean 节点 (P0) |
| P1 | AOP 切面关系 (ADVISES) | 横切关注点分析 | 高 | Bean 节点 (P0) |
| P1 | 事务管理属性 | 数据一致性分析 | 低 | ADVISES (P1) |
| P2 | 异常声明 (throwsTypes) | 调用链健壮性 | 低 | 无 |
| P2 | Lambda/匿名类 | 现代 Java 分析 | 中 | scope-based migration |
| P2 | 泛型实例化 | 类型精确追踪 | 高 | parameterTypes (P0) |
| P2 | Spring Security 授权链 | 安全审计 | 中 | Bean 节点 (P0) |
| P2 | 事件系统 | 事件驱动分析 | 中 | Bean 节点 (P0) |
| P2 | 缓存注解 | 缓存一致性分析 | 低 | 无 |
| P2 | Spring Data Repository | 数据层分析 | 中 | 泛型 (P2) |
| P2 | Maven/Gradle 依赖 | 项目依赖分析 | 中 | 无 |
| P2 | 应用配置文件 | 配置追踪 | 中 | ConfigProperty (P1) |
| P3 | 枚举值 | 状态/配置分析 | 低 | 无 |
| P3 | 定时任务 | 后台任务识别 | 低 | 无 |
| P3 | 异步方法 | 调用链准确性 | 低 | 无 |
| P3 | 消息监听器 | 消息架构分析 | 中 | 无 |
| P3 | 自动配置 | 约定机制追踪 | 高 | Bean 条件属性 (P0) |

### 建议实施阶段

**第一阶段（核心基础）**：P0 级别的三项

1. 完成 Java scope-based resolution migration（RFC #909），使 parameterTypes 可自动提取
2. 在 RelationshipType 中新增 INJECTS_INTO
3. 在 NodeLabel 中新增 Bean 节点类型
4. 实现 Spring 注解语义分析器（从框架检测升级到图结构产出）

**第二阶段（框架语义）**：P1 级别的四项

5. 新增 ConfigProperty 节点和 BINDS_TO 关系
6. 新增 ADVISES 关系（AOP/事务）
7. 扩展 Method 节点的事务属性
8. 解析 application.yml/properties

**第三阶段（扩展能力）**：P2 级别

9. 补充 throwsTypes、Lambda 支持
10. 泛型实例化解析
11. Spring Security/Event/Cache 语义
12. Maven/Gradle 构建依赖

**第四阶段（完善补充）**：P3 级别

13. 枚举值、定时任务、异步方法
14. 消息监听器
15. 自动配置追踪

---

## 6. 对现有图查询和工具的影响分析

### 6.1 影响分析查询失效场景

以 GitNexus 现有的影响分析能力为例（参考 `java-class-impact.test.ts`），当用户修改一个 Spring Bean 类时，以下查询链会失败：

**场景：修改 UserService 接口**

当前图中可以追踪到的：
- `UserService` 的 IMPLEMENTS 边 → 找到 `UserServiceImpl`
- `UserServiceImpl` 的 HAS_METHOD 边 → 找到所有方法
- 方法上的 CALLS 边 → 找到直接调用的方法

当前图中无法追踪到的：
- 通过 `@Autowired` 注入 `UserService` 的所有 Controller 和其他 Service（INJECTS_INTO 缺失）
- `@Transactional` 代理对 `UserServiceImpl` 方法的包装（ADVISES 缺失）
- `@Cacheable` 对 `getUser()` 方法的缓存绑定（缓存属性缺失）
- `UserService` 对应的 `@Repository` 异常转换代理（Bean 节点缺失）
- `@EventListener` 监听 `UserCreatedEvent` 的方法（事件系统缺失）

这意味着对于 Spring Boot 项目，当前的影响分析只能覆盖约 30% 的实际影响路径。

### 6.2 入口点检测的局限

框架检测系统（framework-detection.ts）通过路径和注解模式检测入口点，产出 `FrameworkHint`。这个设计的问题在于：只影响评分（`entryPointMultiplier`），不产生图结构。Spring Boot 的真正入口点不是 `@Controller` 方法，而是通过 DI 链可到达的 `@RequestMapping` 方法。缺少 INJECTS_INTO 边，无法构建完整的请求处理链。

### 6.3 Process 检测的局限

Process 节点表示"入口点 → 终点"的执行流，但当前 Process 检测依赖 CALLS 边的传递闭包。在 Spring Boot 中，Controller 调用 Service 不是通过 CALLS 边（构造器注入的调用指向 Constructor 而非 Service 接口），而是通过 DI 容器在运行时解析。因此 Process 检测在 Spring Boot 场景下会产生大量断裂的路径。

### 6.4 Community 检测的偏差

社区检测算法基于图的结构连接性（CALLS、IMPORTS、CONTAINS 等边）来聚类。Spring Boot 项目中，Bean 之间通过 DI 的隐式连接远比显式 CALLS 更密集。缺少 INJECTS_INTO 边会导致同一业务模块的 Bean 被分散到不同社区，Controller 层和 Service 层被识别为不相关的社区，社区内聚度评分偏低，不反映真实结构。

### 6.5 对数据库 Schema 的影响

`schema-constants.ts` 中的 NODE_TABLES 有 42 个条目（包含 'Decorator'、'Import'、'Type' 等不在 NodeLabel 联合类型中的类型），REL_TYPES 有 21 个条目（包含 legacy 'OVERRIDES' 别名）。新增 Bean 和 ConfigProperty 节点类型、INJECTS_INTO/ADVISES/BINDS_TO 等关系类型需要同步更新以下内容：`types.ts` 中的 NodeLabel 和 RelationshipType 联合类型；`schema-constants.ts` 中的 NODE_TABLES 和 REL_TYPES 数组；overview.md 中文文档和英文文档；数据库迁移脚本（新增表和索引）；图实现的索引结构（relationshipsByType 需支持新关系类型）。

---

## 7. 推荐实施方案

### 7.1 利用 COBOL 先例：领域特定图扩展

COBOL 图模型是 GitNexus 中领域特定扩展的成功先例。它通过以下方式扩展了核心图模型：复用核心节点类型（Module、Function、Record、Property、Const、CodeElement、Constructor）；新增领域特定边类型（REDEFINES、RECORD_KEY_OF、FILE_STATUS_OF、RECEIVES、CONTRACTS）；这些边类型不在 `RelationshipType` 联合类型中，而是作为字符串存储在 `CodeRelation.type` 中；通过 CodeElement 节点的 `description` 属性区分子类型（如 `select`、`fd`、`sql-table`、`cics-map`）。

Spring Boot 扩展应采用类似模式。核心原则是：最小化核心类型系统的改动，最大化框架特定语义的表达。

### 7.2 推荐架构：分层扩展模型

```
┌─────────────────────────────────────────┐
│        通用图结构层（核心）               │
│  NodeLabel(34) + RelationshipType(22)   │
│  不变：Class, Method, CALLS, INHERITS... │
└──────────────┬──────────────────────────┘
               │ 扩展
┌──────────────▼──────────────────────────┐
│     Java 通用扩展层                      │
│  parameterTypes, throwsTypes, Lambda     │
│  对核心类型属性和节点的增量扩展            │
└──────────────┬──────────────────────────┘
               │ 扩展
┌──────────────▼──────────────────────────┐
│     Spring Boot 框架扩展层               │
│  Bean, ConfigProperty, INJECTS_INTO     │
│  ADVISES, BINDS_TO, SECURES...          │
│  可通过插件系统独立加载                   │
└─────────────────────────────────────────┘
```

### 7.3 哪些改动应进入核心类型系统

以下改动建议直接修改 `types.ts` 中的核心类型定义：

| 改动 | 理由 |
|------|------|
| NodeLabel 新增 'Bean' | Bean 是 Spring 的一等公民概念，且未来其他 DI 框架（如 Jakarta CDI、Micronaut）可复用 |
| NodeLabel 新增 'ConfigProperty' | 配置属性绑定不是 Spring 独有的，.NET IConfiguration、Node.js dotenv 都有类似需求 |
| NodeLabel 新增 'BuildDependency' | 构建依赖是所有语言的项目级概念 |
| RelationshipType 新增 'INJECTS_INTO' | 依赖注入是 IoC 容器的核心语义，应作为一等关系 |
| RelationshipType 新增 'ADVISES' | AOP 是跨语言概念（AspectJ、.NET Interceptors、Python Decorators） |
| RelationshipType 新增 'BINDS_TO' | 配置绑定是跨框架概念 |
| Method.parameterTypes | 强类型语言的基本需求 |
| Method.throwsTypes | Java/C# 的异常签名是方法签名的一部分 |

### 7.4 哪些改动应作为框架扩展（不在核心类型中）

以下改动建议采用 COBOL 模式，作为字符串存储在关系类型中，通过插件系统加载：

| 改动 | 理由 |
|------|------|
| SECURES, PUBLISHES, SUBSCRIBES_TO | Spring 特有语义，通用性不足 |
| CONSUMES_FROM | 消息中间件绑定是 Spring 生态特有 |
| MANAGES (Repository → Entity) | 可通过泛型解析推导，无需独立关系 |
| Method.cache / Method.scheduled | Spring 特有注解属性 |
| 自动配置追踪 | Spring Boot 特有机制 |

### 7.5 插件系统改造建议

当前 Spring Analyzer 插件仅为文档示例，且其输出类型（`spring.component`、`spring.annotation`、`spring.method`）不是标准 NodeLabel。建议将其改造为真正的框架扩展插件：

1. 插件应产出标准 NodeLabel（Bean、ConfigProperty）和核心 RelationshipType（INJECTS_INTO、ADVISES、BINDS_TO）
2. Spring 特有的语义通过 NodeProperties 的扩展属性表达（利用 `[key: string]: unknown` 的可扩展性）
3. 插件应注册为 AnalyzerPlugin 类型，在 AST 解析后作为后处理步骤运行
4. 需要新增 FrameworkPlugin 接口，支持跨文件语义分析（DI 需要全局 Bean 注册表）

### 7.6 与 Scope-Based Resolution 的协同

RFC #909 的 scope-based resolution pipeline 正在逐步迁移各语言。对 Java 而言，完成迁移后的收益包括：`@declaration.parameter-types` 捕获机制已存在，可直接获取参数类型；`interpretImport` 钩子可以解析 Java 的 `import` 语句到具体类；`interpretTypeBinding` 钩子可以解析泛型实例化；`emitScopeCaptures` 可以捕获 Lambda 和匿名类。

Java 的 scope-based migration 应当作为 Spring Boot 图扩展的前置条件优先完成。

---

## 8. 总结

GitNexus 当前的图数据模型在通用 OOP 语义层面覆盖良好，34 种节点类型和 22 种关系类型足以表达基本的代码结构。但在 Java/Spring Boot 场景下存在系统性缺口。

核心问题有三个：方法参数类型缺失导致重载解析不可能、依赖注入关系缺失导致 Spring Bean 依赖图不可追踪、Bean 节点缺失导致框架语义无法表达。这三项是 P0 级别的必须修复项，不解决它们，Spring Boot 代码的影响分析、调用链追踪、架构理解等核心能力将无法实现。

中等优先级的问题集中在框架语义层：配置属性绑定、AOP 切面、事务管理、安全授权、事件系统。这些是 Spring Boot 开发者日常使用的高频特性，缺失后图查询只能覆盖约 30% 的实际影响路径。

推荐采用 COBOL 领域扩展先例的分层架构：核心类型系统只新增通用性强的节点和关系类型（Bean、ConfigProperty、INJECTS_INTO、ADVISES、BINDS_TO），Spring 特有语义通过插件系统作为扩展属性表达。Java scope-based resolution migration 应优先完成，它是参数类型和泛型解析的技术前提。

---

## References

1. [GitNexus Graph Types (Single Source of Truth)](D:/mycode/GitNexus/gitnexus-shared/src/graph/types.ts)
2. [GitNexus 图数据结构中文文档](D:/mycode/GitNexus/docs/zh/graph-node/overview.md)
3. [COBOL Graph Model](D:/mycode/GitNexus/docs/code-indexing/cobol/graph-model.md)
4. [Spring Analyzer Plugin 示例](D:/mycode/GitNexus/docs/plugins/examples/analyzer-plugins/spring-analyzer/README.md)
5. [Java Language Provider](D:/mycode/GitNexus/gitnexus/src/core/ingestion/languages/java.ts)
6. [Framework Detection](D:/mycode/GitNexus/gitnexus/src/core/ingestion/framework-detection.ts)
7. [Language Provider Interface](D:/mycode/GitNexus/gitnexus/src/core/ingestion/language-provider.ts)
8. [Scope Extractor](D:/mycode/GitNexus/gitnexus/src/core/ingestion/scope-extractor.ts)
9. [Java Class Impact Integration Test](D:/mycode/GitNexus/gitnexus/test/integration/java-class-impact.test.ts)
10. [DB Schema Constants](D:/mycode/GitNexus/gitnexus-shared/src/lbug/schema-constants.ts)
