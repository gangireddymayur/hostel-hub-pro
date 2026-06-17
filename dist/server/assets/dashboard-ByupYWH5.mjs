import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, MapPin, ClipboardList, CheckCircle2, XCircle } from "lucide-react";
import { P as PageHeader, A as Avatar, b as AvatarFallback } from "./dashboard-shell-BH4zJocL.mjs";
import { S as StatCard } from "./stat-card-KKnlvaKQ.mjs";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle } from "./card-DPPTUITY.mjs";
import { B as Badge } from "./badge-DBU0TJ0R.mjs";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from "recharts";
import { q as getHostelDashboard, t as getHostelStudents, n as getLeaveRequests, f as getHostels } from "./api-CPIfVdHO.mjs";
import "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "./router-BAHsep70.mjs";
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
  const hostelsQuery = useQuery({
    queryKey: ["active-hostels"],
    queryFn: getHostels
  });
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const students = studentsQuery.data?.data ?? [];
  const leaves = leaveQuery.data?.data ?? [];
  const hostels = hostelsQuery.data?.data ?? [];
  const filteredStudents = useMemo(() => {
    if (selectedBranch === "ALL") return students;
    return students.filter((s) => s.hostel_id === selectedBranch);
  }, [students, selectedBranch]);
  const filteredLeaves = useMemo(() => {
    if (selectedBranch === "ALL") return leaves;
    return leaves.filter((l) => l.hostel_id === selectedBranch);
  }, [leaves, selectedBranch]);
  const outsideStudents = useMemo(() => filteredLeaves.filter((leave) => leave.gatePass?.status === "OUT").length, [filteredLeaves]);
  const pending = useMemo(() => {
    if (selectedBranch === "ALL") {
      return dashboardQuery.data?.data.pendingLeaves ?? leaves.filter((leave) => leave.final_status === "PENDING").length;
    }
    return filteredLeaves.filter((leave) => leave.final_status === "PENDING").length;
  }, [dashboardQuery.data, leaves, filteredLeaves, selectedBranch]);
  const approved = useMemo(() => {
    if (selectedBranch === "ALL") {
      return dashboardQuery.data?.data.approvedLeaves ?? leaves.filter((leave) => leave.final_status === "APPROVED").length;
    }
    return filteredLeaves.filter((leave) => leave.final_status === "APPROVED").length;
  }, [dashboardQuery.data, leaves, filteredLeaves, selectedBranch]);
  const rejected = useMemo(() => {
    return filteredLeaves.filter((leave) => leave.final_status === "REJECTED").length;
  }, [filteredLeaves]);
  const recent = useMemo(() => {
    return [...filteredLeaves].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))).slice(0, 6);
  }, [filteredLeaves]);
  const weeklyLeaves = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, index) => {
      const dayIndex = (index + 1) % 7;
      const dayLeaves = filteredLeaves.filter((leave) => new Date(leave.created_at).getDay() === dayIndex);
      return {
        day,
        requests: dayLeaves.length,
        approved: dayLeaves.filter((leave) => leave.final_status === "APPROVED").length
      };
    });
  }, [filteredLeaves]);
  if (dashboardQuery.isLoading || studentsQuery.isLoading || leaveQuery.isLoading || hostelsQuery.isLoading) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(PageHeader, { title: "Welcome back", description: "Loading live hostel data..." }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-6 text-sm text-muted-foreground", children: "Loading dashboard…" }) })
    ] });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsx(PageHeader, { title: "Welcome back", description: "Here's what's happening at your hostel today." }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 self-start sm:self-center bg-card p-1.5 rounded-lg border border-border shadow-sm", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-muted-foreground px-2", children: "Branch:" }),
        /* @__PURE__ */ jsxs("select", { value: selectedBranch, onChange: (e) => setSelectedBranch(e.target.value), className: "h-8 w-44 rounded-md border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring font-medium", children: [
          /* @__PURE__ */ jsx("option", { value: "ALL", children: "All Branches" }),
          hostels.map((h) => /* @__PURE__ */ jsx("option", { value: h.id, children: h.hostel_name }, h.id))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3 mt-4", children: [
      /* @__PURE__ */ jsx(StatCard, { label: "Total Students", value: filteredStudents.length, icon: Users, tone: "primary" }),
      /* @__PURE__ */ jsx(StatCard, { label: "Students Outside", value: outsideStudents, icon: MapPin, tone: "warning" }),
      /* @__PURE__ */ jsx(StatCard, { label: "Pending Permissions", value: pending, icon: ClipboardList, tone: "warning" }),
      /* @__PURE__ */ jsx(StatCard, { label: "Approved Permissions", value: approved, icon: CheckCircle2, tone: "success" }),
      /* @__PURE__ */ jsx(StatCard, { label: "Rejected Permissions", value: rejected, icon: XCircle, tone: "destructive" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 grid gap-4 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxs(Card, { className: "lg:col-span-2", children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "This week's permission activity" }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "h-72", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: weeklyLeaves, margin: {
          top: 10,
          right: 10,
          left: -20,
          bottom: 0
        }, children: [
          /* @__PURE__ */ jsxs("defs", { children: [
            /* @__PURE__ */ jsxs("linearGradient", { id: "requestsGradient", x1: "0", y1: "0", x2: "0", y2: "1", children: [
              /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "var(--color-primary)", stopOpacity: 0.95 }),
              /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "var(--color-primary)", stopOpacity: 0.25 })
            ] }),
            /* @__PURE__ */ jsxs("linearGradient", { id: "approvedGradient", x1: "0", y1: "0", x2: "0", y2: "1", children: [
              /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "var(--color-success)", stopOpacity: 0.95 }),
              /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "var(--color-success)", stopOpacity: 0.25 })
            ] })
          ] }),
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--color-border)", vertical: false, opacity: 0.3 }),
          /* @__PURE__ */ jsx(XAxis, { dataKey: "day", stroke: "var(--color-muted-foreground)", fontSize: 12, tickLine: false, axisLine: false, dy: 8 }),
          /* @__PURE__ */ jsx(YAxis, { stroke: "var(--color-muted-foreground)", fontSize: 12, allowDecimals: false, tickLine: false, axisLine: false, dx: -8 }),
          /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
            background: "rgba(15, 23, 42, 0.85)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 12,
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)"
          }, itemStyle: {
            color: "#f8fafc"
          }, labelStyle: {
            color: "#94a3b8",
            fontWeight: "bold"
          } }),
          /* @__PURE__ */ jsx(Legend, { wrapperStyle: {
            fontSize: 12,
            paddingTop: 12
          }, iconType: "circle", iconSize: 8 }),
          /* @__PURE__ */ jsx(Bar, { dataKey: "requests", fill: "url(#requestsGradient)", radius: [6, 6, 0, 0], maxBarSize: 32 }),
          /* @__PURE__ */ jsx(Bar, { dataKey: "approved", fill: "url(#approvedGradient)", radius: [6, 6, 0, 0], maxBarSize: 32 })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Recent permission requests" }) }),
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
