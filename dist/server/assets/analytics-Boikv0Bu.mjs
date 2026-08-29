import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { P as PageHeader } from "./dashboard-shell-C0Hk8nU9.mjs";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./card-Box4fE8c.mjs";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, PieChart, Pie, Cell, Legend } from "recharts";
import { d as getSuperAnalytics, g as getSuperHostels } from "./api-CtgfTzSB.mjs";
import "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "lucide-react";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "./router-BKnKXYaw.mjs";
import "@radix-ui/react-avatar";
import "sonner";
import "clsx";
import "tailwind-merge";
const COLORS = ["var(--color-primary)", "var(--color-success)", "var(--color-warning)", "var(--color-info)", "var(--color-chart-5)"];
function Analytics() {
  const analyticsQuery = useQuery({
    queryKey: ["super-analytics"],
    queryFn: getSuperAnalytics
  });
  const hostelsQuery = useQuery({
    queryKey: ["super-hostels"],
    queryFn: getSuperHostels
  });
  const hostels = hostelsQuery.data?.data ?? [];
  const analytics = analyticsQuery.data?.data;
  const subData = useMemo(() => ["ACTIVE", "DISABLED"].map((status) => ({
    name: status.toLowerCase(),
    value: hostels.filter((hostel) => hostel.status === status).length
  })), [hostels]);
  const growthData = analytics?.monthlyGrowth ?? [];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Analytics", description: "Platform-level insights and growth trends." }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxs(Card, { className: "lg:col-span-2", children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Hostels onboarded" }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "h-80", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(LineChart, { data: growthData, children: [
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--color-border)" }),
          /* @__PURE__ */ jsx(XAxis, { dataKey: "month", stroke: "var(--color-muted-foreground)", fontSize: 12 }),
          /* @__PURE__ */ jsx(YAxis, { stroke: "var(--color-muted-foreground)", fontSize: 12 }),
          /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
            background: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: 8
          } }),
          /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "hostels", stroke: "var(--color-primary)", strokeWidth: 2.5, dot: {
            r: 4
          } })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Hostel status" }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "h-80", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(PieChart, { children: [
          /* @__PURE__ */ jsx(Pie, { data: subData, dataKey: "value", nameKey: "name", innerRadius: 50, outerRadius: 90, paddingAngle: 4, children: subData.map((_, index) => /* @__PURE__ */ jsx(Cell, { fill: COLORS[index % COLORS.length] }, index)) }),
          /* @__PURE__ */ jsx(Legend, { wrapperStyle: {
            fontSize: 12
          } }),
          /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
            background: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: 8
          } })
        ] }) }) })
      ] })
    ] })
  ] });
}
export {
  Analytics as component
};
