# GitNexus 图数据结构

## 概述

GitNexus 使用基于图的数据模型来表示和分析代码库。本文档详细解释了 GitNexus 知识图谱中的所有节点类型及其属性。

## 节点类型 (NodeLabel)

### Project

代表整个代码库项目的根节点。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| name | string | 项目名称 |
| filePath | string | 项目的根路径 |

### Package

代表项目中的一个包或库。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| name | string | 包名称 |
| filePath | string | 包定义的路径 |
| language | string | 包的编程语言 |

### Module

代表代码库中的一个模块或命名空间。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| name | string | 模块名称 |
| filePath | string | 模块文件路径 |
| language | string | 编程语言 |
| isExported | boolean | 模块是否被导出 |

### Folder

代表文件系统中的一个目录。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| name | string | 文件夹名称 |
| filePath | string | 文件夹的绝对路径 |

### File

代表一个源代码文件。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| name | string | 文件名称 |
| filePath | string | 文件的绝对路径 |
| language | string | 编程语言 |
| isExported | boolean | 文件是否导出公共符号 |

### Class

代表一个类定义。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| name | string | 类名称 |
| filePath | string | 包含该类的文件路径 |
| startLine | number | 类定义的起始行 |
| endLine | number | 类定义的结束行 |
| language | string | 编程语言 |
| isExported | boolean | 类是否被导出 |
| visibility | string | 可见性修饰符（public、private、protected） |
| isAbstract | boolean | 类是否是抽象类 |
| isFinal | boolean | 类是否是最终类 |
| annotations | string[] | 注解列表 |
| parameterCount | number | 类型参数（泛型）数量 |
| level | number | 在文件中的嵌套级别 |

### Function

代表一个独立函数。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| name | string | 函数名称 |
| filePath | string | 包含该函数的文件路径 |
| startLine | number | 函数定义的起始行 |
| endLine | number | 函数定义的结束行 |
| language | string | 编程语言 |
| isExported | boolean | 函数是否被导出 |
| visibility | string | 可见性修饰符 |
| isStatic | boolean | 函数是否是静态的 |
| isAsync | boolean | 函数是否是异步的 |
| parameterCount | number | 参数数量 |
| returnType | string | 返回类型注解 |
| level | number | 在文件中的嵌套级别 |

### Method

代表一个类方法。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| name | string | 方法名称 |
| filePath | string | 包含该方法的文件路径 |
| startLine | number | 方法定义的起始行 |
| endLine | number | 方法定义的结束行 |
| language | string | 编程语言 |
| isExported | boolean | 方法是否被导出 |
| visibility | string | 可见性修饰符（public、private、protected） |
| isStatic | boolean | 方法是否是静态的 |
| isAsync | boolean | 方法是否是异步的 |
| isVirtual | boolean | 方法是否是虚方法 |
| isOverride | boolean | 方法是否覆盖父类方法 |
| isAbstract | boolean | 方法是否是抽象的 |
| parameterCount | number | 参数数量 |
| returnType | string | 返回类型注解 |
| declaredType | string | 声明类类型 |
| annotations | string[] | 注解列表 |

### Variable

代表一个变量或常量。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| name | string | 变量名称 |
| filePath | string | 包含该变量的文件路径 |
| startLine | number | 变量声明的起始行 |
| endLine | number | 变量声明的结束行 |
| language | string | 编程语言 |
| isExported | boolean | 变量是否被导出 |
| visibility | string | 可见性修饰符 |
| isStatic | boolean | 变量是否是静态的 |
| isReadonly | boolean | 变量是否是只读的 |
| declaredType | string | 变量的声明类型 |

### Interface

代表一个接口定义。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| name | string | 接口名称 |
| filePath | string | 包含该接口的文件路径 |
| startLine | number | 接口定义的起始行 |
| endLine | number | 接口定义的结束行 |
| language | string | 编程语言 |
| isExported | boolean | 接口是否被导出 |
| visibility | string | 可见性修饰符 |
| annotations | string[] | 注解列表 |
| parameterCount | number | 类型参数数量 |

### Enum

代表一个枚举类型。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| name | string | 枚举名称 |
| filePath | string | 包含该枚举的文件路径 |
| startLine | number | 枚举定义的起始行 |
| endLine | number | 枚举定义的结束行 |
| language | string | 编程语言 |
| isExported | boolean | 枚举是否被导出 |
| visibility | string | 可见性修饰符 |

### Decorator

