import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ShoppingCart,
  Plus,
  PlayCircle,
  PartyPopper,
  XCircle,
} from "lucide-react";
import { Card, CardContent } from "@app/components/ui/card";
import { Button } from "@app/components/ui/button";
import { ResponsiveDialog } from "@app/components/ui/responsive-dialog";
import { ConfirmationDialog } from "@app/components/ui/confirmation-dialog";
import { ShoppingListItemForm } from "@app/components/forms";
import { useMediaQuery } from "@app/hooks/use-media-query";
import { shoppingListQueryOptions } from "@app/features/shopping-lists/shopping-lists.query";
import { inventoryQueryOptions } from "@app/features/inventory/inventory.query";
import { homeAreasQueryOptions } from "@app/features/home-areas/home-areas.query";
import { ShoppingListEmpty } from "@app/features/shopping-lists/shopping-list-empty";
import {
  useAddShoppingListItem,
  useRemoveShoppingListItem,
  useToggleItemChecked,
  useStartShoppingTrip,
  useCompleteShoppingTrip,
  useAbandonDraft,
  useCancelShoppingTrip,
} from "@app/features/shopping-lists/shopping-lists.hooks";
import {
  ShoppingListItem,
  ShoppingListStatus,
  CreateShoppingListItemInput,
} from "@repo/features/shopping-lists/shopping-list.entity";
import {
  InventoryItem,
  InventoryStatus,
} from "@repo/features/inventory/inventory-item.entity";
import { useDialogState } from "../hooks/use-dialog-state";
import { ShoppingItemCard } from "../components/cards/shopping-item-card";

export const Route = createFileRoute("/shopping")({
  component: ShoppingPage,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(shoppingListQueryOptions());
    context.queryClient.prefetchQuery(inventoryQueryOptions());
    context.queryClient.prefetchQuery(homeAreasQueryOptions());
  },
});

