# GitNexus Graph Data Structure

## Overview

GitNexus uses a graph-based data model to represent and analyze codebases. This document provides a detailed explanation of all node types and their properties in the GitNexus knowledge graph.

## Node Types (NodeLabel)

### Project

The root node representing the entire codebase project.

| Property | Type | Description |
|----------|------|-------------|
| name | string | Project name |
| filePath | string | Root path of the project |

### Package

Represents a package or library within the project.

| Property | Type | Description |
|----------|------|-------------|
| name | string | Package name |
| filePath | string | Path to package definition |
| language | string | Programming language of the package |

### Module

Represents a module or namespace within the codebase.

| Property | Type | Description |
|----------|------|-------------|
| name | string | Module name |
| filePath | string | Path to module file |
| language | string | Programming language |
| isExported | boolean | Whether the module is exported |

### Folder

Represents a directory in the file system.

| Property | Type | Description |
|----------|------|-------------|
| name | string | Folder name |
| filePath | string | Absolute path to folder |

### File

Represents a source code file.

| Property | Type | Description |
|----------|------|-------------|
| name | string | File name |
| filePath | string | Absolute path to file |
| language | string | Programming language |
| isExported | boolean | Whether the file exports public symbols |

### Class

Represents a class definition.

| Property | Type | Description |
|----------|------|-------------|
| name | string | Class name |
| filePath | string | Path to file containing the class |
| startLine | number | Start line of class definition |
| endLine | number | End line of class definition |
| language | string | Programming language |
| isExported | boolean | Whether the class is exported |
| visibility | string | Visibility modifier (public, private, protected) |
| isAbstract | boolean | Whether the class is abstract |
| isFinal | boolean | Whether the class is final |
| annotations | string[] | List of annotations |
| parameterCount | number | Number of type parameters (generics) |
| level | number | Nesting level in file |

### Function

Represents a standalone function.

| Property | Type | Description |
|----------|------|-------------|
| name | string | Function name |
| filePath | string | Path to file containing the function |
| startLine | number | Start line of function definition |
| endLine | number | End line of function definition |
| language | string | Programming language |
| isExported | boolean | Whether the function is exported |
| visibility | string | Visibility modifier |
| isStatic | boolean | Whether the function is static |
| isAsync | boolean | Whether the function is async |
| parameterCount | number | Number of parameters |
| returnType | string | Return type annotation |
| level | number | Nesting level in file |

### Method

Represents a class method.

| Property | Type | Description |
|----------|------|-------------|
| name | string | Method name |
| filePath | string | Path to file containing the method |
| startLine | number | Start line of method definition |
| endLine | number | End line of method definition |
| language | string | Programming language |
| isExported | boolean | Whether the method is exported |
| visibility | string | Visibility modifier (public, private, protected) |
| isStatic | boolean | Whether the method is static |
| isAsync | boolean | Whether the method is async |
| isVirtual | boolean | Whether the method is virtual |
| isOverride | boolean | Whether the method overrides a parent method |
| isAbstract | boolean | Whether the method is abstract |
| parameterCount | number | Number of parameters |
| returnType | string | Return type annotation |
| declaredType | string | Declaring class type |
| annotations | string[] | List of annotations |

### Variable

Represents a variable or constant.

| Property | Type | Description |
|----------|------|-------------|
| name | string | Variable name |
| filePath | string | Path to file containing the variable |
| startLine | number | Start line of variable declaration |
| endLine | number | End line of variable declaration |
| language | string | Programming language |
| isExported | boolean | Whether the variable is exported |
| visibility | string | Visibility modifier |
| isStatic | boolean | Whether the variable is static |
| isReadonly | boolean | Whether the variable is read-only |
| declaredType | string | Declared type of the variable |

### Interface

Represents an interface definition.

| Property | Type | Description |
|----------|------|-------------|
| name | string | Interface name |
| filePath | string | Path to file containing the interface |
| startLine | number | Start line of interface definition |
| endLine | number | End line of interface definition |
| language | string | Programming language |
| isExported | boolean | Whether the interface is exported |
| visibility | string | Visibility modifier |
| annotations | string[] | List of annotations |
| parameterCount | number | Number of type parameters |

