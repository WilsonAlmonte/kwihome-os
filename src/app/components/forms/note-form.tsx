import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import {
  Field,
  FieldError,
  Input,
  HomeAreaSelector,
  FormActions,
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
            submitLabel={initialData ? "Update Note" : "Create Note"}
          />
        )}
      </form.Subscribe>
    </form>
  );
}
