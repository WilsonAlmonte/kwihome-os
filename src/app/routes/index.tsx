import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Package,
  ShoppingCart,
  CheckSquare,
  FileText,
  MapPin,
  Plus,
  ChevronRight,
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
  const homeAreas = await repos.homeareas.findAll();
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
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    to: "/shopping",
    icon: ShoppingCart,
    label: "Shopping",
    description: "Manage shopping lists",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    to: "/tasks",
    icon: CheckSquare,
    label: "Tasks",
    description: "Household to-dos",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    to: "/notes",
    icon: FileText,
    label: "Notes",
    description: "Important information",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
] as const;

function HomePage() {
  const { homeAreas, stats } = Route.useLoaderData();

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Welcome Section */}
      <section>
        <h1 className="text-2xl font-bold md:text-3xl">Welcome Home</h1>
        <p className="text-muted-foreground mt-1">
          Manage your household with ease
        </p>
      </section>

      {/* Quick Access Grid */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {quickAccessItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to} className="group">
                <Card className="h-full transition-all hover:shadow-md active:scale-[0.98] group-hover:border-primary/50">
                  <CardContent className="p-4">
                    <div
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${item.bgColor} mb-3`}
                    >
                      <Icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <h3 className="font-semibold">{item.label}</h3>
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
          <h2 className="text-lg font-semibold">Home Areas</h2>
          <Button variant="ghost" size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Area</span>
          </Button>
        </div>

        {homeAreas.length > 0 ? (
          <div className="grid gap-2">
            {homeAreas.map((area) => (
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
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <MapPin className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground mb-3">No areas created yet</p>
              <Button variant="outline" size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Create your first area
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Summary Stats */}
      <section>
        <h2 className="text-lg font-semibold mb-4">At a Glance</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalHomeAreas}</p>
              <p className="text-xs text-muted-foreground">
                areas in your home
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Out of Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.outOfStockItems}</p>
              <p className="text-xs text-muted-foreground">
                items need restocking
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.pendingTasks}</p>
              <p className="text-xs text-muted-foreground">pending todos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Shopping Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.itemsInShoppingList}</p>
              <p className="text-xs text-muted-foreground">in current list</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalNotes}</p>
              <p className="text-xs text-muted-foreground">household notes</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
