import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { Building2, CheckCircle2, GraduationCap, ClipboardList } from "lucide-react";
import { P as PageHeader } from "./dashboard-shell-DfEZsquD.mjs";
import { S as StatCard } from "./stat-card-D0DrHTiO.mjs";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle } from "./card-CDkRrTmX.mjs";
import { B as Badge } from "./badge-CFVi65j-.mjs";
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, BarChart, Legend, Bar } from "recharts";
import { d as getSuperAnalytics, g as getSuperHostels } from "./api-BTEkYdFk.mjs";
import "@tanstack/react-router";
import "react";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "./router-DQmVXjKE.mjs";
import "@radix-ui/react-avatar";
import "sonner";
import "clsx";
import "tailwind-merge";
function SuperDashboard() {
  const analyticsQuery = useQuery({
    queryKey: ["super-analytics"],
    queryFn: getSuperAnalytics
  });
  const hostelsQuery = useQuery({
    queryKey: ["super-hostels"],
    queryFn: getSuperHostels
  });
  const analytics = analyticsQuery.data?.data;
  const hostels = hostelsQuery.data?.data ?? [];
  if (analyticsQuery.isLoading || hostelsQuery.isLoading) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(PageHeader, { title: "Platform overview", description: "Loading live data from the backend..." }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-6 text-sm text-muted-foreground", children: "Loading dashboard…" }) })
    ] });
  }
  const totalHostels = analytics?.hostels ?? hostels.length;
  const activeHostels = hostels.filter((hostel) => hostel.status === "ACTIVE").length;
  const totalStudents = analytics?.students ?? 0;
  const totalLeaves = analytics?.leaveRequests ?? 0;
  const recentHostels = [...hostels].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))).slice(0, 5);
  const monthlyGrowth = analytics?.monthlyGrowth ?? [];
  const weeklyLeaves = analytics?.weeklyLeaves ?? [];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Platform overview", description: "Real-time view of hostels, students and permission activity across the network." }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [
      /* @__PURE__ */ jsx(StatCard, { label: "Total Hostels", value: totalHostels, icon: Building2, tone: "primary", trend: "+ live" }),
      /* @__PURE__ */ jsx(StatCard, { label: "Active Hostels", value: activeHostels, icon: CheckCircle2, tone: "success", hint: `${totalHostels - activeHostels} disabled` }),
      /* @__PURE__ */ jsx(StatCard, { label: "Total Students", value: totalStudents.toLocaleString(), icon: GraduationCap, tone: "info" }),
      /* @__PURE__ */ jsx(StatCard, { label: "Permission Requests", value: totalLeaves.toLocaleString(), icon: ClipboardList, tone: "warning", hint: "Across all hostels" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 grid gap-4 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxs(Card, { className: "lg:col-span-2", children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Platform growth" }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "h-72", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(AreaChart, { data: monthlyGrowth, children: [
          /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "gs", x1: "0", y1: "0", x2: "0", y2: "1", children: [
            /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "var(--color-primary)", stopOpacity: 0.45 }),
            /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "var(--color-primary)", stopOpacity: 0 })
          ] }) }),
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--color-border)" }),
          /* @__PURE__ */ jsx(XAxis, { dataKey: "month", stroke: "var(--color-muted-foreground)", fontSize: 12 }),
          /* @__PURE__ */ jsx(YAxis, { stroke: "var(--color-muted-foreground)", fontSize: 12 }),
          /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
            background: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: 8
          } }),
          /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "students", stroke: "var(--color-primary)", fill: "url(#gs)", strokeWidth: 2 })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Permission activity" }) }),
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
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "mt-6", children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Recently added hostels" }) }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "divide-y divide-border/60", children: recentHostels.map((hostel) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4 py-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "truncate font-medium", children: hostel.hostel_name }),
          /* @__PURE__ */ jsx("p", { className: "truncate text-xs text-muted-foreground", children: hostel.email })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "hidden text-right text-xs text-muted-foreground sm:block", children: [
          /* @__PURE__ */ jsxs("p", { children: [
            hostel._count?.students ?? 0,
            " students"
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            hostel._count?.staff ?? 0,
            " staff"
          ] })
        ] }),
        /* @__PURE__ */ jsx(Badge, { variant: hostel.status === "ACTIVE" ? "default" : "secondary", className: hostel.status === "ACTIVE" ? "bg-success text-success-foreground hover:bg-success" : "", children: hostel.status.toLowerCase() })
      ] }, hostel.id)) }) })
    ] })
  ] });
}
export {
  SuperDashboard as component
};
