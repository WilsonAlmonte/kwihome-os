# Kwihome OS - Architecture & Design Patterns

**Last Updated:** December 5, 2025  
**Project:** Kwihome OS - Home Management Application  
**Author:** Wilson Almonte

---

## Table of Contents

1. [Overview](#overview)
2. [Architectural Patterns](#architectural-patterns)
3. [Core Design Patterns](#core-design-patterns)
4. [Project Structure](#project-structure)
5. [Technology Stack](#technology-stack)
6. [Data Flow](#data-flow)
7. [Key Conventions](#key-conventions)

---

## Overview

Kwihome OS is a full-stack home management application built with a **Clean Architecture** approach, implementing modern design patterns for maintainability, testability, and scalability. The application uses a monolithic structure with clear separation of concerns between presentation, business logic, and data access layers.

### Core Principles

- **Separation of Concerns**: Clear boundaries between UI, business logic, and data access
- **Dependency Inversion**: High-level modules don't depend on low-level modules
- **Testability**: Mock implementations for isolated testing
- **Type Safety**: Full TypeScript implementation with Zod validation
- **Developer Experience**: Modern tooling with hot-reload and type-safe routing

---

## Architectural Patterns

### 1. Clean Architecture (Hexagonal Architecture)

The project follows Clean Architecture principles with distinct layers:

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│              (React Components, Routes)                  │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                      │
│        (Services, Hooks, Query Management)               │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                     Domain Layer                         │
│         (Entities, Use Cases, Ports)                     │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                    │
│        (Repositories, Database Adapters)                 │
└─────────────────────────────────────────────────────────┘
```

#### Layer Breakdown

**Domain Layer** (`src/features/`)

- **Entities**: Core business objects with validation schemas
- **Ports**: Interfaces defining contracts for repositories
- **Use Cases**: Business logic operations

**Infrastructure Layer** (`src/infrastructure/`)

- **Adapters**: Concrete implementations of ports
- **Repositories**: Database access implementations (Prisma)

**Application Layer** (`src/app/features/`)

- **Services**: Server functions bridging UI and domain
- **Hooks**: React hooks for mutations and state management
- **Queries**: TanStack Query configurations

**Presentation Layer** (`src/app/`)

- **Components**: React UI components
- **Routes**: File-based routing with TanStack Router
- **Layout**: Application shell and navigation

---

### 2. Repository Pattern

Repositories abstract data access logic, providing a consistent interface for data operations.

#### Structure

```typescript
// Port (Interface) - Domain Layer
export interface TasksRepository {
  findAll(): Promise<Task[]>;
  create(
    title: string,
    description?: string,
    homeArea?: HomeArea
  ): Promise<Task>;
  delete(id: string): Promise<void>;
  update(id: string, updates: Partial<Task>): Promise<Task>;
  countUncompleted(): Promise<number>;
}

// Adapter (Implementation) - Infrastructure Layer
export const prismaTasksRepository: TasksRepository = {
  findAll: async function () {
    const result = await prisma.task.findMany({
      orderBy: { createdAt: "asc" },
      include: { area: true },
    });
    return result.map(/* mapping logic */);
  },
  // ... other implementations
};
```

#### Benefits

- **Testability**: Easy to swap with mock implementations
- **Flexibility**: Can change data sources without affecting business logic
- **Consistency**: Uniform interface across all data operations

---

### 3. Dependency Injection Container

A lightweight DI container manages dependencies and enables configuration-based switching between mock and real implementations.

#### Container Structure

```typescript
// src/di/container.ts
const USE_MOCK: Record<keyof typeof repoRegistry, boolean> = {
  homeAreas: false,
  tasks: false,
};

const repoRegistry = {
  homeAreas: {
    mock: mockHomeAreasRepository,
    real: prismaHomeAreasRepository,
  },
  tasks: {
    mock: mockTasksRepository,
    real: prismaTasksRepository,
  },
};

export function getContainer(): AppContainer {
  if (!cachedContainer) {
    cachedContainer = createContainer();
  }
  return cachedContainer;
}
```

#### Features

- **Strategy Pattern**: Switchable implementations via configuration
- **Singleton Pattern**: Single container instance cached
- **Factory Pattern**: Container creation encapsulated
- **Type Safety**: Full TypeScript support with typed registry

---

### 4. Use Case Pattern

Use cases encapsulate specific business operations, implementing single responsibility principle.

```typescript
export class MarkTaskCompleteUseCase {
  constructor(private _taskRepository: TasksRepository) {}

  async execute(taskId: string) {
    const updatedTask = await this._taskRepository.update(taskId, {
      completed: true,
      completedAt: new Date(),
    });
    return updatedTask;
  }
}
```

#### Characteristics

- **Single Responsibility**: Each use case handles one operation
- **Dependency Injection**: Dependencies passed via constructor
- **Testability**: Easy to unit test in isolation
- **Reusability**: Can be composed in different contexts

---

## Core Design Patterns

### 1. Server Functions Pattern (TanStack Start)

Server functions provide type-safe client-server communication with automatic serialization.

```typescript
export const getAllTasks = createServerFn({ method: "GET" }).handler(
  async () => {
    const { repos } = getContainer();
    const tasks = await repos.tasks.findAll();
    return tasks;
  }
);

export const markTaskComplete = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { useCases } = getContainer();
    const updatedTask = await useCases.markTaskComplete.execute(data.id);
    return updatedTask;
  });
```

#### Benefits

- **Type Safety**: End-to-end type inference
- **Validation**: Built-in input validation
- **Automatic Serialization**: Handles data transfer automatically
- **Progressive Enhancement**: Works with and without JavaScript

---

### 2. Query Pattern (TanStack Query)

Centralized query configuration for data fetching and caching.

```typescript
export const tasksQueryOptions = () =>
  queryOptions({
    queryKey: [TASKS_QUERY_KEY],
    queryFn: () => getAllTasks(),
  });
```

#### Usage in Components

```typescript
const { data: tasks } = useSuspenseQuery(tasksQueryOptions());
```

#### Features

- **Automatic Caching**: Reduces unnecessary network requests
- **Background Refetching**: Keeps data fresh
- **Optimistic Updates**: Immediate UI feedback
- **Error Handling**: Built-in retry and error states

---

### 3. Custom Hooks Pattern

Encapsulates mutation logic with side effects and cache invalidation.

```typescript
export const useMarkTaskComplete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => services.markTaskComplete({ data: { id } }),
    onMutate: async (id) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: [TASKS_QUERY_KEY] });
      const previousTasks = queryClient.getQueryData<Task[]>([TASKS_QUERY_KEY]);

      queryClient.setQueryData<Task[]>([TASKS_QUERY_KEY], (old) =>
        old?.map((task) =>
          task.id === id
            ? { ...task, completed: true, completedAt: new Date() }
            : task
        )
      );

      return { previousTasks };
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData([TASKS_QUERY_KEY], context.previousTasks);
      }
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [DASHBOARD_DATA] });
    },
  });
};
```

#### Benefits

- **Optimistic Updates**: Instant UI feedback
- **Error Recovery**: Automatic rollback on failure
- **Cache Coordination**: Manages related query invalidation
- **Reusability**: Shared mutation logic across components

---

### 4. Entity Pattern

Entities combine data types with validation schemas using Zod.

```typescript
export type Task = {
  id: string;
  completed: boolean;
  completedAt?: Date;
  homeArea?: HomeArea;
} & Omit<z.infer<typeof taskSchema>, "homeAreaId">;