代表一个装饰器或属性。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| name | string | 装饰器名称 |
| filePath | string | 包含该装饰器的文件路径 |
| startLine | number | 装饰器的起始行 |
| endLine | number | 装饰器的结束行 |
| language | string | 编程语言 |

### Import

代表一个导入语句。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| name | string | 被导入的模块/符号名称 |
| filePath | string | 包含该导入的文件路径 |
| startLine | number | 导入语句的起始行 |
| endLine | number | 导入语句的结束行 |
| language | string | 编程语言 |
| isExported | boolean | 这是否是重导出 |

### Type

代表一个类型定义（类型别名）。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| name | string | 类型名称 |
| filePath | string | 包含该类型的文件路径 |
| startLine | number | 类型定义的起始行 |
| endLine | number | 类型定义的结束行 |
| language | string | 编程语言 |
| isExported | boolean | 类型是否被导出 |
| declaredType | string | 底层类型 |
| annotations | string[] | 注解列表 |

### CodeElement

一个通用节点，用于表示不适合其他类别的各种代码元素。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| name | string | 元素名称 |
| filePath | string | 包含该元素的文件路径 |
| startLine | number | 元素的起始行 |
| endLine | number | 元素的结束行 |
| language | string | 编程语言 |
| isExported | boolean | 元素是否被导出 |
| description | string | 额外的描述或元数据 |
| keywords | string[] | 关联的关键字 |

### Community

代表由社区检测算法检测到的相关代码社区。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| name | string | 社区标识符 |
| heuristicLabel | string | 人类可读的标签 |
| cohesion | number | 社区的内聚度分数 |
| symbolCount | number | 社区中的符号数量 |
| keywords | string[] | 描述社区的关键字 |
| description | string | 社区描述 |
| enrichedBy | string | 社区是如何被丰富的（启发式或LLM） |

### Process

代表通过代码库的执行流或过程。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| name | string | 过程名称（格式："入口点 → 终点"） |
| processType | string | 类型：intra_community 或 cross_community |
| stepCount | number | 过程中的步骤数 |
| communities | string[] | 过程中涉及的社区 |
| entryPointId | string | 入口点节点的ID |
| terminalId | string | 终点节点的ID |
| entryPointScore | number | 入口点检测的分数 |
| entryPointReason | string | 选择入口点的理由 |
| description | string | 过程描述 |

### Struct

代表一个结构体（C、Go、Rust 等）。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| name | string | 结构体名称 |
| filePath | string | 包含该结构体的文件路径 |
| startLine | number | 结构体定义的起始行 |
| endLine | number | 结构体定义的结束行 |
| language | string | 编程语言 |
| isExported | boolean | 结构体是否被导出 |
| visibility | string | 可见性修饰符 |
| isFinal | boolean | 结构体是否是最终的（对于支持它的语言） |
| annotations | string[] | 注解列表 |
| parameterCount | number | 类型参数数量 |

### Macro

代表一个宏定义。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| name | string | 宏名称 |
| filePath | string | 包含该宏的文件路径 |
| startLine | number | 宏定义的起始行 |
| endLine | number | 宏定义的结束行 |
| language | string | 编程语言 |
| isExported | boolean | 宏是否被导出 |

### Typedef

代表一个类型定义（C typedef）。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| name | string | Typedef 名称 |
| filePath | string | 包含该 typedef 的文件路径 |
| startLine | number | typedef 的起始行 |
| endLine | number | typedef 的结束行 |
| language | string | 编程语言 |
| isExported | boolean | typedef 是否被导出 |
| declaredType | string | 底层类型 |

### Union

代表一个联合类型（C union）。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| name | string | 联合体名称 |
| filePath | string | 包含该联合体的文件路径 |
| startLine | number | 联合体定义的起始行 |
| endLine | number | 联合体定义的结束行 |
| language | string | 编程语言 |
| isExported | boolean | 联合体是否被导出 |
| visibility | string | 可见性修饰符 |

### Namespace

代表一个命名空间或包作用域。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| name | string | 命名空间名称 |
| filePath | string | 包含该命名空间的文件路径 |
| startLine | number | 命名空间的起始行 |
| endLine | number | 命名空间的结束行 |
| language | string | 编程语言 |
| isExported | boolean | 命名空间是否被导出 |

### Trait

代表一个 trait（Rust、PHP 等）。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| name | string | Trait 名称 |
| filePath | string | 包含该 trait 的文件路径 |
| startLine | number | trait 定义的起始行 |
| endLine | number | trait 定义的结束行 |
| language | string | 编程语言 |
| isExported | boolean | trait 是否被导出 |
| visibility | string | 可见性修饰符 |
| annotations | string[] | 注解列表 |

