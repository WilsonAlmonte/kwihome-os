import { ReactNode } from "react";
import { Card, CardContent } from "./card";
import { Button } from "./button";

interface EmptyStateProps {
  /** Icon element to display in the rounded container */
  icon: ReactNode;
  /** Icon background color class (e.g., "bg-primary/10") */
  iconBgColor?: string;
  /** Icon color class (e.g., "text-primary") */
  iconColor?: string;
  /** Main title text */
  title: string;
  /** Description or subtitle text */
  description: string;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  /** Optional additional content below description */
  children?: ReactNode;
}

/**
 * EmptyState Component
 * Displays a centered card with icon, title, description, and optional action button.
 * Used when a list/page has no content to display.
 */
export function EmptyState({
  icon,
  iconBgColor = "bg-primary/10",
  iconColor = "text-primary",
  title,
  description,
  action,
  children,
}: EmptyStateProps) {
  return (
    <Card className="border-dashed border-2">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full ${iconBgColor} mb-4`}
        >
          <div className={iconColor}>{icon}</div>
        </div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-[300px]">
          {description}
        </p>
        {children}
        {action && (
          <Button size="sm" className="gap-1.5" onClick={action.onClick}>
            {action.icon}
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
