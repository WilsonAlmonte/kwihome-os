import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { MapPin, CheckCheckIcon } from "lucide-react";
import { Field, FieldError, Input, Button } from "@app/components/forms";
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
            <div className="grid grid-cols-2 gap-2">
              {!initialData?.homeArea && (
                <button
                  type="button"
                  onClick={() => field.handleChange("")}
                  disabled={isSubmitting}
                  className={`flex items-center justify-center px-3 py-2.5 text-sm rounded-lg border-2 transition-all ${
                    field.state.value === ""
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-input hover:border-primary/50 hover:bg-accent"
                  } ${
                    isSubmitting
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  No Room
                </button>
              )}
              {homeAreas.map((area) => (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => field.handleChange(area.id)}
                  disabled={isSubmitting}
                  className={`flex items-center justify-center px-3 py-2.5 text-sm rounded-lg border-2 transition-all ${
                    field.state.value === area.id
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-input hover:border-primary/50 hover:bg-accent"
                  } ${
                    isSubmitting
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  {field.state.value === area.id ? (
                    <CheckCheckIcon className="h-3.5 w-3.5 mr-1.5" />
                  ) : (
                    <MapPin className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  {area.name}
                </button>
              ))}
            </div>
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