### Impl

代表一个实现块（Rust impl、TypeScript implements）。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| name | string | 实现名称（通常是类型名称） |
| filePath | string | 包含该 impl 的文件路径 |
| startLine | number | impl 块的起始行 |
| endLine | number | impl 块的结束行 |
| language | string | 编程语言 |
| isExported | boolean | impl 是否被导出 |
| declaredType | string | 被实现的类型 |
| annotations | string[] | 注解列表 |

### TypeAlias

代表一个类型别名。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| name | string | 别名名称 |
| filePath | string | 包含该别名的文件路径 |
| startLine | number | 别名的起始行 |
| endLine | number | 别名的结束行 |
| language | string | 编程语言 |
| isExported | boolean | 别名是否被导出 |
| declaredType | string | 原始类型 |

### Const

代表一个常量。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| name | string | 常量名称 |
| filePath | string | 包含该常量的文件路径 |
| startLine | number | 常量的起始行 |
| endLine | number | 常量的结束行 |
| language | string | 编程语言 |
| isExported | boolean | 常量是否被导出 |
| visibility | string | 可见性修饰符 |
| declaredType | string | 常量的类型 |
| isStatic | boolean | 常量是否是静态的 |

### Static

代表一个静态成员或块。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| name | string | 静态成员名称 |
| filePath | string | 包含该静态成员的文件路径 |
| startLine | number | 静态成员的起始行 |
| endLine | number | 静态成员的结束行 |
| language | string | 编程语言 |
| isExported | boolean | 静态成员是否被导出 |
| visibility | string | 可见性修饰符 |
| declaredType | string | 静态成员的类型 |

### Property

代表一个属性（C#、JavaScript get/set 等）。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| name | string | 属性名称 |
| filePath | string | 包含该属性的文件路径 |
| startLine | number | 属性的起始行 |
| endLine | number | 属性的结束行 |
| language | string | 编程语言 |
| isExported | boolean | 属性是否被导出 |
| visibility | string | 可见性修饰符 |
| isStatic | boolean | 属性是否是静态的 |
| isReadonly | boolean | 属性是否是只读的 |
| declaredType | string | 属性的类型 |
| annotations | string[] | 注解列表 |

### Record

代表一个记录类型（Java record、Python dataclass 等）。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| name | string | 记录名称 |
| filePath | string | 包含该记录的文件路径 |
| startLine | number | 记录定义的起始行 |
| endLine | number | 记录定义的结束行 |
| language | string | 编程语言 |
| isExported | boolean | 记录是否被导出 |
| visibility | string | 可见性修饰符 |
| annotations | string[] | 注解列表 |

### Delegate

代表一个委托类型（C#、Swift 等）。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| name | string | 委托名称 |
| filePath | string | 包含该委托的文件路径 |
| startLine | number | 委托的起始行 |
| endLine | number | 委托的结束行 |
| language | string | 编程语言 |
| isExported | boolean | 委托是否被导出 |
| visibility | string | 可见性修饰符 |
| returnType | string | 返回类型 |
| parameterCount | number | 参数数量 |

### Annotation

代表一个注解类型（Java 注解）。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| name | string | 注解名称 |
| filePath | string | 包含该注解的文件路径 |
| startLine | number | 注解的起始行 |
| endLine | number | 注解的结束行 |
| language | string | 编程语言 |
| isExported | boolean | 注解是否被导出 |
| visibility | string | 可见性修饰符 |

### Constructor

代表一个构造函数。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| name | string | 构造函数名称（通常与类相同） |
| filePath | string | 包含该构造函数的文件路径 |
| startLine | number | 构造函数的起始行 |
| endLine | number | 构造函数的结束行 |
| language | string | 编程语言 |
| visibility | string | 可见性修饰符 |
| parameterCount | number | 参数数量 |
| annotations | string[] | 注解列表 |

### Template

代表一个模板或泛型定义。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| name | string | 模板名称 |
| filePath | string | 包含该模板的文件路径 |
| startLine | number | 模板的起始行 |
| endLine | number | 模板的结束行 |
| language | string | 编程语言 |
| isExported | boolean | 模板是否被导出 |
| parameterCount | number | 类型参数数量 |

### Section

代表文件中的一个节（markdown 节、配置节等）。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| name | string | 节名称（标题） |
| filePath | string | 包含该节的文件路径 |
| startLine | number | 节的起始行 |
| endLine | number | 节的结束行 |
| language | string | 编程语言（对于代码节） |
| level | number | 节嵌套级别 |

### Route

