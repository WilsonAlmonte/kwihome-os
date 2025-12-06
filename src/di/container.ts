import GetDashboardDataUseCase from "@repo/features/dashboard/get-dashboard-data.use-case";
import { HomeAreasRepository } from "@repo/features/home-areas/home-areas.port";
import { InventoryRepository } from "@repo/features/inventory/inventory.port";
import {
  ToggleInventoryStatusUseCase,
  MarkAsNotNeededUseCase,
} from "@repo/features/inventory/inventory.use-cases";
import { NotesRepository } from "@repo/features/notes/notes.port";
import { ShoppingListsRepository } from "@repo/features/shopping-lists/shopping-lists.port";
import {
  GetOrCreateDraftUseCase,
  AddItemToShoppingListUseCase,
  RemoveItemFromShoppingListUseCase,
  ToggleItemCheckedUseCase,
  StartShoppingTripUseCase,
  CompleteShoppingTripUseCase,
  AbandonDraftUseCase,
  GetShoppingHistoryUseCase,
  CancelShoppingTripUseCase,
} from "@repo/features/shopping-lists/shopping-list.use-cases";
import {
  MarkTaskCompleteUseCase,
  MarkTaskPendingUseCase,
} from "@repo/features/tasks/task.use-cases";
import { TasksRepository } from "@repo/features/tasks/tasks.port";
import { prismaHomeAreasRepository } from "@repo/infrastructure/prisma/home-areas.repository.prisma";
import { prismaInventoryRepository } from "@repo/infrastructure/prisma/inventory.repository.prisma";
import { prismaNotesRepository } from "@repo/infrastructure/prisma/notes.repository.prisma";
import { prismaShoppingListsRepository } from "@repo/infrastructure/prisma/shopping-lists.repository.prisma";
import { prismaTasksRepository } from "@repo/infrastructure/prisma/tasks.repository.prisma";
import { mockHomeAreasRepository } from "@repo/test/mocks/home-areas.repository.mock";
import { mockInventoryRepository } from "@repo/test/mocks/inventory.repository.mock";
import { mockNotesRepository } from "@repo/test/mocks/notes.repository.mock";
import { mockShoppingListsRepository } from "@repo/test/mocks/shopping-lists.repository.mock";
import { mockTasksRepository } from "@repo/test/mocks/tasks.repository.mock";

// ============================================
// REPOSITORY MOCK CONFIGURATION
// Toggle: true = mock, false = real (Prisma)
// ============================================
const USE_MOCK: Record<keyof typeof repoRegistry, boolean> = {
  homeAreas: false,
  tasks: false,
  notes: false,
  inventory: false,
  shoppingLists: true,
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
  inventory: {
    mock: mockInventoryRepository,
    real: prismaInventoryRepository,
  } satisfies RepoEntry<InventoryRepository>,
  shoppingLists: {
    mock: mockShoppingListsRepository,
    real: prismaShoppingListsRepository,
  } satisfies RepoEntry<ShoppingListsRepository>,
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
  inventory: InventoryRepository;
  shoppingLists: ShoppingListsRepository;
}

export interface UseCases {
  getDashboardData: GetDashboardDataUseCase;
  markTaskComplete: MarkTaskCompleteUseCase;
  markTaskPending: MarkTaskPendingUseCase;
  toggleInventoryStatus: ToggleInventoryStatusUseCase;
  markAsNotNeeded: MarkAsNotNeededUseCase;
  // Shopping list use cases
  getOrCreateDraft: GetOrCreateDraftUseCase;
  addItemToShoppingList: AddItemToShoppingListUseCase;
  removeItemFromShoppingList: RemoveItemFromShoppingListUseCase;
  toggleItemChecked: ToggleItemCheckedUseCase;
  startShoppingTrip: StartShoppingTripUseCase;
  completeShoppingTrip: CompleteShoppingTripUseCase;
  abandonDraft: AbandonDraftUseCase;
  getShoppingHistory: GetShoppingHistoryUseCase;
  cancelShoppingTrip: CancelShoppingTripUseCase;
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
    inventory: resolve("inventory"),
    shoppingLists: resolve("shoppingLists"),
  };

  const useCases: UseCases = {
    getDashboardData: new GetDashboardDataUseCase(repos),
    markTaskComplete: new MarkTaskCompleteUseCase(repos.tasks),
    markTaskPending: new MarkTaskPendingUseCase(repos.tasks),
    toggleInventoryStatus: new ToggleInventoryStatusUseCase(
      repos.inventory,
      repos.shoppingLists
    ),
    markAsNotNeeded: new MarkAsNotNeededUseCase(repos.inventory),
    // Shopping list use cases
    getOrCreateDraft: new GetOrCreateDraftUseCase(repos.shoppingLists),
    addItemToShoppingList: new AddItemToShoppingListUseCase(
      repos.shoppingLists,
      repos.inventory
    ),
    removeItemFromShoppingList: new RemoveItemFromShoppingListUseCase(
      repos.shoppingLists
    ),
    toggleItemChecked: new ToggleItemCheckedUseCase(repos.shoppingLists),
    startShoppingTrip: new StartShoppingTripUseCase(repos.shoppingLists),
    completeShoppingTrip: new CompleteShoppingTripUseCase(
      repos.shoppingLists,
      repos.inventory
    ),
    abandonDraft: new AbandonDraftUseCase(repos.shoppingLists),
    getShoppingHistory: new GetShoppingHistoryUseCase(repos.shoppingLists),
    cancelShoppingTrip: new CancelShoppingTripUseCase(repos.shoppingLists),
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
