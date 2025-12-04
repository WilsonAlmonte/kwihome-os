import { createFileRoute } from "@tanstack/react-router";
import { ShoppingCart, Plus } from "lucide-react";
import { Card, CardContent } from "@app/components/ui/card";
import { Button } from "@app/components/ui/button";

export const Route = createFileRoute("/shopping")({
  component: ShoppingPage,
});

function ShoppingPage() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Shopping</h1>
        <p className="text-muted-foreground mt-1">
          Create and manage your shopping lists
        </p>
      </div>

      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 mb-4">
            <ShoppingCart className="h-7 w-7 text-emerald-700" />
          </div>
          <h3 className="font-semibold mb-1">No shopping lists yet</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-[300px]">
            Create a shopping list to keep track of groceries, household
            supplies, or anything else you need to buy.
          </p>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Create a shopping list
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
