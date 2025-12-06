import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import {
  Field,
  FieldLabel,
  FieldError,
  Input,
  Button,
} from "@app/components/forms";
import { RichTextEditor } from "@app/components/ui/rich-text-editor";
import type { Note } from "@repo/features/notes/note.entity";
import { noteSchema } from "@repo/features/notes/note.entity";
import type { HomeArea } from "@repo/features/home-areas/home-area.entity";

type NoteFormData = z.infer<typeof noteSchema>;

interface NoteFormProps {
  initialData?: Note;
  homeAreas: HomeArea[];
  onSubmit: (data: NoteFormData) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function NoteForm({
  initialData,
  homeAreas,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: NoteFormProps) {
  const form = useForm({
    defaultValues: {
      title: initialData?.title ?? "",
      content: initialData?.content ?? "",
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
          onChange: noteSchema.shape.title,
        }}
      >
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Title</FieldLabel>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="e.g., WiFi Password, Recipe, Instructions"
              disabled={isSubmitting}
              aria-invalid={field.state.meta.errors.length > 0}
            />
            <FieldError errors={field.state.meta.errors} />
          </Field>
        )}
      </form.Field>

      <form.Field
        name="content"
        validators={{
          onChange: noteSchema.shape.content,
        }}
      >
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Content</FieldLabel>
            <RichTextEditor
              content={field.state.value}
              onChange={(value) => field.handleChange(value)}
              placeholder="Write your note content here..."
              disabled={isSubmitting}
            />
            <FieldError errors={field.state.meta.errors} />
          </Field>
        )}
      </form.Field>

      <form.Field name="homeAreaId">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Area (Optional)</FieldLabel>
            <select
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              disabled={isSubmitting}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">No area</option>
              {homeAreas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
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
              {initialData ? "Update Note" : "Create Note"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
