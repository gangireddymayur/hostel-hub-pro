import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Building2, BarChart3, Settings, Users, BedDouble,
  UserCog, ShieldCheck, ClipboardList, LogOut, FileSpreadsheet, MapPin,
  CheckCircle2, FileBarChart, GraduationCap,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar";
import { clearSession, type Role } from "@/lib/role";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

const superNav = [
  { to: "/super/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/super/hostels", label: "Hostel Management", icon: Building2 },
  { to: "/super/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/super/settings", label: "Settings", icon: Settings },
];

const adminNav = [
  { group: "Overview", items: [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ]},
  { group: "Management", items: [
    { to: "/admin/students", label: "Students", icon: Users },
    { to: "/admin/students/import", label: "Import Students", icon: FileSpreadsheet },
    { to: "/admin/hostels", label: "Hostels", icon: Building2 },
    { to: "/admin/staff", label: "Staff", icon: UserCog },
  ]},
  { group: "Permissions", items: [
    { to: "/admin/leaves", label: "Permission Requests", icon: ClipboardList },
    { to: "/admin/tracking/outside", label: "Students Outside", icon: MapPin },
    { to: "/admin/tracking/returned", label: "Students Returned", icon: CheckCircle2 },
  ]},
  { group: "Insights", items: [
    { to: "/admin/reports", label: "Reports", icon: FileBarChart },
    { to: "/admin/settings", label: "Settings", icon: Settings },
  ]},
];

export function AppSidebar({ role }: { role: Role }) {
  const path = useRouterState({ select: s => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isActive = (to: string) => path === to || path.startsWith(to + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-semibold">HostelOS</span>
            <span className="truncate text-xs text-muted-foreground">
              {role === "super" ? "Super Admin" : "Hostel Admin"}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {role === "super" ? (
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {superNav.map(i => (
                  <SidebarMenuItem key={i.to}>
                    <SidebarMenuButton asChild isActive={isActive(i.to)} tooltip={i.label}>
                      <Link to={i.to}><i.icon /><span>{i.label}</span></Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          adminNav.map(g => (
            <SidebarGroup key={g.group}>
              <SidebarGroupLabel>{g.group}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {g.items.map(i => (
                    <SidebarMenuItem key={i.to}>
                      <SidebarMenuButton asChild isActive={isActive(i.to)} tooltip={i.label}>
                        <Link to={i.to}><i.icon /><span>{i.label}</span></Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          className="justify-start gap-2"
          onClick={async () => {
            await logout();
            queryClient.clear();
            clearSession();
            navigate({ to: "/login" });
          }}
        >
          <LogOut className="h-4 w-4" />
          <span className="group-data-[collapsible=icon]:hidden">Sign out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
