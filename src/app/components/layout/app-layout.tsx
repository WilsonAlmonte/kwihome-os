import { Outlet } from "@tanstack/react-router";
import { BottomNav } from "./bottom-nav";
import { Sidebar } from "./sidebar";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="lg:pl-64">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 flex h-14 items-center border-b bg-background px-4 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              K
            </div>
            <span className="text-lg font-bold">Kwihome</span>
          </div>
        </header>

        {/* Page Content */}
        <div className="pb-20 lg:pb-0">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