export const taskSchema = z.object({
  title: z
    .string()
    .min(1, "Task title is required")
    .max(100, "Task title must be 100 characters or less")
    .trim(),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .optional(),
  homeAreaId: z.string().optional(),
});
```

#### Features

- **Runtime Validation**: Type-safe data validation
- **Type Inference**: TypeScript types derived from schemas
- **Single Source of Truth**: Schema defines both type and validation
- **Error Messages**: User-friendly validation messages

---

### 5. Responsive Design Pattern

Components adapt to different screen sizes using a unified responsive dialog pattern.

```typescript
export function ResponsiveDialog({
  children,
  isOpen,
  setIsOpen,
  title,
}: ResponsiveDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return <Dialog>{/* Desktop modal */}</Dialog>;
  }

  return <Drawer>{/* Mobile drawer */}</Drawer>;
}
```

#### Patterns

- **Mobile-First**: Bottom navigation and drawers on mobile
- **Desktop-Enhanced**: Sidebar and dialogs on desktop
- **Breakpoint**: 768px (lg) for layout switching
- **Progressive Enhancement**: Works across device sizes

---

### 6. File-Based Routing Pattern

TanStack Router provides type-safe, file-based routing with automatic code splitting.

```typescript
export const Route = createFileRoute("/tasks")({
  component: TasksPage,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(tasksQueryOptions());
    await context.queryClient.ensureQueryData(homeAreasQueryOptions());
  },
});
```

#### Features

- **Type-Safe Navigation**: Compile-time route validation
- **Data Preloading**: Loader function fetches data before render
- **Code Splitting**: Automatic bundle splitting per route
- **Suspense Support**: Built-in loading states

---

## Project Structure

### Directory Organization

```
src/
├── app/                    # Presentation Layer
│   ├── components/         # Reusable UI components
│   │   ├── forms/          # Form components
│   │   ├── layout/         # Layout components (sidebar, nav)
│   │   └── ui/             # Shadcn UI components
│   ├── features/           # Application Layer
│   │   ├── tasks/          # Task feature (services, hooks, queries)
│   │   ├── home-areas/     # Home areas feature
│   │   └── dashboard/      # Dashboard feature
│   ├── hooks/              # Shared React hooks
│   ├── lib/                # Utilities and helpers
│   ├── routes/             # File-based routing
│   └── styles.css          # Global styles
│
├── features/               # Domain Layer
│   ├── tasks/              # Task domain
│   │   ├── task.entity.ts        # Entity with validation
│   │   ├── tasks.port.ts         # Repository interface
│   │   └── task.use-cases.ts     # Business logic
│   ├── home-areas/         # Home areas domain
│   └── dashboard/          # Dashboard domain
│
├── infrastructure/         # Infrastructure Layer
│   └── prisma/             # Database adapters
│       ├── tasks.repository.prisma.ts
│       └── home-areas.repository.prisma.ts
│
├── db/                     # Database Configuration
│   ├── client.ts           # Prisma client setup
│   └── prisma/
│       ├── schema.prisma   # Database schema
│       └── migrations/     # Database migrations
│
├── di/                     # Dependency Injection
│   └── container.ts        # DI container
│
└── test/                   # Testing
    └── mocks/              # Mock implementations
