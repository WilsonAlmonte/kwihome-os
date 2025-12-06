import { Button } from "@app/components/ui/button";

interface FormActionsProps {
  onCancel?: () => void;
  canSubmit: boolean;
  isSubmitting: boolean;
  submitLabel: string;
}

export function FormActions({
  onCancel,
  canSubmit,
  isSubmitting,
  submitLabel,
}: FormActionsProps) {
  return (
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
      <Button type="submit" disabled={!canSubmit || isSubmitting}>
        {submitLabel}
      </Button>
    </div>
  );
}
