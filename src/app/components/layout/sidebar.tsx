import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  Package,
  ShoppingCart,
  CheckSquare,
  FileText,
} from "lucide-react";
import { cn } from "@app/lib/utils";
import { Separator } from "@app/components/ui/separator";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/inventory", icon: Package, label: "Inventory" },
  { to: "/shopping", icon: ShoppingCart, label: "Shopping" },
  { to: "/tasks", icon: CheckSquare, label: "Tasks" },
  { to: "/notes", icon: FileText, label: "Notes" },
] as const;

export function Sidebar() {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r bg-sidebar">
      <div className="flex h-16 items-center px-6 border-b">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            K
          </div>
          <span className="text-xl font-bold text-sidebar-foreground">
            Kwihome
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = currentPath === item.to;
          const Icon = item.icon;

          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4">
        <Separator className="mb-4" />
        <div className="px-3 text-xs text-muted-foreground">
          Kwihome OS v0.1.0
        </div>
      </div>
    </aside>
  );
}
