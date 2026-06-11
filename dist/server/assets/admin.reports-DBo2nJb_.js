import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileBarChart, Download } from "lucide-react";
import { P as PageHeader } from "./dashboard-shell-Bacq0_L5.js";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./card-B2FR12yV.js";
import { o as getHostelReports, p as getLeaveRequests, B as Button } from "./api-Do8Q2seI.js";
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area } from "recharts";
import { toast } from "sonner";
import "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "@radix-ui/react-avatar";
import "clsx";
import "tailwind-merge";
const items = [{
  title: "Daily Leave Report",
  desc: "Leaves approved/rejected today."
}, {
  title: "Monthly Leave Report",
  desc: "Aggregated leave activity for the month."
}, {
  title: "Students Outside Report",
  desc: "Students currently outside the hostel."
}, {
  title: "Student Exit History",
  desc: "Historical exit events with timestamps."
}, {
  title: "Student Return History",
  desc: "Historical return events with timestamps."
}];
function Reports() {
  const reportsQuery = useQuery({
    queryKey: ["hostel-reports"],
    queryFn: getHostelReports
  });
  const leavesQuery = useQuery({
    queryKey: ["hostel-leaves"],
    queryFn: getLeaveRequests
  });
  const leaves = leavesQuery.data?.data ?? [];
  const chartData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, index) => {
      const dayIndex = (index + 1) % 7;
      const dayLeaves = leaves.filter((leave) => new Date(leave.created_at).getDay() === dayIndex);
      return {
        day,
        approved: dayLeaves.filter((leave) => leave.final_status === "APPROVED").length
      };
    });
  }, [leaves]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Reports", description: "Download operational reports for compliance and reviews." }),
    /* @__PURE__ */ jsxs(Card, { className: "mb-6", children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Leave volume - last 7 days" }) }),
      /* @__PURE__ */ jsx(CardContent, { className: "h-64", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(AreaChart, { data: chartData, children: [
        /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "g2", x1: "0", y1: "0", x2: "0", y2: "1", children: [
          /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "var(--color-success)", stopOpacity: 0.4 }),
          /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "var(--color-success)", stopOpacity: 0 })
        ] }) }),
        /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--color-border)" }),
        /* @__PURE__ */ jsx(XAxis, { dataKey: "day", stroke: "var(--color-muted-foreground)", fontSize: 12 }),
        /* @__PURE__ */ jsx(YAxis, { stroke: "var(--color-muted-foreground)", fontSize: 12 }),
        /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
          background: "var(--color-popover)",
          border: "1px solid var(--color-border)",
          borderRadius: 8
        } }),
        /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "approved", stroke: "var(--color-success)", fill: "url(#g2)", strokeWidth: 2 })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: items.map((item) => /* @__PURE__ */ jsx(Card, { className: "transition hover:shadow-md", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
      /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(FileBarChart, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx("h3", { className: "mt-3 text-base font-semibold", children: item.title }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: item.desc }),
      /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "mt-4", onClick: () => toast.success(`${item.title} exported`), children: [
        /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
        " Export CSV"
      ] })
    ] }) }, item.title)) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5", children: [
      /* @__PURE__ */ jsx(Stat, { label: "Total requests", value: reportsQuery.data?.data.totalRequests ?? 0 }),
      /* @__PURE__ */ jsx(Stat, { label: "Approved", value: reportsQuery.data?.data.approved ?? 0 }),
      /* @__PURE__ */ jsx(Stat, { label: "Rejected", value: reportsQuery.data?.data.rejected ?? 0 }),
      /* @__PURE__ */ jsx(Stat, { label: "Returned", value: reportsQuery.data?.data.returned ?? 0 }),
      /* @__PURE__ */ jsx(Stat, { label: "Gate passes", value: reportsQuery.data?.data.gatePasses ?? 0 })
    ] })
  ] });
}
function Stat({
  label,
  value
}) {
  return /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
    /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-2xl font-semibold", children: value })
  ] }) });
}
export {
  Reports as component
};
