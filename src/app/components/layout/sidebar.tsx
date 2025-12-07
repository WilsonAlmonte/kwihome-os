import { Link, useRouterState } from "@tanstack/react-router";

import { cn } from "@app/lib/utils";
import { Separator } from "@app/components/ui/separator";
import { navItems } from "./nav-items";
import { HousePlug } from "lucide-react";
import { version } from "package.json";

export function Sidebar() {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-sidebar-border bg-sidebar">
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center font-heading justify-center rounded-lg bg-linear-30 from-primary to-primary/80 shadow-sm text-primary-foreground font-bold transition-transform group-hover:scale-105">
            <HousePlug className="h-5 w-5 stroke-2" />
          </div>
          <span className="text-xl font-bold text-sidebar-foreground font-heading">
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
              title={`${item.label} — ${item.description}`}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                )}
              />
              <div className="flex flex-col">
                <span>{item.label}</span>
                {isActive && (
                  <span className="text-xs font-normal text-primary-foreground/80">
                    {item.description}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4">
        <Separator className="mb-4 bg-sidebar-border" />
        <div className="px-3 text-xs text-muted-foreground">
          Kwihome OS v{version}
        </div>
      </div>
    </aside>
  );
}