### Enum

Represents an enumeration type.

| Property | Type | Description |
|----------|------|-------------|
| name | string | Enum name |
| filePath | string | Path to file containing the enum |
| startLine | number | Start line of enum definition |
| endLine | number | End line of enum definition |
| language | string | Programming language |
| isExported | boolean | Whether the enum is exported |
| visibility | string | Visibility modifier |

### Decorator

Represents a decorator or attribute.

| Property | Type | Description |
|----------|------|-------------|
| name | string | Decorator name |
| filePath | string | Path to file containing the decorator |
| startLine | number | Start line of decorator |
| endLine | number | End line of decorator |
| language | string | Programming language |

### Import

Represents an import statement.

| Property | Type | Description |
|----------|------|-------------|
| name | string | Imported module/symbol name |
| filePath | string | Path to file containing the import |
| startLine | number | Start line of import statement |
| endLine | number | End line of import statement |
| language | string | Programming language |
| isExported | boolean | Whether this is a re-export |

### Type

Represents a type definition (type alias).

| Property | Type | Description |
|----------|------|-------------|
| name | string | Type name |
| filePath | string | Path to file containing the type |
| startLine | number | Start line of type definition |
| endLine | number | End line of type definition |
| language | string | Programming language |
| isExported | boolean | Whether the type is exported |
| declaredType | string | Underlying type |
| annotations | string[] | List of annotations |

### CodeElement

A generic node for representing various code elements that don't fit other categories.

| Property | Type | Description |
|----------|------|-------------|
| name | string | Element name |
| filePath | string | Path to file containing the element |
| startLine | number | Start line of element |
| endLine | number | End line of element |
| language | string | Programming language |
| isExported | boolean | Whether the element is exported |
| description | string | Additional description or metadata |
| keywords | string[] | Associated keywords |

### Community

Represents a community of related code detected by community detection algorithms.

| Property | Type | Description |
|----------|------|-------------|
| name | string | Community identifier |
| heuristicLabel | string | Human-readable label |
| cohesion | number | Cohesion score of the community |
| symbolCount | number | Number of symbols in the community |
| keywords | string[] | Keywords describing the community |
| description | string | Community description |
| enrichedBy | string | How the community was enriched (heuristic or llm) |

### Process

Represents an execution flow or process through the codebase.

| Property | Type | Description |
|----------|------|-------------|
| name | string | Process name (format: "EntryPoint → Terminal") |
| processType | string | Type: intra_community or cross_community |
| stepCount | number | Number of steps in the process |
| communities | string[] | Communities involved in the process |
| entryPointId | string | ID of the entry point node |
| terminalId | string | ID of the terminal node |
| entryPointScore | number | Score for entry point detection |
| entryPointReason | string | Reason for entry point selection |
| description | string | Process description |

### Struct

Represents a struct (C, Go, Rust, etc.).

| Property | Type | Description |
|----------|------|-------------|
| name | string | Struct name |
| filePath | string | Path to file containing the struct |
| startLine | number | Start line of struct definition |
| endLine | number | End line of struct definition |
| language | string | Programming language |
| isExported | boolean | Whether the struct is exported |
| visibility | string | Visibility modifier |
| isFinal | boolean | Whether the struct is final (for languages that support it) |
| annotations | string[] | List of annotations |
| parameterCount | number | Number of type parameters |

### Macro

Represents a macro definition.

| Property | Type | Description |
|----------|------|-------------|
| name | string | Macro name |
| filePath | string | Path to file containing the macro |
| startLine | number | Start line of macro definition |
| endLine | number | End line of macro definition |
| language | string | Programming language |
| isExported | boolean | Whether the macro is exported |

### Typedef

Represents a type definition (C typedef).

| Property | Type | Description |
|----------|------|-------------|
| name | string | Typedef name |
| filePath | string | Path to file containing the typedef |
| startLine | number | Start line of typedef |
| endLine | number | End line of typedef |
| language | string | Programming language |
| isExported | boolean | Whether the typedef is exported |
| declaredType | string | Underlying type |

