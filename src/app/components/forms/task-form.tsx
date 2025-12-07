import { HomeArea } from "@repo/features/home-areas/home-area.entity";
import { Task, taskSchema } from "@repo/features/tasks/task.entity";
import { useForm } from "@tanstack/react-form";
import z from "zod";
import { Field, FieldError } from "../ui/field";
import { Input } from "../ui/input";
import { HomeAreaSelector } from "./home-area-selector";
import { FormActions } from "./form-actions";

export type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  initialData?: Task;
  homeAreas: HomeArea[];
  onSubmit: (data: TaskFormData) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}
export function TaskForm({
  initialData,
  homeAreas,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: TaskFormProps) {
  const form = useForm({
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      homeAreaId: initialData?.homeArea?.id ?? "",
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
        name="title"
        validators={{
          onChange: taskSchema.shape.title,
        }}
      >
        {(field) => (
          <Field>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="e.g., Clean the kitchen, Fix leaky faucet"
              disabled={isSubmitting}
              aria-invalid={field.state.meta.errors.length > 0}
            />
            <FieldError errors={field.state.meta.errors} />
          </Field>
        )}
      </form.Field>

      <form.Field name="description">
        {(field) => (
          <Field>
            <textarea
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Add any additional details..."
              disabled={isSubmitting}
              className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              rows={3}
            />
            <FieldError errors={field.state.meta.errors} />
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

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
      >
        {([canSubmit, isSubmittingForm]) => (
          <FormActions
            onCancel={onCancel}
            canSubmit={canSubmit as boolean}
            isSubmitting={isSubmitting || (isSubmittingForm as boolean)}
            submitLabel={initialData ? "Update Task" : "Create Task"}
          />
        )}
      </form.Subscribe>
    </form>
  );
}
