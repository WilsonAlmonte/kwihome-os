import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  Package,
  ShoppingCart,
  CheckSquare,
  FileText,
} from "lucide-react";
import { cn } from "@app/lib/utils";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/inventory", icon: Package, label: "Inventory" },
  { to: "/shopping", icon: ShoppingCart, label: "Shopping" },
  { to: "/tasks", icon: CheckSquare, label: "Tasks" },
  { to: "/notes", icon: FileText, label: "Notes" },
] as const;

export function BottomNav() {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background lg:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = currentPath === item.to;
          const Icon = item.icon;

          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs transition-colors",
                "active:scale-95 active:bg-accent",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-all",
                  isActive && "scale-110"
                )}
              />
              <span className={cn("font-medium", isActive && "font-semibold")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      {/* Safe area padding for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-background" />
    </nav>
  );
}
