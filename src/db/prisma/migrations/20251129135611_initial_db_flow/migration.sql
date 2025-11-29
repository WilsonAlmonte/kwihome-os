-- CreateEnum
CREATE TYPE "inventory_status" AS ENUM ('IN_STOCK', 'OUT_OF_STOCK', 'NOT_NEEDED');

-- CreateEnum
CREATE TYPE "shopping_list_status" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED');

-- CreateTable
CREATE TABLE "home_area" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "home_area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "inventory_status" NOT NULL DEFAULT 'OUT_OF_STOCK',
    "areaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "inventory_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shopping_list" (
    "id" TEXT NOT NULL,
    "status" "shopping_list_status" NOT NULL DEFAULT 'DRAFT',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "shopping_list_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shopping_list_item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "shoppingListId" TEXT NOT NULL,
    "inventoryItemId" TEXT,
    "areaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "shopping_list_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "areaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "note" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "areaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "note_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inventory_item_areaId_idx" ON "inventory_item"("areaId");

-- CreateIndex
CREATE INDEX "shopping_list_item_shoppingListId_idx" ON "shopping_list_item"("shoppingListId");

-- CreateIndex
CREATE INDEX "shopping_list_item_inventoryItemId_idx" ON "shopping_list_item"("inventoryItemId");

-- CreateIndex
CREATE INDEX "shopping_list_item_areaId_idx" ON "shopping_list_item"("areaId");

-- CreateIndex
CREATE INDEX "task_areaId_idx" ON "task"("areaId");

-- CreateIndex
CREATE INDEX "note_areaId_idx" ON "note"("areaId");

-- AddForeignKey
ALTER TABLE "inventory_item" ADD CONSTRAINT "inventory_item_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "home_area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_list_item" ADD CONSTRAINT "shopping_list_item_shoppingListId_fkey" FOREIGN KEY ("shoppingListId") REFERENCES "shopping_list"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_list_item" ADD CONSTRAINT "shopping_list_item_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "inventory_item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_list_item" ADD CONSTRAINT "shopping_list_item_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "home_area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "home_area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note" ADD CONSTRAINT "note_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "home_area"("id") ON DELETE SET NULL ON UPDATE CASCADE;