### Union

Represents a union type (C union).

| Property | Type | Description |
|----------|------|-------------|
| name | string | Union name |
| filePath | string | Path to file containing the union |
| startLine | number | Start line of union definition |
| endLine | number | End line of union definition |
| language | string | Programming language |
| isExported | boolean | Whether the union is exported |
| visibility | string | Visibility modifier |

### Namespace

Represents a namespace or package scope.

| Property | Type | Description |
|----------|------|-------------|
| name | string | Namespace name |
| filePath | string | Path to file containing the namespace |
| startLine | number | Start line of namespace |
| endLine | number | End line of namespace |
| language | string | Programming language |
| isExported | boolean | Whether the namespace is exported |

### Trait

Represents a trait (Rust, PHP, etc.).

| Property | Type | Description |
|----------|------|-------------|
| name | string | Trait name |
| filePath | string | Path to file containing the trait |
| startLine | number | Start line of trait definition |
| endLine | number | End line of trait definition |
| language | string | Programming language |
| isExported | boolean | Whether the trait is exported |
| visibility | string | Visibility modifier |
| annotations | string[] | List of annotations |

### Impl

Represents an implementation block (Rust impl, TypeScript implements).

| Property | Type | Description |
|----------|------|-------------|
| name | string | Implementation name (usually type name) |
| filePath | string | Path to file containing the impl |
| startLine | number | Start line of impl block |
| endLine | number | End line of impl block |
| language | string | Programming language |
| isExported | boolean | Whether the impl is exported |
| declaredType | string | Type being implemented |
| annotations | string[] | List of annotations |

### TypeAlias

Represents a type alias.

| Property | Type | Description |
|----------|------|-------------|
| name | string | Alias name |
| filePath | string | Path to file containing the alias |
| startLine | number | Start line of alias |
| endLine | number | End line of alias |
| language | string | Programming language |
| isExported | boolean | Whether the alias is exported |
| declaredType | string | Original type |

### Const

Represents a constant.

| Property | Type | Description |
|----------|------|-------------|
| name | string | Constant name |
| filePath | string | Path to file containing the constant |
| startLine | number | Start line of constant |
| endLine | number | End line of constant |
| language | string | Programming language |
| isExported | boolean | Whether the constant is exported |
| visibility | string | Visibility modifier |
| declaredType | string | Type of the constant |
| isStatic | boolean | Whether the constant is static |

### Static

Represents a static member or block.

| Property | Type | Description |
|----------|------|-------------|
| name | string | Static member name |
| filePath | string | Path to file containing the static |
| startLine | number | Start line of static |
| endLine | number | End line of static |
| language | string | Programming language |
| isExported | boolean | Whether the static is exported |
| visibility | string | Visibility modifier |
| declaredType | string | Type of the static |

### Property

