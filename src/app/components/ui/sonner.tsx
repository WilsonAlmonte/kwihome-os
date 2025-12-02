import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          success:
            "!bg-emerald-50 !text-emerald-900 !border-emerald-200 dark:!bg-emerald-950 dark:!text-emerald-50 dark:!border-emerald-800 [&_[data-description]]:!text-emerald-800 dark:[&_[data-description]]:!text-emerald-100",
          error:
            "!bg-red-50 !text-red-900 !border-red-200 dark:!bg-red-950 dark:!text-red-50 dark:!border-red-800 [&_[data-description]]:!text-red-800 dark:[&_[data-description]]:!text-red-100",
          warning:
            "!bg-amber-50 !text-amber-900 !border-amber-200 dark:!bg-amber-950 dark:!text-amber-50 dark:!border-amber-800 [&_[data-description]]:!text-amber-800 dark:[&_[data-description]]:!text-amber-100",
          info: "!bg-blue-50 !text-blue-900 !border-blue-200 dark:!bg-blue-950 dark:!text-blue-50 dark:!border-blue-800 [&_[data-description]]:!text-blue-800 dark:[&_[data-description]]:!text-blue-100",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
