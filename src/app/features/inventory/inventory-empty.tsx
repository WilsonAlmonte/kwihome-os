import { Plus } from "lucide-react";
import { EmptyState } from "@app/components/ui/empty-state";
import { Package } from "lucide-react";

interface InventoryEmptyProps {
  onAddItem: () => void;
  isFirstItem?: boolean;
}

/**
 * InventoryEmpty Component
 * Displays empty state when no inventory items exist
 */
export function InventoryEmpty({
  onAddItem,
  isFirstItem = true,
}: InventoryEmptyProps) {
  return (
    <EmptyState
      icon={<Package className="h-7 w-7" />}
      iconBgColor="bg-primary/10"
      iconColor="text-primary"
      title={isFirstItem ? "No items yet" : "No items found"}
      description={
        isFirstItem
          ? "Start building your inventory by adding items you regularly purchase."
          : "No items match the selected filter."
      }
      action={{
        label: isFirstItem ? "Add your first item" : "Add Item",
        onClick: onAddItem,
        icon: <Plus className="h-4 w-4" />,
      }}
    />
  );
}
