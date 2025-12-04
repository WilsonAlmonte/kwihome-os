import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import {
  Field,
  FieldLabel,
  FieldError,
  Input,
  Button,
} from "@app/components/forms";
import type { HomeArea } from "@repo/features/home-areas/home-area.entity";
import { homeAreaSchema } from "@repo/features/home-areas/home-area.entity";

type HomeAreaFormData = z.infer<typeof homeAreaSchema>;

interface HomeAreaFormProps {
  initialData?: HomeArea;
  onSubmit: (data: HomeAreaFormData) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function HomeAreaForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: HomeAreaFormProps) {
  const form = useForm({
    defaultValues: {
      name: initialData?.name ?? "",
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
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
          onChange: homeAreaSchema.shape.name,
        }}
      >
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Area Name</FieldLabel>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="e.g., Kitchen, Living Room, Garage"
              disabled={isSubmitting}
              aria-invalid={field.state.meta.errors.length > 0}
            />
            <FieldError errors={field.state.meta.errors} />
          </Field>
        )}
      </form.Field>

      <div className="flex gap-2 justify-end pt-2">
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
              {initialData ? "Update Area" : "Create Area"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
