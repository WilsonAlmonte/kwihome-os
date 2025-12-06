/**
 * Form components barrel export
 * Import commonly used form components in one line
 */

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldSet,
  FieldLegend,
  FieldContent,
  FieldTitle,
  FieldSeparator,
} from "@app/components/ui/field";

export { Input } from "@app/components/ui/input";
export { Label } from "@app/components/ui/label";
export { Button } from "@app/components/ui/button";

// Shared Form Components
export { HomeAreaSelector } from "./home-area-selector";
export { FormActions } from "./form-actions";

// Domain Forms
export { HomeAreaForm } from "./home-area-form";
export { NoteForm } from "./note-form";
export { ShoppingListItemForm } from "./shopping-list-item-form";
