import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Plus,
  Circle,
  CheckCircle2,
  Trash2,
  MapPin,
  Edit,
  XCircle,
} from "lucide-react";
import { Card, CardContent } from "@app/components/ui/card";
import { Button } from "@app/components/ui/button";
import { ResponsiveDialog } from "@app/components/ui/responsive-dialog";
import { ConfirmationDialog } from "@app/components/ui/confirmation-dialog";
import { Swipeable } from "@app/components/ui/swipeable";
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
import { useMediaQuery } from "../hooks/use-media-query";
import { useDialogState } from "../hooks/use-dialog-state";
import {
  InventoryItem,
  InventoryStatus,
} from "@repo/features/inventory/inventory-item.entity";
import {
  InventoryForm,
  InventoryFormData,
} from "../components/forms/inventory-form";

export const Route = createFileRoute("/inventory")({
  component: InventoryPage,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(inventoryQueryOptions());
    await context.queryClient.ensureQueryData(homeAreasQueryOptions());
  },
});

function InventoryPage() {
  const { data: items } = useSuspenseQuery(inventoryQueryOptions());
  const { data: homeAreas } = useSuspenseQuery(homeAreasQueryOptions());
  const isMobile = useMediaQuery("(max-width: 1023px)");

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

  const getStatusBadge = (status: InventoryStatus) => {
    switch (status) {
      case InventoryStatus.IN_STOCK:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success dark:bg-success/50 dark:text-green-400">
            <CheckCircle2 className="h-3 w-3" />
            In Stock
          </span>
        );
      case InventoryStatus.OUT_OF_STOCK:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-destructive/10 text-red-800 dark:bg-destructive/50 dark:text-red-400">
            <XCircle className="h-3 w-3" />
            Out of Stock
          </span>
        );
      case InventoryStatus.NOT_NEEDED:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
            <Circle className="h-3 w-3" />
            Not Needed
          </span>
        );
    }
  };

  const renderItem = (item: InventoryItem) => {
    const cardContent = (
      <Card
        className="transition-all hover:shadow-sm hover:border-primary/50 cursor-pointer"
        onClick={() => addDialog.open(item)}
      >
        <CardContent className="flex items-start gap-2 p-3 md:gap-3 md:p-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (item.status !== InventoryStatus.NOT_NEEDED) {
                handleToggleStatus(item);
              }
            }}
            className={`shrink-0 text-muted-foreground hover:text-primary transition-colors p-0.5 -m-0.5 hover:bg-accent rounded-md md:p-1 md:-m-1 ${
              item.status === InventoryStatus.NOT_NEEDED
                ? "cursor-default opacity-50"
                : "cursor-pointer"
            }`}
            disabled={item.status === InventoryStatus.NOT_NEEDED}
          >
            {item.status === InventoryStatus.IN_STOCK ? (
              <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-success" />
            ) : item.status === InventoryStatus.OUT_OF_STOCK ? (
              <XCircle className="h-5 w-5 md:h-6 md:w-6 text-destructive" />
            ) : (
              <Circle className="h-5 w-5 md:h-6 md:w-6" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium wrap-break-word text-sm md:text-base">
                {item.name}
              </h3>
              {getStatusBadge(item.status)}
            </div>
            {item.homeArea && (
              <div className="flex items-center gap-1 mt-1.5 md:mt-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{item.homeArea.name}</span>
              </div>
            )}
          </div>

          {!isMobile && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  addDialog.open(item);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteDialog.open(item);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );

    return isMobile ? (
      <Swipeable
        key={item.id}
        onSwipeLeft={() => deleteDialog.open(item)}
        leftAction={
          <div className="w-full h-full bg-destructive flex items-center justify-center rounded-xl">
            <Trash2 className="h-5 w-5 text-destructive-foreground" />
          </div>
        }
      >
        {cardContent}
      </Swipeable>
    ) : (
      <div key={item.id}>{cardContent}</div>
    );
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
            <div className="space-y-2">{filteredItems.map(renderItem)}</div>
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
