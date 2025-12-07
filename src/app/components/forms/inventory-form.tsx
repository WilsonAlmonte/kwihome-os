import { HomeArea } from "@repo/features/home-areas/home-area.entity";
import {
  InventoryItem,
  inventoryItemSchema,
  InventoryStatus,
} from "@repo/features/inventory/inventory-item.entity";
import { useForm } from "@tanstack/react-form";
import z from "zod";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { HomeAreaSelector } from "./home-area-selector";
import { Button } from "../ui/button";

export type InventoryFormData = z.infer<typeof inventoryItemSchema>;

interface InventoryFormProps {
  initialData?: InventoryItem;
  homeAreas: HomeArea[];
  onSubmit: (data: InventoryFormData) => void | Promise<void>;
  onCancel?: () => void;
  onMarkAsNotNeeded?: () => void | Promise<void>;
  isSubmitting?: boolean;
}

export function InventoryForm({
  initialData,
  homeAreas,
  onSubmit,
  onCancel,
  onMarkAsNotNeeded,
  isSubmitting = false,
}: InventoryFormProps) {
  const form = useForm({
    defaultValues: {
      name: initialData?.name ?? "",
      homeAreaId: initialData?.homeArea?.id ?? "",
      status: initialData?.status ?? InventoryStatus.OUT_OF_STOCK,
      isInStock: initialData?.status === InventoryStatus.IN_STOCK,
    },
    onSubmit: async ({ value }) => {
      const status = value.isInStock
        ? InventoryStatus.IN_STOCK
        : InventoryStatus.OUT_OF_STOCK;
      await onSubmit({ ...value, status });
    },
  });

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
          onChange: inventoryItemSchema.shape.name,
        }}
      >
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Item Name</FieldLabel>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="e.g., Milk, Paper Towels, Dish Soap"
              autoComplete="off"
              disabled={isSubmitting}
              aria-invalid={field.state.meta.errors.length > 0}
            />
            <FieldError errors={field.state.meta.errors} />
          </Field>
        )}
      </form.Field>

      <form.Field name="isInStock">
        {(field) => (
          <Field>
            <div
              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                field.state.value
                  ? "border-success bg-success/10 dark:bg-success/50 dark:border-success"
                  : "border-input hover:border-primary/50 hover:bg-accent"
              } ${
                isSubmitting ||
                initialData?.status === InventoryStatus.NOT_NEEDED
                  ? "opacity-50"
                  : "hover:opacity-90"
              }`}
            >
              <Checkbox
                id={field.name}
                name={field.name}
                checked={field.state.value}
                onBlur={field.handleBlur}
                onCheckedChange={(checked) =>
                  field.handleChange(checked === true)
                }
                disabled={
                  isSubmitting ||
                  initialData?.status === InventoryStatus.NOT_NEEDED
                }
                className="h-5 w-5 data-[state=checked]:bg-success data-[state=checked]:border-success"
              />
              <label
                htmlFor={field.name}
                className="text-sm font-light cursor-pointer flex-1"
              >
                Item is in stock
              </label>
            </div>
            {initialData?.status === InventoryStatus.NOT_NEEDED && (
              <p className="text-xs text-muted-foreground mt-2">
                This item is marked as "Not Needed". Update it below to restore
                stock tracking.
              </p>
            )}
          </Field>
        )}
      </form.Field>

      <form.Field name="homeAreaId">
        {(field) => (
          <HomeAreaSelector
            value={field.state.value || undefined}
            onChange={(value) => field.handleChange(value ?? "")}
            homeAreas={homeAreas}
            disabled={isSubmitting}
            showNoRoomOption={!initialData?.homeArea}
          />
        )}
      </form.Field>

      <div className="flex gap-2 justify-between pt-2">
        <div>
          {initialData &&
            initialData.status !== InventoryStatus.NOT_NEEDED &&
            onMarkAsNotNeeded && (
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground"
                onClick={onMarkAsNotNeeded}
                disabled={isSubmitting}
              >
                I don't need this
              </Button>
            )}
          {initialData && initialData.status === InventoryStatus.NOT_NEEDED && (
            <Button
              type="submit"
              variant="ghost"
              className="text-muted-foreground"
              disabled={isSubmitting}
            >
              Restore item
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmittingForm]) => (
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting || isSubmittingForm}
              >
                {initialData ? "Update Item" : "Add Item"}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </div>
    </form>
  );
}
