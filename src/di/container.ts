import GetDashboardDataUseCase from "@repo/features/dashboard/get-dashboard-data.use-case";
import { HomeAreasRepository } from "@repo/features/home-areas/home-areas.port";
import { prismaHomeAreasRepository } from "@repo/infrastructure/prisma/home-areas.repository.prisma";
import { mockHomeAreasRepository } from "@repo/test/mocks/home-areas.repository.mock";

// ============================================
// REPOSITORY MOCK CONFIGURATION
// Toggle: true = mock, false = real (Prisma)
// ============================================
const USE_MOCK = {
  homeAreas: false,
  // inventory: true,
  // tasks: false,
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
}

export interface UseCases {
  getDashboardData: GetDashboardDataUseCase;
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
  };

  const useCases: UseCases = {
    getDashboardData: new GetDashboardDataUseCase(repos),
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