function ShoppingPage() {
  const { data: shoppingList } = useSuspenseQuery(shoppingListQueryOptions());
  const { data: inventoryItems } = useSuspenseQuery(inventoryQueryOptions());
  const { data: homeAreas } = useSuspenseQuery(homeAreasQueryOptions());
  const isMobile = useMediaQuery("(max-width: 1023px)");

  const addDialog = useDialogState();
  const deleteDialog = useDialogState<ShoppingListItem>();
  const abandonDialog = useDialogState();
  const completeDialog = useDialogState();
  const cancelDialog = useDialogState();

  const addItem = useAddShoppingListItem();
  const removeItem = useRemoveShoppingListItem();
  const toggleChecked = useToggleItemChecked();
  const startTrip = useStartShoppingTrip();
  const completeTrip = useCompleteShoppingTrip();
  const abandonDraft = useAbandonDraft();
  const cancelTrip = useCancelShoppingTrip();

  const isVirtualDraft = shoppingList.id === "virtual-draft";
  const isDraft = shoppingList.status === ShoppingListStatus.DRAFT;
  const isActive = shoppingList.status === ShoppingListStatus.ACTIVE;

  // Filter inventory items not already in the shopping list
  const availableInventoryItems = inventoryItems.filter((item) => {
    // Exclude items already in the shopping list
    const isInList = shoppingList.items.some(
      (listItem) => listItem.inventoryItem?.id === item.id
    );
    // Only include items that are not in the list
    return !isInList && item.status !== InventoryStatus.NOT_NEEDED;
  });

  const checkedCount = shoppingList.items.filter((item) => item.checked).length;
  const totalCount = shoppingList.items.length;
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  const handleAddItem = async (data: CreateShoppingListItemInput) => {
    try {
      const inventoryItem = data.inventoryItemId
        ? inventoryItems.find((i) => i.id === data.inventoryItemId)
        : undefined;
      const homeArea = data.homeAreaId
        ? homeAreas.find((a) => a.id === data.homeAreaId)
        : undefined;

      await addItem.mutateAsync({
        listId: shoppingList.id,
        name: data.name,
        inventoryItem,
        homeArea,
        addToInventory: data.addToInventory,
      });

      toast.success("Item added", {
        description: `${data.name} has been added to your shopping list.`,
      });
      // Keep dialog open for adding more items
    } catch (error) {
      toast.error("Failed to add item", {
        description: "Please try again.",
      });
    }
  };

  const handleRemoveItem = async () => {
    if (!deleteDialog.data) return;

    try {
      await removeItem.mutateAsync({
        itemId: deleteDialog.data.id,
        listId: shoppingList.id,
      });
      toast.success("Item removed", {
        description: `${deleteDialog.data.name} has been removed.`,
      });
      deleteDialog.close();
    } catch (error) {
      toast.error("Failed to remove item", {
        description: "Please try again.",
      });
    }
  };

  const handleToggleChecked = async (item: ShoppingListItem) => {
    try {
      await toggleChecked.mutateAsync({
        itemId: item.id,
        checked: !item.checked,
      });
    } catch (error) {
      toast.error("Failed to update item", {
        description: "Please try again.",
      });
    }
  };

  const handleStartShopping = async () => {
    try {
      await startTrip.mutateAsync(shoppingList.id);
      toast.success("Shopping trip started!", {
        description: "Check off items as you shop.",
      });
    } catch (error) {
      toast.error("Failed to start shopping", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  const handleCompleteShopping = async () => {
    try {
      await completeTrip.mutateAsync(shoppingList.id);
      toast.success("Shopping complete!", {
        description: `${checkedCount} items marked as in stock.`,
      });
      completeDialog.close();
    } catch (error) {
      toast.error("Failed to complete shopping", {
        description: "Please try again.",
      });
    }
  };

  const handleAbandonDraft = async () => {
    try {
      await abandonDraft.mutateAsync(shoppingList.id);
      toast.success("Draft cleared", {
        description: "Your shopping list has been cleared.",
      });
      abandonDialog.close();
    } catch (error) {
      toast.error("Failed to clear list", {
        description: "Please try again.",
      });
    }
  };

  const handleCancelShopping = async () => {
    try {
      await cancelTrip.mutateAsync(shoppingList.id);
      toast.success("Shopping trip cancelled", {
        description: "Your list has been returned to draft mode.",
      });
      cancelDialog.close();
    } catch (error) {
      toast.error("Failed to cancel shopping", {
        description: "Please try again.",
      });
    }
  };

  // Empty state
  if (shoppingList.items.length === 0) {
    return (
      <EmptyShoppingView
        addDialog={addDialog}
        homeAreas={homeAreas}
        availableInventoryItems={availableInventoryItems}
        handleAddItem={handleAddItem}
        addItem={addItem}
      />
    );
  }

  // Active shopping mode
  if (isActive) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-primary" />
              Shopping
            </h1>
            <p className="text-muted-foreground mt-1">
              Tap items to check them off
            </p>
          </div>
        </div>
        {/* Items List */}
        <div className="space-y-2">
          {/* Unchecked items first */}
          {shoppingList.items
            .filter((item) => !item.checked)
            .map((item) => (
              <ShoppingItemCard
                item={item}
                isActive={isActive}
                isDraft={isDraft}
                isMobile={isMobile}
                handleToggleChecked={handleToggleChecked}
                openDeleteDialog={deleteDialog.open}
              />
            ))}

          {/* Checked items at bottom */}
          {checkedCount > 0 && (
            <>
              <div className="flex items-center gap-2 py-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">
                  Checked ({checkedCount})
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
              {shoppingList.items
                .filter((item) => item.checked)
                .map((item) => (
                  <ShoppingItemCard
                    item={item}
                    isActive={isActive}
                    isDraft={isDraft}
                    isMobile={isMobile}
                    handleToggleChecked={handleToggleChecked}
                    openDeleteDialog={deleteDialog.open}
                  />
                ))}
            </>
          )}
        </div>
        {/* Complete Button with Progress Bar as top border */}
        <div className="sticky bottom-17 md:bottom-4 pt-4 bg-background">
          {/* Progress Bar as top border */}
          <div className="h-2 bg-muted rounded-t-lg overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs px-1 py-1 text-muted-foreground">
            <span>Progress</span>
            <span className="font-medium">
              {checkedCount}/{totalCount}
            </span>
          </div>
          <div className="space-y-2">
            <Button
              size="lg"
              className="w-full gap-2 h-14 text-lg font-semibold"
              onClick={() => completeDialog.open()}
            >
              <PartyPopper className="h-5 w-5" />
              I'M DONE!
            </Button>
            <Button
              variant="ghost"
              className="w-full gap-2 text-muted-foreground"
              onClick={() => cancelDialog.open()}
            >
              <XCircle className="h-4 w-4" />
              Cancel Shopping
            </Button>
          </div>
        </div>
        {/* Complete Confirmation */}
        <ConfirmationDialog
          open={completeDialog.isOpen}
          onOpenChange={(open) =>
            open ? completeDialog.open() : completeDialog.close()
          }
          title="Complete Shopping Trip?"
          description={
            <div className="space-y-3">
              <p>
                {checkedCount > 0
                  ? `${checkedCount} checked item${
                      checkedCount !== 1 ? "s" : ""
                    } will be marked as in stock in your inventory.`
                  : "No items were checked. Your inventory won't be updated."}
              </p>
              {totalCount - checkedCount > 0 && (
                <p className="text-muted-foreground">
                  {totalCount - checkedCount} unchecked item
                  {totalCount - checkedCount !== 1 ? "s" : ""} will remain out
                  of stock.
                </p>
              )}
            </div>
          }
          confirmLabel="Complete"
          onConfirm={handleCompleteShopping}
          isLoading={completeTrip.isPending}
        />
        {/* Cancel Shopping Confirmation */}
        <ConfirmationDialog
          open={cancelDialog.isOpen}
          onOpenChange={(open) =>
            open ? cancelDialog.open() : cancelDialog.close()
          }
          title="Cancel Shopping Trip?"
          description="Your shopping trip will be cancelled and returned to draft mode. All items will be unchecked."
          confirmLabel="Cancel Trip"
          onConfirm={handleCancelShopping}
          isLoading={cancelTrip.isPending}
          variant="destructive"
        />
      </div>
    );
  }

  // Draft/Planning mode
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Shopping List</h1>
          <p className="text-muted-foreground mt-1">
            {isVirtualDraft
              ? "Items from your out-of-stock inventory"
              : "Plan your shopping trip"}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => addDialog.open()}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Items</span>
        </Button>
      </div>

      {/* Summary Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm text-muted-foreground">Items to shop</p>
            <p className="text-2xl font-bold">{totalCount}</p>
          </div>
          <Button
            size="lg"
            className="gap-2"
            onClick={handleStartShopping}
            disabled={startTrip.isPending || totalCount === 0}
          >
            <PlayCircle className="h-5 w-5" />
            Start Shopping
          </Button>
        </CardContent>
      </Card>

      {/* Items List */}
      <div className="space-y-2">
        {shoppingList.items.map((item) => (
          <ShoppingItemCard
            item={item}
            isActive={isActive}
            isDraft={isDraft}
            isMobile={isMobile}
            handleToggleChecked={handleToggleChecked}
            openDeleteDialog={deleteDialog.open}
          />
        ))}
      </div>

      {/* Clear List Button */}
      {!isVirtualDraft && (
        <div className="pt-4">
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={() => abandonDialog.open()}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Clear List
          </Button>
        </div>
      )}

      {/* Add Items Dialog */}
      <ResponsiveDialog
        open={addDialog.isOpen}
        onOpenChange={(open) => (open ? addDialog.open() : addDialog.close())}
        title="Add Items"
        description="Add an item to your shopping list."
      >
        <ShoppingListItemForm
          homeAreas={homeAreas}
          inventoryItems={availableInventoryItems}
          onSubmit={handleAddItem}
          onCancel={() => addDialog.close()}
          isSubmitting={addItem.isPending}
        />
      </ResponsiveDialog>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={deleteDialog.isOpen}
        onOpenChange={(open) =>
          open ? deleteDialog.open() : deleteDialog.close()
        }
        title="Remove Item"
        description={`Are you sure you want to remove "${deleteDialog.data?.name}" from your shopping list?`}
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={handleRemoveItem}
        isLoading={removeItem.isPending}
      />

      {/* Abandon Draft Confirmation */}
      <ConfirmationDialog
        open={abandonDialog.isOpen}
        onOpenChange={(open) =>
          open ? abandonDialog.open() : abandonDialog.close()
        }
        title="Clear Shopping List?"
        description="This will remove all items from your current shopping list. Items will remain in your inventory."
        confirmLabel="Clear"
        variant="destructive"
        onConfirm={handleAbandonDraft}
        isLoading={abandonDraft.isPending}
      />
    </div>
  );
}

interface EmptyShoppingViewProps {
  addDialog: ReturnType<typeof useDialogState>;
  homeAreas: Array<{ id: string; name: string }>;
  availableInventoryItems: InventoryItem[];
  handleAddItem: (data: CreateShoppingListItemInput) => Promise<void>;
  addItem: {
    isPending: boolean;
  };
}
function EmptyShoppingView({
  addDialog,
  homeAreas,
  availableInventoryItems,
  handleAddItem,
  addItem,
}: EmptyShoppingViewProps) {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Shopping</h1>
        <p className="text-muted-foreground mt-1">
          Create and manage your shopping lists
        </p>
      </div>

      <ShoppingListEmpty onAddItems={() => addDialog.open()} />

      {/* Add Item Dialog */}
      <ResponsiveDialog
        open={addDialog.isOpen}
        onOpenChange={(open) => (open ? addDialog.open() : addDialog.close())}
        title="Add Items"
        description="Add items to your shopping list."
      >
        <ShoppingListItemForm
          homeAreas={homeAreas}
          inventoryItems={availableInventoryItems}
          onSubmit={handleAddItem}
          onCancel={() => addDialog.close()}
          isSubmitting={addItem.isPending}
        />
      </ResponsiveDialog>
    </div>
  );
}