代表一个 API 路由或端点。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| name | string | 路由路径/模式 |
| filePath | string | 包含该路由的文件路径 |
| startLine | number | 路由定义的起始行 |
| endLine | number | 路由定义的结束行 |
| language | string | 编程语言 |
| responseKeys | string[] | 响应键/字段 |
| errorKeys | string[] | 错误键/字段 |
| middleware | string[] | 中间件链 |
| annotations | string[] | 装饰器/属性列表 |

### Tool

代表一个可以被调用的工具或命令。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| name | string | 工具名称 |
| filePath | string | 包含该工具定义的文件路径 |
| startLine | number | 工具定义的起始行 |
| endLine | number | 工具定义的结束行 |
| language | string | 编程语言 |
| description | string | 工具描述 |
| annotations | string[] | 注解列表 |

## 关系类型 (RelationshipType)

### CONTAINS

表示一个节点包含另一个节点（例如：文件包含类）。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| confidence | number | 置信度分数（0-1） |
| reason | string | 关系的解释 |
| step | number | 过程中可选的步骤号 |

### CALLS

表示函数/方法调用关系。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| confidence | number | 置信度分数（0-1） |
| reason | string | 关系的解释（例如："direct-call"、"import-resolved"） |
| step | number | 过程中可选的步骤号 |

### INHERITS

表示类继承关系（父类到子类）。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| confidence | number | 置信度分数（0-1） |
| reason | string | 关系的解释 |
| step | number | 过程中可选的步骤号 |

### METHOD_OVERRIDES

表示一个方法覆盖了父类方法。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| confidence | number | 置信度分数（0-1） |
| reason | string | 关系的解释 |
| step | number | 过程中可选的步骤号 |

### METHOD_IMPLEMENTS

表示一个方法实现了接口方法。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| confidence | number | 置信度分数（0-1） |
| reason | string | 关系的解释 |
| step | number | 过程中可选的步骤号 |

### IMPORTS

表示文件级别的导入语句。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| confidence | number | 置信度分数（0-1） |
| reason | string | 关系的解释 |
| step | number | 过程中可选的步骤号 |

### USES

表示使用了一个依赖或工具。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| confidence | number | 置信度分数（0-1） |
| reason | string | 关系的解释 |
| step | number | 过程中可选的步骤号 |

### DEFINES

表示一个节点定义了一个符号。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| confidence | number | 置信度分数（0-1） |
| reason | string | 关系的解释 |
| step | number | 过程中可选的步骤号 |

### DECORATES

表示一个装饰器应用于一个节点。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| confidence | number | 置信度分数（0-1） |
| reason | string | 关系的解释 |
| step | number | 过程中可选的步骤号 |

### IMPLEMENTS

表示一个类实现了一个接口。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| confidence | number | 置信度分数（0-1） |
| reason | string | 关系的解释 |
| step | number | 过程中可选的步骤号 |

### EXTENDS

表示扩展了父类型。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| confidence | number | 置信度分数（0-1） |
| reason | string | 关系的解释 |
| step | number | 过程中可选的步骤号 |

### HAS_METHOD

表示一个类/接口有一个方法。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| confidence | number | 置信度分数（0-1） |
| reason | string | 关系的解释 |
| step | number | 过程中可选的步骤号 |

### HAS_PROPERTY

表示一个类/接口有一个属性。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| confidence | number | 置信度分数（0-1） |
| reason | string | 关系的解释 |
| step | number | 过程中可选的步骤号 |

### ACCESSES

表示对变量或数据区域的读/写访问。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| confidence | number | 置信度分数（0-1） |
| reason | string | 关系的解释 |
| step | number | 过程中可选的步骤号 |

### MEMBER_OF

表示属于容器成员（例如：方法是类的成员）。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| confidence | number | 置信度分数（0-1） |
| reason | string | 关系的解释 |
| step | number | 过程中可选的步骤号 |

### STEP_IN_PROCESS

表示执行过程中的一个步骤。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| confidence | number | 置信度分数（0-1） |
| reason | string | 关系的解释 |
| step | number | 过程中的步骤号 |

### HANDLES_ROUTE

表示一个处理器处理一个路由。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| confidence | number | 置信度分数（0-1） |
| reason | string | 关系的解释 |
| step | number | 过程中可选的步骤号 |

### FETCHES

表示代码从路由或端点获取数据。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| confidence | number | 置信度分数（0-1） |
| reason | string | 关系的解释 |
| step | number | 过程中可选的步骤号 |

### HANDLES_TOOL

