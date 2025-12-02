import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Package,
  ShoppingCart,
  CheckSquare,
  FileText,
  MapPin,
  Plus,
  ChevronRight,
  Zap,
  Home,
  BarChart3,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@app/components/ui/card";
import { Button } from "@app/components/ui/button";
import { createServerFn } from "@tanstack/react-start";
import { getContainer } from "@repo/di/container";

const getHomePageData = createServerFn().handler(async () => {
  const { repos, useCases } = getContainer();
  const stats = await useCases.getDashboardData.execute();
  const homeAreas = await repos.homeAreas.findAll();
  return { homeAreas, stats };
});

export const Route = createFileRoute("/")({
  component: HomePage,
  loader: async () => {
    const data = await getHomePageData();
    return { ...data };
  },
});

// Quick access cards for features
const quickAccessItems = [
  {
    to: "/inventory",
    icon: Package,
    label: "Inventory",
    description: "Track household items",
    color: "text-amber-700",
    bgColor: "bg-amber-500/10",
  },
  {
    to: "/shopping",
    icon: ShoppingCart,
    label: "Shopping",
    description: "Manage shopping lists",
    color: "text-emerald-700",
    bgColor: "bg-emerald-500/10",
  },
  {
    to: "/tasks",
    icon: CheckSquare,
    label: "Tasks",
    description: "Household to-dos",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    to: "/notes",
    icon: FileText,
    label: "Notes",
    description: "Important information",
    color: "text-rose-700",
    bgColor: "bg-rose-500/10",
  },
] as const;

// Constants for scaling
const MAX_VISIBLE_AREAS = 4;

function HomePage() {
  const { homeAreas, stats } = Route.useLoaderData();
  const [showAllAreas, setShowAllAreas] = useState(false);

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const hasUrgentItems = stats.outOfStockItems > 0 || stats.pendingTasks > 0;

  // Scaling: limit visible areas unless expanded
  const visibleAreas = showAllAreas
    ? homeAreas
    : homeAreas.slice(0, MAX_VISIBLE_AREAS);
  const hasMoreAreas = homeAreas.length > MAX_VISIBLE_AREAS;

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Welcome Section */}
      <section className="space-y-1">
        <p className="text-sm text-muted-foreground">{getGreeting()}</p>
        <h1 className="text-2xl font-bold md:text-3xl">
          Your Home at a Glance
        </h1>
        {hasUrgentItems && (
          <div className="flex flex-wrap items-center gap-3 pt-2 text-sm">
            {stats.outOfStockItems > 0 && (
              <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                {stats.outOfStockItems} item
                {stats.outOfStockItems !== 1 ? "s" : ""} need restocking
              </span>
            )}
            {stats.pendingTasks > 0 && (
              <span className="inline-flex items-center gap-1.5 text-primary">
                <span className="h-2 w-2 rounded-full bg-primary" />
                {stats.pendingTasks} task{stats.pendingTasks !== 1 ? "s" : ""}{" "}
                pending
              </span>
            )}
          </div>
        )}
      </section>

      {/* Quick Access Grid */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Quick Access</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {quickAccessItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to} className="group">
                <Card className="h-full shadow-sm bg-card/80 transition-all hover:shadow-md active:scale-[0.98] group-hover:border-primary/50">
                  <CardContent className="p-4">
                    <div
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${item.bgColor} mb-3`}
                    >
                      <Icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <h3 className="font-bold">{item.label}</h3>
                    <p className="text-xs text-muted-foreground mt-1 hidden md:block">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Home Areas Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Home Areas</h2>
            {homeAreas.length > 0 && (
              <span className="text-sm text-muted-foreground">
                ({homeAreas.length})
              </span>
            )}
          </div>
          {homeAreas.length > 0 && (
            <Button variant="ghost" size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Area</span>
            </Button>
          )}
        </div>

        {homeAreas.length > 0 ? (
          <div className="space-y-2">
            <div className="grid gap-2">
              {visibleAreas.map((area) => (
                <Card
                  key={area.id}
                  className="cursor-pointer transition-all hover:shadow-sm active:scale-[0.99] hover:border-primary/50"
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="font-medium">{area.name}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>
            {hasMoreAreas && (
              <button
                className="w-full py-2 text-sm text-primary hover:underline"
                onClick={() => setShowAllAreas(!showAllAreas)}
              >
                {showAllAreas
                  ? "Show less"
                  : `View all ${homeAreas.length} areas`}
              </button>
            )}
          </div>
        ) : (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Home className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">No home areas yet</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-[280px]">
                Start by adding the rooms and spaces you use most, like Kitchen,
                Living Room, or Garage.
              </p>
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                Add your first area
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Summary Stats */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">At a Glance</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <Link to="/inventory">
            <Card className="h-full transition-all hover:shadow-sm hover:border-primary/50 cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Home Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.totalHomeAreas > 0 ? (
                  <p className="text-2xl font-bold">{stats.totalHomeAreas}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Add areas →</p>
                )}
              </CardContent>
            </Card>
          </Link>

          <Link to="/shopping">
            <Card className="h-full transition-all hover:shadow-sm hover:border-primary/50 cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Shopping List
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.itemsInShoppingList > 0 ? (
                  <p className="text-2xl font-bold">
                    {stats.itemsInShoppingList}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Start list →</p>
                )}
              </CardContent>
            </Card>
          </Link>

          <Link to="/notes">
            <Card className="h-full transition-all hover:shadow-sm hover:border-primary/50 cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.totalNotes > 0 ? (
                  <p className="text-2xl font-bold">{stats.totalNotes}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Add note →</p>
                )}
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
}
