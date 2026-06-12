import { Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSession, initTheme, type Role } from "@/lib/role";
import { Toaster } from "@/components/ui/sonner";

export function DashboardShell({ expectedRole, children }: { expectedRole: Role; children?: ReactNode }) {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initTheme();
    const session = getSession();
    if (!session) {
      navigate({ to: "/login" });
      return;
    }
    const r = session.profile.role === "SUPER_ADMIN" ? "super" : "admin";
    if (r !== expectedRole) {
      navigate({ to: "/login" });
      return;
    }
    setReady(true);
  }, [expectedRole, navigate]);

  if (!ready) return null;

  return (
    <SidebarProvider>
      <AppSidebar role={expectedRole} />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur">
          <SidebarTrigger />
          <div className="relative hidden flex-1 max-w-md md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search…" className="h-9 pl-9" />
          </div>
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-4 w-4" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {expectedRole === "super" ? "SA" : "HA"}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children ?? <Outlet />}</main>
        <Toaster richColors position="top-right" />
      </SidebarInset>
    </SidebarProvider>
  );
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
