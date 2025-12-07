import { Plus } from "lucide-react";
import { EmptyState } from "@app/components/ui/empty-state";
import { ShoppingCart } from "lucide-react";

interface ShoppingListEmptyProps {
  onAddItems: () => void;
}

/**
 * ShoppingListEmpty Component
 * Displays empty state when no shopping list items exist
 */
export function ShoppingListEmpty({ onAddItems }: ShoppingListEmptyProps) {
  return (
    <EmptyState
      icon={<ShoppingCart className="h-7 w-7" />}
      iconBgColor="bg-primary/10"
      iconColor="text-primary"
      title="No items to shop for"
      description="Add items to your shopping list or mark inventory items as out of stock."
      action={{
        label: "Add items",
        onClick: onAddItems,
        icon: <Plus className="h-4 w-4" />,
      }}
    />
  );
}
