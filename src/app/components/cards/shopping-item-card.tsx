import {
  CheckCircle2,
  Circle,
  MapPin,
  Package,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../forms";
import { Swipeable } from "../ui/swipeable";
import { ShoppingListItem } from "@repo/features/shopping-lists";

export interface ShoppingItemCardProps {
  item: ShoppingListItem;
  isActive?: boolean;
  isDraft?: boolean;
  isMobile?: boolean;
  handleToggleChecked: (item: ShoppingListItem) => void;
  openDeleteDialog: (item: ShoppingListItem) => void;
}
export function ShoppingItemCard({
  item,
  isActive,
  isDraft,
  isMobile,
  handleToggleChecked,
  openDeleteDialog,
}: ShoppingItemCardProps) {
  // Compact view for active shopping mode
  if (isActive) {
    return (
      <div key={item.id}>
        <Card
          className={`transition-all cursor-pointer ${
            item.checked
              ? "bg-muted/50 border-muted"
              : "hover:shadow-sm hover:border-primary/50"
          }`}
          onClick={() => handleToggleChecked(item)}
        >
          <CardContent className="flex items-center gap-2 px-2 md:p-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleChecked(item);
              }}
              className="shrink-0"
            >
              {item.checked ? (
                <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-success" />
              ) : (
                <Circle className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground hover:text-primary transition-colors" />
              )}
            </button>
            <span
              className={`text-sm md:text-base ${
                item.checked ? "line-through text-muted-foreground" : ""
              }`}
            >
              {item.name}
            </span>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Full view for draft mode
  const cardContent = (
    <Card
      className={`transition-all ${
        item.checked
          ? "bg-muted/50 border-muted"
          : "hover:shadow-sm hover:border-primary/50"
      }`}
    >
      <CardContent className="flex items-center gap-3 p-3 md:p-4">
        <div className="shrink-0">
          {item.inventoryItem ? (
            <Package className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm md:text-base">{item.name}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            {item.homeArea && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {item.homeArea.name}
              </span>
            )}
            {item.inventoryItem && (
              <span className="text-xs text-muted-foreground">
                • From inventory
              </span>
            )}
          </div>
        </div>

        {isDraft && !isMobile && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              openDeleteDialog(item);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );

  if (isDraft && isMobile) {
    return (
      <Swipeable
        key={item.id}
        onSwipeLeft={() => openDeleteDialog(item)}
        leftAction={
          <div className="w-full h-full bg-destructive flex items-center justify-center rounded-xl">
            <Trash2 className="h-5 w-5 text-destructive-foreground" />
          </div>
        }
      >
        {cardContent}
      </Swipeable>
    );
  }

  return <div key={item.id}>{cardContent}</div>;
}
