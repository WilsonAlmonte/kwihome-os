import { MapPin, CheckCheckIcon } from "lucide-react";
import type { HomeArea } from "@repo/features/home-areas/home-area.entity";
import { Field } from "@app/components/ui/field";

interface HomeAreaSelectorProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  homeAreas: HomeArea[];
  disabled?: boolean;
  showNoRoomOption?: boolean;
}

export function HomeAreaSelector({
  value,
  onChange,
  homeAreas,
  disabled = false,
  showNoRoomOption = true,
}: HomeAreaSelectorProps) {
  return (
    <Field>
      <div className="grid grid-cols-2 gap-2">
        {showNoRoomOption && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            disabled={disabled}
            className={`flex items-center justify-center px-3 py-2.5 text-sm rounded-lg border-2 transition-all ${
              !value
                ? "border-primary bg-primary/10 text-primary font-medium"
                : "border-input hover:border-primary/50 hover:bg-accent"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            No Room
          </button>
        )}
        {homeAreas.map((area) => (
          <button
            key={area.id}
            type="button"
            onClick={() => onChange(area.id)}
            disabled={disabled}
            className={`flex items-center justify-center px-3 py-2.5 text-sm rounded-lg border-2 transition-all truncate ${
              value === area.id
                ? "border-primary bg-primary/10 text-primary font-medium"
                : "border-input hover:border-primary/50 hover:bg-accent"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {value === area.id ? (
              <CheckCheckIcon className="h-3.5 w-3.5 mr-1.5" />
            ) : (
              <MapPin className="h-3.5 w-3.5 mr-1.5" />
            )}
            {area.name}
          </button>
        ))}
      </div>
    </Field>
  );
}
