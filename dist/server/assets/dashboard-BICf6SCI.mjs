import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, BedDouble, MapPin, ClipboardList, CheckCircle2, XCircle } from "lucide-react";
import { P as PageHeader, A as Avatar, a as AvatarFallback } from "./dashboard-shell-BZByfYMg.mjs";
import { S as StatCard } from "./stat-card-Cp49rroQ.mjs";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle } from "./card-MINwparf.mjs";
import { B as Badge } from "./badge-Did-A1Bn.mjs";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from "recharts";
import { k as getHostelDashboard, h as getHostelStudents, j as getLeaveRequests } from "./api-BIeB_esJ.mjs";
import "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "./router-DTxMphCY.mjs";
import "@radix-ui/react-avatar";
import "sonner";
import "clsx";
import "tailwind-merge";
function AdminDashboard() {
  const dashboardQuery = useQuery({
    queryKey: ["hostel-dashboard"],
    queryFn: getHostelDashboard
  });
  const studentsQuery = useQuery({
    queryKey: ["hostel-students"],
    queryFn: getHostelStudents
  });
  const leaveQuery = useQuery({
    queryKey: ["hostel-leaves"],
    queryFn: getLeaveRequests
  });
  const students = studentsQuery.data?.data ?? [];
  const leaves = leaveQuery.data?.data ?? [];
  const rooms = useMemo(() => {
    return new Set(students.map((student) => student.room_number)).size;
  }, [students]);
  const outsideStudents = useMemo(() => leaves.filter((leave) => leave.gatePass?.status === "OUT" || leave.final_status === "APPROVED").length, [leaves]);
  const pending = dashboardQuery.data?.data.pendingLeaves ?? leaves.filter((leave) => leave.final_status === "PENDING").length;
  const approved = dashboardQuery.data?.data.approvedLeaves ?? leaves.filter((leave) => leave.final_status === "APPROVED").length;
  const rejected = leaves.filter((leave) => leave.final_status === "REJECTED").length;
  const recent = [...leaves].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))).slice(0, 6);
  const weeklyLeaves = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, index) => {
      const dayIndex = (index + 1) % 7;
      const dayLeaves = leaves.filter((leave) => new Date(leave.created_at).getDay() === dayIndex);
      return {
        day,
        requests: dayLeaves.length,
        approved: dayLeaves.filter((leave) => leave.final_status === "APPROVED").length
      };
    });
  }, [leaves]);
  if (dashboardQuery.isLoading || studentsQuery.isLoading || leaveQuery.isLoading) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(PageHeader, { title: "Welcome back", description: "Loading live hostel data..." }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-6 text-sm text-muted-foreground", children: "Loading dashboard…" }) })
    ] });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Welcome back", description: "Here's what's happening at your hostel today." }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3", children: [
      /* @__PURE__ */ jsx(StatCard, { label: "Total Students", value: students.length, icon: Users, tone: "primary" }),
      /* @__PURE__ */ jsx(StatCard, { label: "Total Rooms", value: rooms, icon: BedDouble, tone: "info" }),
      /* @__PURE__ */ jsx(StatCard, { label: "Students Outside", value: outsideStudents, icon: MapPin, tone: "warning" }),
      /* @__PURE__ */ jsx(StatCard, { label: "Pending Leaves", value: pending, icon: ClipboardList, tone: "warning" }),
      /* @__PURE__ */ jsx(StatCard, { label: "Approved Leaves", value: approved, icon: CheckCircle2, tone: "success" }),
      /* @__PURE__ */ jsx(StatCard, { label: "Rejected Leaves", value: rejected, icon: XCircle, tone: "destructive" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 grid gap-4 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxs(Card, { className: "lg:col-span-2", children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "This week's leave activity" }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "h-72", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: weeklyLeaves, children: [
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--color-border)" }),
          /* @__PURE__ */ jsx(XAxis, { dataKey: "day", stroke: "var(--color-muted-foreground)", fontSize: 12 }),
          /* @__PURE__ */ jsx(YAxis, { stroke: "var(--color-muted-foreground)", fontSize: 12 }),
          /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
            background: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: 8
          } }),
          /* @__PURE__ */ jsx(Legend, { wrapperStyle: {
            fontSize: 12
          } }),
          /* @__PURE__ */ jsx(Bar, { dataKey: "requests", fill: "var(--color-primary)", radius: [4, 4, 0, 0] }),
          /* @__PURE__ */ jsx(Bar, { dataKey: "approved", fill: "var(--color-success)", radius: [4, 4, 0, 0] })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Recent leave requests" }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "space-y-3", children: recent.map((leave) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(Avatar, { className: "h-9 w-9", children: /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-accent text-accent-foreground text-xs", children: leave.student.name.split(" ").map((part) => part[0]).slice(0, 2).join("") }) }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsx("p", { className: "truncate text-sm font-medium", children: leave.student.name }),
            /* @__PURE__ */ jsx("p", { className: "truncate text-xs text-muted-foreground", children: leave.reason })
          ] }),
          /* @__PURE__ */ jsx(StatusBadge, { status: leave.final_status.toLowerCase() })
        ] }, leave.id)) })
      ] })
    ] })
  ] });
}
function StatusBadge({
  status
}) {
  const cls = status === "approved" ? "bg-success text-success-foreground hover:bg-success" : status === "rejected" ? "bg-destructive text-destructive-foreground hover:bg-destructive" : "bg-warning/20 text-warning-foreground dark:text-warning hover:bg-warning/20";
  return /* @__PURE__ */ jsx(Badge, { className: `capitalize ${cls}`, children: status });
}
export {
  AdminDashboard as component
};
