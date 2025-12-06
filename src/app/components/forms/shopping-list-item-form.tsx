import { useForm } from "@tanstack/react-form";
import { useState, useMemo } from "react";
import { z } from "zod";
import {
  Field,
  FieldLabel,
  FieldError,
  Input,
  HomeAreaSelector,
  FormActions,
} from "@app/components/forms";
import { Checkbox } from "@app/components/ui/checkbox";
import type { HomeArea } from "@repo/features/home-areas/home-area.entity";
import type { InventoryItem } from "@repo/features/inventory/inventory-item.entity";
import { shoppingListItemSchema } from "@repo/features/shopping-lists/shopping-list.entity";
import { Package, Search } from "lucide-react";

type ShoppingListItemFormData = z.infer<typeof shoppingListItemSchema>;

interface ShoppingListItemFormProps {
  homeAreas: HomeArea[];
  inventoryItems: InventoryItem[];
  onSubmit: (data: ShoppingListItemFormData) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function ShoppingListItemForm({
  homeAreas,
  inventoryItems,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ShoppingListItemFormProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInventoryItem, setSelectedInventoryItem] =
    useState<InventoryItem | null>(null);

  // Filter inventory items based on search query
  const filteredInventoryItems = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return inventoryItems
      .filter((item) => item.name.toLowerCase().includes(query))
      .slice(0, 5); // Limit suggestions
  }, [searchQuery, inventoryItems]);

  const form = useForm({
    defaultValues: {
      name: "",
      inventoryItemId: undefined as string | undefined,
      homeAreaId: undefined as string | undefined,
      addToInventory: false,
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        name: value.name,
        inventoryItemId: value.inventoryItemId,
        homeAreaId: value.homeAreaId,
        addToInventory: value.addToInventory,
      });
      // Reset form state after successful submission
      form.reset();
      setSearchQuery("");
      setSelectedInventoryItem(null);
    },
  });

  const handleSelectInventoryItem = (item: InventoryItem) => {
    setSelectedInventoryItem(item);
    setSearchQuery(item.name);
    form.setFieldValue("name", item.name);
    form.setFieldValue("inventoryItemId", item.id);
    form.setFieldValue("homeAreaId", item.homeArea?.id);
    form.setFieldValue("addToInventory", false); // Already in inventory
  };

  const handleClearSelection = () => {
    setSelectedInventoryItem(null);
    form.setFieldValue("inventoryItemId", undefined);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Field
        name="name"
        validators={{
          onChange: shoppingListItemSchema.shape.name,
        }}
      >
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Item Name</FieldLabel>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  field.handleChange(e.target.value);
                  setSearchQuery(e.target.value);
                  if (selectedInventoryItem) {
                    handleClearSelection();
                  }
                }}
                placeholder="Search or add new item..."
                autoComplete="off"
                disabled={isSubmitting}
                className="pl-9"
                aria-invalid={field.state.meta.errors.length > 0}
              />
            </div>
            <FieldError errors={field.state.meta.errors} />

            {/* Inventory Suggestions */}
            {filteredInventoryItems.length > 0 && !selectedInventoryItem && (
              <div className="mt-2 border rounded-lg overflow-hidden">
                <div className="px-3 py-2 bg-muted/50 text-xs text-muted-foreground">
                  From your inventory
                </div>
                {filteredInventoryItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectInventoryItem(item)}
                    className="w-full px-3 py-2 text-left hover:bg-accent flex items-center gap-2 transition-colors"
                  >
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>{item.name}</span>
                    {item.homeArea && (
                      <span className="text-xs text-muted-foreground ml-auto">
                        {item.homeArea.name}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Selected inventory item indicator */}
            {selectedInventoryItem && (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="h-4 w-4" />
                <span>From inventory</span>
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="text-xs underline hover:text-foreground"
                >
                  Clear
                </button>
              </div>
            )}
          </Field>
        )}
      </form.Field>

      {/* Add to Inventory Toggle - only show for new items not from inventory */}
      {!selectedInventoryItem && (
        <form.Field name="addToInventory">
          {(field) => (
            <Field>
              <div
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  field.state.value
                    ? "border-primary bg-primary/10"
                    : "border-input hover:border-primary/50 hover:bg-accent"
                } ${isSubmitting ? "opacity-50" : ""}`}
              >
                <Checkbox
                  id={field.name}
                  name={field.name}
                  checked={field.state.value}
                  onBlur={field.handleBlur}
                  onCheckedChange={(checked) =>
                    field.handleChange(checked === true)
                  }
                  disabled={isSubmitting}
                  className="h-5 w-5"
                />
                <label
                  htmlFor={field.name}
                  className="text-sm font-light cursor-pointer flex-1"
                >
                  Add to inventory for future tracking
                </label>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                If enabled, this item will be added to your inventory list for
                easy reuse.
              </p>
            </Field>
          )}
        </form.Field>
      )}

      {/* Room/Area Selection - only show for new items when tracking is enabled */}
      {!selectedInventoryItem && (
        <form.Subscribe selector={(state) => state.values.addToInventory}>
          {(addToInventory) =>
            addToInventory && (
              <form.Field name="homeAreaId">
                {(field) => (
                  <HomeAreaSelector
                    value={field.state.value}
                    onChange={(value) => field.handleChange(value)}
                    homeAreas={homeAreas}
                    disabled={isSubmitting}
                    showNoRoomOption={true}
                  />
                )}
              </form.Field>
            )
          }
        </form.Subscribe>
      )}

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
      >
        {([canSubmit, isSubmittingForm]) => (
          <FormActions
            onCancel={onCancel}
            canSubmit={canSubmit as boolean}
            isSubmitting={isSubmitting || (isSubmittingForm as boolean)}
            submitLabel="Add Item"
          />
        )}
      </form.Subscribe>
    </form>
  );
}
