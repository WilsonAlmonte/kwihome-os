import {
  CheckCircle2,
  Circle,
  Edit,
  MapPin,
  Trash2,
  XCircle,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../forms";
import { Swipeable } from "../ui/swipeable";
import { useMediaQuery } from "@repo/app/hooks/use-media-query";
import {
  InventoryItem,
  InventoryStatus,
} from "@repo/features/inventory/inventory-item.entity";

export interface InventoryItemCardProps {
  item: InventoryItem;
  openAddDialog: (item?: InventoryItem) => void;
  openDeleteDialog: (item: InventoryItem) => void;
  handleToggleStatus: (item: InventoryItem) => void;
}

export function InventoryItemCard({
  item,
  openAddDialog,
  openDeleteDialog,
  handleToggleStatus,
}: InventoryItemCardProps) {
  const isMobile = useMediaQuery("(max-width: 1023px)");

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

  const cardContent = (
    <Card
      className="transition-all hover:shadow-sm hover:border-primary/50 cursor-pointer"
      onClick={() => openAddDialog(item)}
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
                openAddDialog(item);
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
                openDeleteDialog(item);
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
      onSwipeLeft={() => openDeleteDialog(item)}
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
}
