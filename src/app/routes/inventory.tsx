import { createFileRoute } from "@tanstack/react-router";
import { Package, Plus } from "lucide-react";
import { Card, CardContent } from "@app/components/ui/card";
import { Button } from "@app/components/ui/button";

export const Route = createFileRoute("/inventory")({
  component: InventoryPage,
});

function InventoryPage() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Inventory</h1>
        <p className="text-muted-foreground mt-1">
          Track and manage all your household items
        </p>
      </div>

      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 mb-4">
            <Package className="h-7 w-7 text-amber-700" />
          </div>
          <h3 className="font-semibold mb-1">No items in inventory</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-[300px]">
            Start tracking items in your home. Add things like appliances,
            furniture, or supplies you want to keep an eye on.
          </p>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add your first item
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
