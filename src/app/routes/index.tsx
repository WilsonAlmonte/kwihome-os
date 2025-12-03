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
  Trash2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@app/components/ui/card";
import { Button } from "@app/components/ui/button";
import { homeAreasQueryOptions } from "../features/home-areas/home-areas.query";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  useHomeAreaCreation,
  useHomeAreaUpdate,
  useHomeAreaDeletion,
} from "../features/home-areas/home-areas.hooks";
import { ResponsiveDialog } from "@app/components/ui/responsive-dialog";
import { Swipeable } from "@app/components/ui/swipeable";
import { HomeAreaForm } from "@app/components/forms";
import { toast } from "sonner";
import { HomeArea } from "@repo/features/home-areas/home-area.entity";
import { dashboardDataQueryOptions } from "../features/dashboard/dashboard.query";
import { useMediaQuery } from "../hooks/use-media-query";

export const Route = createFileRoute("/")({
  component: HomePage,
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(dashboardDataQueryOptions());
    await context.queryClient.ensureQueryData(homeAreasQueryOptions());
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
  const createHomeArea = useHomeAreaCreation();
  const updateHomeArea = useHomeAreaUpdate();
  const deleteHomeArea = useHomeAreaDeletion();
  const { data: homeAreas } = useSuspenseQuery(homeAreasQueryOptions());
  const { data: stats } = useSuspenseQuery(dashboardDataQueryOptions());
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const [showAllAreas, setShowAllAreas] = useState(false);
  const [addDialogProps, setAddDialogProps] = useState<{
    isOpen: boolean;
    initialData?: HomeArea;
  }>({
    isOpen: false,
  });
  const [deleteDialogProps, setDeleteDialogProps] = useState<{
    isOpen: boolean;
    area?: HomeArea;
  }>({
    isOpen: false,
  });

  const handleHomeAreaSubmit = async (data: { name: string }) => {
    try {
      if (addDialogProps.initialData) {
        await updateHomeArea.mutateAsync({
          id: addDialogProps.initialData.id,
          name: data.name,
        });
        toast.success("Home area updated", {
          description: `${data.name} has been updated.`,
        });
      } else {
        await createHomeArea.mutateAsync(data.name);
        toast.success("Home area created", {
          description: `${data.name} has been added to your home areas.`,
        });
      }
      setAddDialogProps({ isOpen: false, initialData: undefined });
    } catch (error) {
      toast.error("Failed to create home area", {
        description:
          "Please try again or contact support if the problem persists.",
      });
    }
  };

  const handleHomeAreaDelete = async () => {
    if (!deleteDialogProps.area) return;

    try {
      await deleteHomeArea.mutateAsync(deleteDialogProps.area.id);
      toast.success("Home area deleted", {
        description: `${deleteDialogProps.area.name} has been removed.`,
      });
      setDeleteDialogProps({ isOpen: false, area: undefined });
    } catch (error) {
      toast.error("Failed to delete home area", {
        description:
          "Please try again or contact support if the problem persists.",
      });
    }
  };

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

      {/* Add Home Area Dialog */}
      <ResponsiveDialog
        open={addDialogProps.isOpen}
        onOpenChange={(open) => setAddDialogProps({ isOpen: open })}
        title={addDialogProps.initialData ? "Edit Home Area" : "Add Home Area"}
        description="Manage the rooms and spaces in your home."
      >
        <HomeAreaForm
          initialData={addDialogProps.initialData}
          onSubmit={handleHomeAreaSubmit}
          onCancel={() =>
            setAddDialogProps({ isOpen: false, initialData: undefined })
          }
          isSubmitting={createHomeArea.isPending || updateHomeArea.isPending}
        />
      </ResponsiveDialog>

      {/* Delete Confirmation Dialog */}
      <ResponsiveDialog
        open={deleteDialogProps.isOpen}
        onOpenChange={(open) => setDeleteDialogProps({ isOpen: open })}
        title="Delete Home Area"
        description={`Are you sure you want to delete "${deleteDialogProps.area?.name}"? This action cannot be undone.`}
      >
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() =>
              setDeleteDialogProps({ isOpen: false, area: undefined })
            }
            disabled={deleteHomeArea.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleHomeAreaDelete}
            disabled={deleteHomeArea.isPending}
          >
            {deleteHomeArea.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </ResponsiveDialog>

      {/* Summary Stats */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">At a Glance</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <Card
            role="button"
            onClick={
              stats.totalHomeAreas === 0
                ? () => setAddDialogProps({ isOpen: true })
                : () => {}
            }
            className="h-full transition-all hover:shadow-sm hover:border-primary/50 cursor-pointer"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Home Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.totalHomeAreas > 0 ? (
                <p className="text-2xl font-bold">{stats.totalHomeAreas}</p>
              ) : (
                <a className="text-sm text-muted-foreground">Add areas →</a>
              )}
            </CardContent>
          </Card>

          <Link to="/shopping">
            <Card className="h-full transition-all hover:shadow-sm hover:border-primary/50 cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Shopping List items
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
            <Button
              variant="ghost"
              size="sm"
              className="gap-1"
              onClick={() => setAddDialogProps({ isOpen: true })}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Area</span>
            </Button>
          )}
        </div>

        {homeAreas.length > 0 ? (
          <div className="space-y-2">
            <div className="grid gap-2">
              {visibleAreas.map((area) => {
                const cardContent = (
                  <Card className="transition-all hover:shadow-sm hover:border-primary/50">
                    <CardContent className="flex items-center justify-between p-4">
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          setAddDialogProps({
                            isOpen: true,
                            initialData: { ...area },
                          })
                        }
                        className="flex items-center gap-3 flex-1 cursor-pointer"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="font-medium">{area.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {!isMobile && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteDialogProps({ isOpen: true, area });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                );

                return isMobile ? (
                  <Swipeable
                    key={area.id}
                    onSwipeLeft={() =>
                      setDeleteDialogProps({ isOpen: true, area })
                    }
                    leftAction={
                      <div className="w-full h-full bg-destructive flex items-center justify-center rounded-xl">
                        <Trash2 className="h-5 w-5 text-destructive-foreground" />
                      </div>
                    }
                  >
                    {cardContent}
                  </Swipeable>
                ) : (
                  <div key={area.id}>{cardContent}</div>
                );
              })}
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
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => setAddDialogProps({ isOpen: true })}
              >
                <Plus className="h-4 w-4" />
                Add your first area
              </Button>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
