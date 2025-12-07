import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@app/components/ui/button";
import { ResponsiveDialog } from "@app/components/ui/responsive-dialog";
import { ConfirmationDialog } from "@app/components/ui/confirmation-dialog";
import { toast } from "sonner";
import { inventoryQueryOptions } from "../features/inventory/inventory.query";
import { homeAreasQueryOptions } from "../features/home-areas/home-areas.query";
import {
  useInventoryItemCreation,
  useInventoryItemUpdate,
  useInventoryItemDeletion,
  useToggleInventoryStatus,
  useMarkAsNotNeeded,
} from "../features/inventory/inventory.hooks";
import { InventoryEmpty } from "../features/inventory/inventory-empty";
import { useDialogState } from "../hooks/use-dialog-state";
import {
  InventoryItem,
  InventoryStatus,
} from "@repo/features/inventory/inventory-item.entity";
import {
  InventoryForm,
  InventoryFormData,
} from "../components/forms/inventory-form";
import { InventoryItemCard } from "../components/cards/inventory-item-card";

export const Route = createFileRoute("/inventory")({
  component: InventoryPage,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(inventoryQueryOptions());
    context.queryClient.prefetchQuery(homeAreasQueryOptions());
  },
});

function InventoryPage() {
  const { data: items } = useSuspenseQuery(inventoryQueryOptions());
  const { data: homeAreas } = useSuspenseQuery(homeAreasQueryOptions());

  const [filterStatus, setFilterStatus] = useState<"all" | InventoryStatus>(
    "all"
  );
  const addDialog = useDialogState<InventoryItem>();
  const deleteDialog = useDialogState<InventoryItem>();

  const createItem = useInventoryItemCreation(() => {
    addDialog.close();
  });
  const updateItem = useInventoryItemUpdate();
  const deleteItem = useInventoryItemDeletion();
  const toggleStatus = useToggleInventoryStatus();
  const markAsNotNeeded = useMarkAsNotNeeded();

  const filteredItems = items.filter((item) => {
    if (filterStatus === "all") {
      return item.status !== InventoryStatus.NOT_NEEDED;
    }
    return item.status === filterStatus;
  });

  const activeItems = items.filter(
    (item) => item.status !== InventoryStatus.NOT_NEEDED
  );
  const inStockCount = items.filter(
    (item) => item.status === InventoryStatus.IN_STOCK
  ).length;
  const outOfStockCount = items.filter(
    (item) => item.status === InventoryStatus.OUT_OF_STOCK
  ).length;
  const notNeededCount = items.filter(
    (item) => item.status === InventoryStatus.NOT_NEEDED
  ).length;

  const handleItemSubmit = async (data: InventoryFormData) => {
    try {
      const homeArea = data.homeAreaId
        ? homeAreas.find((area) => area.id === data.homeAreaId)
        : undefined;

      if (addDialog.data) {
        await updateItem.mutateAsync({
          id: addDialog.data.id,
          updates: {
            name: data.name,
            status: data.status,
            homeArea,
          },
        });
        toast.success("Item updated", {
          description: `${data.name} has been updated.`,
        });
        addDialog.close();
      } else {
        await createItem.mutateAsync({
          name: data.name,
          status: data.status,
          homeArea,
        });
        toast.success("Item added", {
          description: `${data.name} has been added to your inventory.`,
        });
      }
    } catch (error) {
      toast.error("Failed to save item", {
        description:
          "Please try again or contact support if the problem persists.",
      });
    }
  };

  const handleItemDelete = async () => {
    if (!deleteDialog.data) return;

    try {
      await deleteItem.mutateAsync(deleteDialog.data.id);
      toast.success("Item deleted", {
        description: `${deleteDialog.data.name} has been removed.`,
      });
      deleteDialog.close();
    } catch (error) {
      toast.error("Failed to delete item", {
        description:
          "Please try again or contact support if the problem persists.",
      });
    }
  };

  const handleToggleStatus = async (item: InventoryItem) => {
    try {
      await toggleStatus.mutateAsync({
        id: item.id,
        currentStatus: item.status,
      });
      const newStatus =
        item.status === InventoryStatus.IN_STOCK ? "out of stock" : "in stock";
      toast.success("Status updated", {
        description: `${item.name} is now ${newStatus}.`,
      });
    } catch (error) {
      toast.error("Failed to update status", {
        description: "Please try again.",
      });
    }
  };

  const handleMarkAsNotNeeded = async (item: InventoryItem) => {
    try {
      await markAsNotNeeded.mutateAsync(item.id);
      toast.success("Marked as not needed", {
        description: `${item.name} is now marked as not needed.`,
      });
      addDialog.close();
    } catch (error) {
      toast.error("Failed to update status", {
        description: "Please try again.",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-muted-foreground mt-1">
            Track your regularly purchased household items
          </p>
        </div>
        {items.length > 0 && (
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => addDialog.open()}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Item</span>
          </Button>
        )}
      </div>

      {/* Add/Edit Item Dialog */}
      <ResponsiveDialog
        open={addDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) addDialog.close();
        }}
        title={addDialog.data ? "Edit Item" : "Add Item"}
        description="Manage items you regularly purchase for your household."
      >
        <InventoryForm
          initialData={addDialog.data}
          homeAreas={homeAreas}
          onSubmit={handleItemSubmit}
          onCancel={() => addDialog.close()}
          onMarkAsNotNeeded={
            addDialog.data
              ? () => handleMarkAsNotNeeded(addDialog.data!)
              : undefined
          }
          isSubmitting={
            createItem.isPending ||
            updateItem.isPending ||
            markAsNotNeeded.isPending
          }
        />
      </ResponsiveDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) deleteDialog.close();
        }}
        title="Delete Item"
        description={`Are you sure you want to delete "${deleteDialog.data?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleItemDelete}
        onCancel={() => deleteDialog.close()}
        isLoading={deleteItem.isPending}
      />

      {items.length > 0 ? (
        <div className="space-y-4">
          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("all")}
            >
              All ({activeItems.length})
            </Button>
            <Button
              variant={
                filterStatus === InventoryStatus.IN_STOCK
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() => setFilterStatus(InventoryStatus.IN_STOCK)}
            >
              In Stock ({inStockCount})
            </Button>
            <Button
              variant={
                filterStatus === InventoryStatus.OUT_OF_STOCK
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() => setFilterStatus(InventoryStatus.OUT_OF_STOCK)}
            >
              Out of Stock ({outOfStockCount})
            </Button>
            <Button
              variant={
                filterStatus === InventoryStatus.NOT_NEEDED
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() => setFilterStatus(InventoryStatus.NOT_NEEDED)}
            >
              Not Needed ({notNeededCount})
            </Button>
          </div>

          {/* Items List */}
          {filteredItems.length > 0 ? (
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <InventoryItemCard
                  key={item.id}
                  item={item}
                  openAddDialog={addDialog.open}
                  openDeleteDialog={deleteDialog.open}
                  handleToggleStatus={handleToggleStatus}
                />
              ))}
            </div>
          ) : (
            <InventoryEmpty
              onAddItem={() => addDialog.open()}
              isFirstItem={false}
            />
          )}
        </div>
      ) : (
        <InventoryEmpty onAddItem={() => addDialog.open()} isFirstItem={true} />
      )}
    </div>
  );
}
