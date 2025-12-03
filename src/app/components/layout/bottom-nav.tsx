import { Link, useRouterState } from "@tanstack/react-router";

import { cn } from "@app/lib/utils";
import { navItems } from "./nav-items";

export function BottomNav() {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm lg:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = currentPath === item.to;
          const Icon = item.icon;

          return (
            <Link
              key={item.to}
              to={item.to}
              title={`${item.label} — ${item.description}`}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs transition-all duration-200",
                "active:scale-95",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center rounded-full px-3 py-1 transition-all duration-200",
                  isActive && "bg-primary/15"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-all",
                    isActive && "text-primary"
                  )}
                />
              </div>
              <span
                className={cn(
                  "font-medium",
                  isActive && "font-semibold text-primary"
                )}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-2 h-1 w-12 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
      {/* Safe area padding for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-background" />
    </nav>
  );
}