Represents a property (C#, JavaScript get/set, etc.).

| Property | Type | Description |
|----------|------|-------------|
| name | string | Property name |
| filePath | string | Path to file containing the property |
| startLine | number | Start line of property |
| endLine | number | End line of property |
| language | string | Programming language |
| isExported | boolean | Whether the property is exported |
| visibility | string | Visibility modifier |
| isStatic | boolean | Whether the property is static |
| isReadonly | boolean | Whether the property is read-only |
| declaredType | string | Type of the property |
| annotations | string[] | List of annotations |

### Record

Represents a record type (Java record, Python dataclass, etc.).

| Property | Type | Description |
|----------|------|-------------|
| name | string | Record name |
| filePath | string | Path to file containing the record |
| startLine | number | Start line of record definition |
| endLine | number | End line of record definition |
| language | string | Programming language |
| isExported | boolean | Whether the record is exported |
| visibility | string | Visibility modifier |
| annotations | string[] | List of annotations |

### Delegate

Represents a delegate type (C#, Swift, etc.).

| Property | Type | Description |
|----------|------|-------------|
| name | string | Delegate name |
| filePath | string | Path to file containing the delegate |
| startLine | number | Start line of delegate |
| endLine | number | End line of delegate |
| language | string | Programming language |
| isExported | boolean | Whether the delegate is exported |
| visibility | string | Visibility modifier |
| returnType | string | Return type |
| parameterCount | number | Number of parameters |

### Annotation

Represents an annotation type (Java annotation).

| Property | Type | Description |
|----------|------|-------------|
| name | string | Annotation name |
| filePath | string | Path to file containing the annotation |
| startLine | number | Start line of annotation |
| endLine | number | End line of annotation |
| language | string | Programming language |
| isExported | boolean | Whether the annotation is exported |
| visibility | string | Visibility modifier |

### Constructor

Represents a constructor.

| Property | Type | Description |
|----------|------|-------------|
| name | string | Constructor name (usually same as class) |
| filePath | string | Path to file containing the constructor |
| startLine | number | Start line of constructor |
| endLine | number | End line of constructor |
| language | string | Programming language |
| visibility | string | Visibility modifier |
| parameterCount | number | Number of parameters |
| annotations | string[] | List of annotations |

### Template

Represents a template or generic definition.

| Property | Type | Description |
|----------|------|-------------|
| name | string | Template name |
| filePath | string | Path to file containing the template |
| startLine | number | Start line of template |
| endLine | number | End line of template |
| language | string | Programming language |
| isExported | boolean | Whether the template is exported |
| parameterCount | number | Number of type parameters |

### Section

Represents a section within a file (markdown section, config section, etc.).

| Property | Type | Description |
|----------|------|-------------|
| name | string | Section name (heading) |
| filePath | string | Path to file containing the section |
| startLine | number | Start line of section |
| endLine | number | End line of section |
| language | string | Programming language (for code sections) |
| level | number | Section nesting level |

### Route

Represents an API route or endpoint.

| Property | Type | Description |
|----------|------|-------------|
| name | string | Route path/pattern |
| filePath | string | Path to file containing the route |
| startLine | number | Start line of route definition |
| endLine | number | End line of route definition |
| language | string | Programming language |
| responseKeys | string[] | Response keys/fields |
| errorKeys | string[] | Error keys/fields |
| middleware | string[] | Middleware chain |
| annotations | string[] | List of decorators/attributes |

### Tool

Represents a tool or command that can be invoked.

| Property | Type | Description |
|----------|------|-------------|
| name | string | Tool name |
| filePath | string | Path to file containing the tool definition |
| startLine | number | Start line of tool definition |
| endLine | number | End line of tool definition |
| language | string | Programming language |
| description | string | Tool description |
| annotations | string[] | List of annotations |

## Relationship Types (RelationshipType)

### CONTAINS

Indicates that a node contains another node (e.g., File contains Class).

| Property | Type | Description |
|----------|------|-------------|
| confidence | number | Confidence score (0-1) |
| reason | string | Explanation for the relationship |
| step | number | Optional step number in a process |

### CALLS

Indicates a function/method call relationship.

| Property | Type | Description |
|----------|------|-------------|
| confidence | number | Confidence score (0-1) |
| reason | string | Explanation for the relationship (e.g., "direct-call", "import-resolved") |
| step | number | Optional step number in a process |

### INHERITS

Indicates class inheritance (parent to child).

| Property | Type | Description |
|----------|------|-------------|
| confidence | number | Confidence score (0-1) |
| reason | string | Explanation for the relationship |
| step | number | Optional step number in a process |

### METHOD_OVERRIDES

Indicates that a method overrides a parent method.

| Property | Type | Description |
|----------|------|-------------|
| confidence | number | Confidence score (0-1) |
| reason | string | Explanation for the relationship |
| step | number | Optional step number in a process |

### METHOD_IMPLEMENTS

Indicates that a method implements an interface method.

| Property | Type | Description |
|----------|------|-------------|
| confidence | number | Confidence score (0-1) |
| reason | string | Explanation for the relationship |
| step | number | Optional step number in a process |

### IMPORTS

Indicates a file-level import statement.

| Property | Type | Description |
|----------|------|-------------|
| confidence | number | Confidence score (0-1) |
| reason | string | Explanation for the relationship |
| step | number | Optional step number in a process |

### USES

Indicates usage of a dependency or utility.

| Property | Type | Description |
|----------|------|-------------|
| confidence | number | Confidence score (0-1) |
| reason | string | Explanation for the relationship |
| step | number | Optional step number in a process |

### DEFINES

Indicates that a node defines a symbol.

| Property | Type | Description |
|----------|------|-------------|
| confidence | number | Confidence score (0-1) |
| reason | string | Explanation for the relationship |
| step | number | Optional step number in a process |

### DECORATES

Indicates that a decorator applies to a node.

| Property | Type | Description |
|----------|------|-------------|
| confidence | number | Confidence score (0-1) |
| reason | string | Explanation for the relationship |
| step | number | Optional step number in a process |

### IMPLEMENTS

Indicates that a class implements an interface.

| Property | Type | Description |
|----------|------|-------------|
| confidence | number | Confidence score (0-1) |
| reason | string | Explanation for the relationship |
| step | number | Optional step number in a process |

### EXTENDS

Indicates extension of a parent type.

| Property | Type | Description |
|----------|------|-------------|
| confidence | number | Confidence score (0-1) |
| reason | string | Explanation for the relationship |
| step | number | Optional step number in a process |

### HAS_METHOD

Indicates that a class/interface has a method.

| Property | Type | Description |
|----------|------|-------------|
| confidence | number | Confidence score (0-1) |
| reason | string | Explanation for the relationship |
| step | number | Optional step number in a process |

### HAS_PROPERTY

Indicates that a class/interface has a property.

| Property | Type | Description |
|----------|------|-------------|
| confidence | number | Confidence score (0-1) |
| reason | string | Explanation for the relationship |
| step | number | Optional step number in a process |

### ACCESSES

Indicates read/write access to a variable or data area.

| Property | Type | Description |
|----------|------|-------------|
| confidence | number | Confidence score (0-1) |
| reason | string | Explanation for the relationship |
| step | number | Optional step number in a process |

### MEMBER_OF

Indicates membership in a container (e.g., method is member of class).

| Property | Type | Description |
|----------|------|-------------|
| confidence | number | Confidence score (0-1) |
| reason | string | Explanation for the relationship |
| step | number | Optional step number in a process |

### STEP_IN_PROCESS

Indicates a step in an execution process.

| Property | Type | Description |
|----------|------|-------------|
| confidence | number | Confidence score (0-1) |
| reason | string | Explanation for the relationship |
| step | number | Step number in the process |

### HANDLES_ROUTE

Indicates that a handler handles a route.

| Property | Type | Description |
|----------|------|-------------|
| confidence | number | Confidence score (0-1) |
| reason | string | Explanation for the relationship |
| step | number | Optional step number in a process |

### FETCHES

Indicates that code fetches data from a route or endpoint.

| Property | Type | Description |
|----------|------|-------------|
| confidence | number | Confidence score (0-1) |
| reason | string | Explanation for the relationship |
| step | number | Optional step number in a process |

### HANDLES_TOOL

Indicates that code handles or invokes a tool.

| Property | Type | Description |
|----------|------|-------------|
| confidence | number | Confidence score (0-1) |
| reason | string | Explanation for the relationship |
| step | number | Optional step number in a process |

### ENTRY_POINT_OF

Indicates that a node is an entry point of a process.

| Property | Type | Description |
|----------|------|-------------|
| confidence | number | Confidence score (0-1) |
| reason | string | Explanation for the relationship |
| step | number | Optional step number in a process |

### WRAPS

Indicates wrapping behavior (e.g., wrapper function).

| Property | Type | Description |
|----------|------|-------------|
| confidence | number | Confidence score (0-1) |
| reason | string | Explanation for the relationship |
| step | number | Optional step number in a process |

### QUERIES

Indicates a query or database access.

| Property | Type | Description |
|----------|------|-------------|
| confidence | number | Confidence score (0-1) |
| reason | string | Explanation for the relationship |
| step | number | Optional step number in a process |

## Graph Implementation

### KnowledgeGraph Interface

The `KnowledgeGraph` interface provides the following methods:

| Method | Description |
|--------|-------------|
| nodes | Get all nodes as array |
| relationships | Get all relationships as array |
| iterNodes() | Iterate over nodes |
| iterRelationships() | Iterate over relationships |
| iterRelationshipsByType(type) | Iterate relationships of specific type |
| forEachNode(fn) | Execute function for each node |
| forEachRelationship(fn) | Execute function for each relationship |
| getNode(id) | Get node by ID |
| nodeCount | Number of nodes |
| relationshipCount | Number of relationships |
| addNode(node) | Add a node |
| addRelationship(relationship) | Add a relationship |
| removeNode(nodeId) | Remove a node |
| removeNodesByFile(filePath) | Remove all nodes for a file |
| removeRelationship(relationshipId) | Remove a relationship |

### Indexing Structure

The graph implementation uses several indexes for efficient operations:

1. **nodeMap**: Map<string, GraphNode> - O(1) node lookup
2. **relationshipMap**: Map<string, GraphRelationship> - O(1) relationship lookup
3. **relationshipsByType**: Map<RelationshipType, Map<string, GraphRelationship>> - Fast type-based iteration
4. **edgeIdsByNode**: Map<string, Set<string>> - Reverse adjacency index for efficient node deletion
5. **nodeIdsByFile**: Map<string, Set<string>> - File-based index for efficient file removal

### Evidence Tracking

Relationships may include an `evidence` array for tracking the provenance of edges:

```typescript
evidence?: readonly {
  readonly kind: string;      // Type of evidence
  readonly weight: number;    // Weight of this evidence
  readonly note?: string;    // Optional note
}[]
```

This is particularly useful for edges emitted by the scope-based resolution pipeline (RFC #909 Ring 2 PKG #925), allowing downstream query and audit tools to understand why a given edge was emitted with its confidence value.

## Common Node Combinations

### Class Hierarchy
```
File → CONTAINS → Class
Class → INHERITS → Class (parent)
Class → IMPLEMENTS → Interface
Class → HAS_METHOD → Method
Class → HAS_PROPERTY → Property
Method → MEMBER_OF → Class
```

### Function Call Flow
```
File → IMPORTS → File (imported)
Function → CALLS → Function (called)
Function → ACCESSES → Variable (read/write)
```

### Process Detection
```
Process → STEP_IN_PROCESS → Function (step 1)
Process → STEP_IN_PROCESS → Function (step 2)
Process → ENTRY_POINT_OF → Function
```

### Community Structure
```
Community → CONTAINS → Class
Community → CONTAINS → Function
Community → CONTAINS → Interface
```

## Usage Examples

### Querying Class Methods
```cypher
MATCH (c:Class {name: "MyClass"})-[:HAS_METHOD]->(m:Method)
RETURN m.name, m.visibility, m.isStatic
```

### Finding Import Dependencies
```cypher
MATCH (f:File)-[:IMPORTS]->(g:File)
WHERE f.name = "main.ts"
RETURN g.name, g.filePath
```

### Analyzing Call Flow
```cypher
MATCH (caller:Function)-[:CALLS]->(callee:Function)
WHERE caller.name = "processData"
RETURN callee.name, callee.filePath
```

### Community Analysis
```cypher
MATCH (community:Community)
RETURN community.name, community.cohesion, community.symbolCount
ORDER BY community.cohesion DESC
```

## AST Framework Multiplier

Nodes may include AST framework enrichment information:

| Property | Type | Description |
|----------|------|-------------|
| astFrameworkMultiplier | number | Confidence multiplier from AST framework detection |
| astFrameworkReason | string | Reason for the multiplier |

This is used when framework-specific patterns are detected in the code, allowing the graph to weight relationships more heavily when framework conventions are followed.