表示代码处理或调用一个工具。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| confidence | number | 置信度分数（0-1） |
| reason | string | 关系的解释 |
| step | number | 过程中可选的步骤号 |

### ENTRY_POINT_OF

表示一个节点是一个过程的入口点。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| confidence | number | 置信度分数（0-1） |
| reason | string | 关系的解释 |
| step | number | 过程中可选的步骤号 |

### WRAPS

表示包装行为（例如：包装函数）。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| confidence | number | 置信度分数（0-1） |
| reason | string | 关系的解释 |
| step | number | 过程中可选的步骤号 |

### QUERIES

表示查询或数据库访问。

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| confidence | number | 置信度分数（0-1） |
| reason | string | 关系的解释 |
| step | number | 过程中可选的步骤号 |

## 图实现

### KnowledgeGraph 接口

`KnowledgeGraph` 接口提供以下方法：

| 方法 | 描述 |
|--------|-------------|
| nodes | 获取所有节点作为数组 |
| relationships | 获取所有关系作为数组 |
| iterNodes() | 遍历节点 |
| iterRelationships() | 遍历关系 |
| iterRelationshipsByType(type) | 遍历特定类型的关系 |
| forEachNode(fn) | 对每个节点执行函数 |
| forEachRelationship(fn) | 对每个关系执行函数 |
| getNode(id) | 通过ID获取节点 |
| nodeCount | 节点数量 |
| relationshipCount | 关系数量 |
| addNode(node) | 添加节点 |
| addRelationship(relationship) | 添加关系 |
| removeNode(nodeId) | 删除节点 |
| removeNodesByFile(filePath) | 删除文件的所有节点 |
| removeRelationship(relationshipId) | 删除关系 |

### 索引结构

图实现使用多个索引以实现高效操作：

1. **nodeMap**: Map<string, GraphNode> - O(1) 节点查找
2. **relationshipMap**: Map<string, GraphRelationship> - O(1) 关系查找
3. **relationshipsByType**: Map<RelationshipType, Map<string, GraphRelationship>> - 快速的基于类型的迭代
4. **edgeIdsByNode**: Map<string, Set<string>> - 反向邻接索引，用于高效的节点删除
5. **nodeIdsByFile**: Map<string, Set<string>> - 基于文件的索引，用于高效的文件删除

### 证据追踪

关系可以包含一个 `evidence` 数组，用于追踪边的来源：

```typescript
evidence?: readonly {
  readonly kind: string;      // 证据类型
  readonly weight: number;    // 此证据的权重
  readonly note?: string;    // 可选备注
}[]
```

这对于由基于作用域的解析管道（RFC #909 Ring 2 PKG #925）发出的边特别有用，允许下游查询和审计工具理解为什么给定边以其置信度值发出。

## 常见节点组合

### 类层次结构
```
File → CONTAINS → Class
Class → INHERITS → Class (父类)
Class → IMPLEMENTS → Interface
Class → HAS_METHOD → Method
Class → HAS_PROPERTY → Property
Method → MEMBER_OF → Class
```

### 函数调用流
```
File → IMPORTS → File (被导入的)
Function → CALLS → Function (被调用的)
Function → ACCESSES → Variable (读/写)
```

### 过程检测
```
Process → STEP_IN_PROCESS → Function (步骤 1)
Process → STEP_IN_PROCESS → Function (步骤 2)
Process → ENTRY_POINT_OF → Function
```

### 社区结构
```
Community → CONTAINS → Class
Community → CONTAINS → Function
Community → CONTAINS → Interface
```

## 使用示例

### 查询类方法
```cypher
MATCH (c:Class {name: "MyClass"})-[:HAS_METHOD]->(m:Method)
RETURN m.name, m.visibility, m.isStatic
```

### 查找导入依赖
```cypher
MATCH (f:File)-[:IMPORTS]->(g:File)
WHERE f.name = "main.ts"
RETURN g.name, g.filePath
```

### 分析调用流
```cypher
MATCH (caller:Function)-[:CALLS]->(callee:Function)
WHERE caller.name = "processData"
RETURN callee.name, callee.filePath
```

### 社区分析
```cypher
MATCH (community:Community)
RETURN community.name, community.cohesion, community.symbolCount
ORDER BY community.cohesion DESC
```

## AST 框架乘数

节点可能包含 AST 框架丰富信息：

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| astFrameworkMultiplier | number | 来自 AST 框架检测的置信度乘数 |
| astFrameworkReason | string | 乘数的理由 |

当在代码中检测到特定于框架的模式时使用此功能，允许图在遵循框架约定时更重地加权关系。
