import GetDashboardDataUseCase from "@repo/features/dashboard/get-dashboard-data.use-case";
import { HomeAreasRepository } from "@repo/features/home-areas/home-areas.port";
import { NotesRepository } from "@repo/features/notes/notes.port";
import {
  MarkTaskCompleteUseCase,
  MarkTaskPendingUseCase,
} from "@repo/features/tasks/task.use-cases";
import { TasksRepository } from "@repo/features/tasks/tasks.port";
import { prismaHomeAreasRepository } from "@repo/infrastructure/prisma/home-areas.repository.prisma";
import { prismaNotesRepository } from "@repo/infrastructure/prisma/notes.repository.prisma";
import { prismaTasksRepository } from "@repo/infrastructure/prisma/tasks.repository.prisma";
import { mockHomeAreasRepository } from "@repo/test/mocks/home-areas.repository.mock";
import { mockNotesRepository } from "@repo/test/mocks/notes.repository.mock";
import { mockTasksRepository } from "@repo/test/mocks/tasks.repository.mock";

// ============================================
// REPOSITORY MOCK CONFIGURATION
// Toggle: true = mock, false = real (Prisma)
// ============================================
const USE_MOCK: Record<keyof typeof repoRegistry, boolean> = {
  homeAreas: false,
  tasks: false,
  notes: false,
  // inventory: true,
  // shoppingList: true,
} as const;

// ============================================
// Repository Registry (Strategy Pattern)
// ============================================
type RepoEntry<T> = { mock: T; real: T };

const repoRegistry = {
  homeAreas: {
    mock: mockHomeAreasRepository,
    real: prismaHomeAreasRepository,
  } satisfies RepoEntry<HomeAreasRepository>,
  tasks: {
    mock: mockTasksRepository,
    real: prismaTasksRepository,
  } satisfies RepoEntry<TasksRepository>,
  notes: {
    mock: mockNotesRepository,
    real: prismaNotesRepository,
  } satisfies RepoEntry<NotesRepository>,
} as const;

type RepoKey = keyof typeof repoRegistry;
type RepoType<K extends RepoKey> = (typeof repoRegistry)[K]["mock"];

function resolve<K extends RepoKey>(key: K): RepoType<K> {
  return USE_MOCK[key] ? repoRegistry[key].mock : repoRegistry[key].real;
}

// ============================================
// Container Types
// ============================================
export interface Repositories {
  homeAreas: HomeAreasRepository;
  tasks: TasksRepository;
  notes: NotesRepository;
}

export interface UseCases {
  getDashboardData: GetDashboardDataUseCase;
  markTaskComplete: MarkTaskCompleteUseCase;
  markTaskPending: MarkTaskPendingUseCase;
}

export interface AppContainer {
  repos: Repositories;
  useCases: UseCases;
}

// ============================================
// Container Implementation (Singleton)
// ============================================
let cachedContainer: AppContainer | null = null;

function createContainer(): AppContainer {
  const repos: Repositories = {
    homeAreas: resolve("homeAreas"),
    tasks: resolve("tasks"),
    notes: resolve("notes"),
  };

  const useCases: UseCases = {
    getDashboardData: new GetDashboardDataUseCase(repos),
    markTaskComplete: new MarkTaskCompleteUseCase(repos.tasks),
    markTaskPending: new MarkTaskPendingUseCase(repos.tasks),
  };

  return {
    repos,
    useCases,
  };
}

export function getContainer(): AppContainer {
  if (!cachedContainer) {
    cachedContainer = createContainer();
  }
  return cachedContainer;
}

export function resetContainer(): void {
  cachedContainer = null;
}