```

### Path Aliases

TypeScript path aliases for cleaner imports:

```typescript
{
  "@repo/*": ["./src/*"],      // Domain & Infrastructure
  "@app/*": ["./src/app/*"]    // Application & Presentation
}
```

---

## Technology Stack

### Core Framework

- **TanStack Start**: Full-stack React framework with SSR
- **TanStack Router**: Type-safe file-based routing
- **TanStack Query**: Server state management
- **TanStack Form**: Type-safe form handling

### UI & Styling

- **React 19**: Latest React with RSC support
- **Tailwind CSS v4**: Utility-first styling
- **Shadcn UI**: Accessible component library
- **Radix UI**: Unstyled accessible components
- **Lucide Icons**: Icon library

### Backend & Database

- **Prisma ORM**: Type-safe database client
- **PostgreSQL**: Primary database
- **Better Auth**: Authentication library
- **Nitro**: Server engine

### Development Tools

- **Vite**: Build tool and dev server
- **TypeScript**: Type safety
- **Vitest**: Unit testing
- **Zod**: Runtime validation

---

## Data Flow

### Complete Request Flow

```
┌──────────────┐
│ User Action  │
└──────┬───────┘
       ↓
┌──────────────────────┐
│  Custom Hook         │  (useMarkTaskComplete)
│  - Optimistic Update │
│  - Error Handling    │
└──────┬───────────────┘
       ↓
┌──────────────────────┐
│  Service Function    │  (markTaskComplete)
│  - Input Validation  │
└──────┬───────────────┘
       ↓
┌──────────────────────┐
│  DI Container        │  (getContainer)
│  - Resolve UseCase   │
└──────┬───────────────┘
       ↓
┌──────────────────────┐
│  Use Case            │  (MarkTaskCompleteUseCase)
│  - Business Logic    │
└──────┬───────────────┘
       ↓
┌──────────────────────┐
│  Repository          │  (TasksRepository)
│  - Data Access       │
└──────┬───────────────┘
       ↓
┌──────────────────────┐
│  Prisma Client       │
│  - Database Query    │
└──────┬───────────────┘
       ↓
┌──────────────────────┐
│  PostgreSQL          │
└──────────────────────┘
```

### Query Invalidation Flow

```
Mutation Success
    ↓
Invalidate Queries
    ↓
TanStack Query Refetch
    ↓
Server Function Call
    ↓
Fresh Data
    ↓
UI Update
```

---

## Key Conventions

### 1. Naming Conventions

**Files:**

- Entities: `*.entity.ts`
- Ports/Interfaces: `*.port.ts`
- Use Cases: `*.use-cases.ts`
- Repositories: `*.repository.{adapter}.ts`
- Services: `*.services.ts`
- Hooks: `*.hooks.ts`
- Queries: `*.query.ts`

**Components:**

- PascalCase for component files
- kebab-case for UI components

**Functions:**

- `use*` prefix for hooks
- `*UseCase` suffix for use case classes
- `*Repository` suffix for repository interfaces

### 2. Import Patterns

```typescript
// Domain layer imports
import { Task } from "@repo/features/tasks/task.entity";
import { TasksRepository } from "@repo/features/tasks/tasks.port";

// Application layer imports
import { Button } from "@app/components/ui/button";
import { useTaskCreation } from "@app/features/tasks/tasks.hooks";
```

### 3. Data Transformation

Always transform database models to domain entities in repositories:

```typescript
return result.map((task) => ({
  ...task,
  description: task.description ?? undefined,
  homeArea: task.area ?? undefined,
  completedAt: task.completedAt ?? undefined,
}));
```

### 4. Error Handling

- Use Zod for validation errors
- TanStack Query handles network errors
- Toast notifications for user feedback
- Optimistic updates with rollback on error

### 5. Testing Strategy

- **Unit Tests**: Use case and repository tests with mocks
- **Integration Tests**: Service and hook tests
- **E2E Tests**: Full user flows (planned)

---

## Summary

Kwihome OS implements a **modern, maintainable architecture** that emphasizes:

1. **Clean Architecture** with clear layer separation
2. **Repository Pattern** for data access abstraction
3. **Dependency Injection** for flexibility and testability
4. **Type Safety** throughout the entire stack
5. **Optimistic Updates** for responsive UX
6. **Server Functions** for type-safe client-server communication

The architecture supports easy testing, feature additions, and technology migrations while maintaining code quality and developer experience.
