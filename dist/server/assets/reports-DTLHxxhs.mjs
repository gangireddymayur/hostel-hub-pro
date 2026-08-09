import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileBarChart, Download } from "lucide-react";
import { P as PageHeader } from "./dashboard-shell-DtTptcPv.mjs";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./card-DxHPcdZJ.mjs";
import { m as getHostelReports, n as getLeaveRequests, B as Button } from "./api-YmtQUnZt.mjs";
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area } from "recharts";
import { toast } from "sonner";
import "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "./router-BqHRIsiQ.mjs";
import "@radix-ui/react-avatar";
import "clsx";
import "tailwind-merge";
const items = [{
  title: "Daily Permission Report",
  desc: "Permissions approved/rejected today."
}, {
  title: "Monthly Permission Report",
  desc: "Aggregated permission activity for the month."
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
  const handleExport = (title) => {
    const downloadCsv = (filename, headers, rows) => {
      const content = [headers.join(","), ...rows.map((row) => row.map((val) => {
        const strVal = String(val ?? "");
        return `"${strVal.replaceAll('"', '""')}"`;
      }).join(","))].join("\n");
      const blob = new Blob([content], {
        type: "text/csv;charset=utf-8;"
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    if (title === "Daily Permission Report") {
      const dailyLeaves = leaves.filter((l) => l.created_at && l.created_at.slice(0, 10) === todayStr);
      const headers = ["Student Name", "Student ID", "Room", "Reason", "From Date", "To Date", "Final Status", "Created At"];
      const dataRows = dailyLeaves.map((l) => [l.student?.name ?? "", l.student?.student_id ?? "", l.student?.room_number ?? "", l.reason ?? "", l.from_date ?? "", l.to_date ?? "", l.final_status ?? "", l.created_at ?? ""]);
      downloadCsv(`daily_permission_report_${todayStr}.csv`, headers, dataRows);
      toast.success("Daily Permission Report exported");
    } else if (title === "Monthly Permission Report") {
      const currentMonthStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
      const monthlyLeaves = leaves.filter((l) => l.created_at && l.created_at.slice(0, 7) === currentMonthStr);
      const headers = ["Student Name", "Student ID", "Room", "Reason", "From Date", "To Date", "Final Status", "Created At"];
      const dataRows = monthlyLeaves.map((l) => [l.student?.name ?? "", l.student?.student_id ?? "", l.student?.room_number ?? "", l.reason ?? "", l.from_date ?? "", l.to_date ?? "", l.final_status ?? "", l.created_at ?? ""]);
      downloadCsv(`monthly_permission_report_${currentMonthStr}.csv`, headers, dataRows);
      toast.success("Monthly Permission Report exported");
    } else if (title === "Students Outside Report") {
      const outsideLeaves = leaves.filter((l) => l.gatePass?.status === "OUT");
      const headers = ["Student Name", "Student ID", "Room", "Out Time Actual", "Expected Return", "Student Lat", "Student Lng", "Exit Guard Lat", "Exit Guard Lng"];
      const dataRows = outsideLeaves.map((l) => [l.student?.name ?? "", l.student?.student_id ?? "", l.student?.room_number ?? "", l.gatePass?.out_time_actual ?? "", l.return_time ?? "", String(l.student_lat ?? ""), String(l.student_lng ?? ""), String(l.gatePass?.out_guard_lat ?? ""), String(l.gatePass?.out_guard_lng ?? "")]);
      downloadCsv("students_currently_outside.csv", headers, dataRows);
      toast.success("Students Outside Report exported");
    } else if (title === "Student Exit History") {
      const exitLeaves = leaves.filter((l) => l.gatePass?.out_time_actual);
      const headers = ["Student Name", "Student ID", "Room", "Out Time Actual", "Student Lat", "Student Lng", "Exit Guard Lat", "Exit Guard Lng"];
      const dataRows = exitLeaves.map((l) => [l.student?.name ?? "", l.student?.student_id ?? "", l.student?.room_number ?? "", l.gatePass?.out_time_actual ?? "", String(l.student_lat ?? ""), String(l.student_lng ?? ""), String(l.gatePass?.out_guard_lat ?? ""), String(l.gatePass?.out_guard_lng ?? "")]);
      downloadCsv("student_exit_history.csv", headers, dataRows);
      toast.success("Student Exit History exported");
    } else if (title === "Student Return History") {
      const returnLeaves = leaves.filter((l) => l.gatePass?.in_time_actual);
      const headers = ["Student Name", "Student ID", "Room", "Out Time Actual", "In Time Actual", "Student Lat", "Student Lng", "Exit Guard Lat", "Exit Guard Lng", "Entry Guard Lat", "Entry Guard Lng"];
      const dataRows = returnLeaves.map((l) => [l.student?.name ?? "", l.student?.student_id ?? "", l.student?.room_number ?? "", l.gatePass?.out_time_actual ?? "", l.gatePass?.in_time_actual ?? "", String(l.student_lat ?? ""), String(l.student_lng ?? ""), String(l.gatePass?.out_guard_lat ?? ""), String(l.gatePass?.out_guard_lng ?? ""), String(l.gatePass?.in_guard_lat ?? ""), String(l.gatePass?.in_guard_lng ?? "")]);
      downloadCsv("student_return_history.csv", headers, dataRows);
      toast.success("Student Return History exported");
    } else {
      toast.error("Unknown report type");
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Reports", description: "Download operational reports for compliance and reviews." }),
    /* @__PURE__ */ jsxs(Card, { className: "mb-6", children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Permission volume - last 7 days" }) }),
      /* @__PURE__ */ jsx(CardContent, { className: "h-64", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(AreaChart, { data: chartData, margin: {
        top: 10,
        right: 10,
        left: -20,
        bottom: 0
      }, children: [
        /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "g2", x1: "0", y1: "0", x2: "0", y2: "1", children: [
          /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "var(--color-success)", stopOpacity: 0.45 }),
          /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "var(--color-success)", stopOpacity: 0.01 })
        ] }) }),
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
        /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "approved", stroke: "var(--color-success)", fill: "url(#g2)", strokeWidth: 2 })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: items.map((item) => /* @__PURE__ */ jsx(Card, { className: "transition hover:shadow-md", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
      /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(FileBarChart, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx("h3", { className: "mt-3 text-base font-semibold", children: item.title }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: item.desc }),
      /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "mt-4", onClick: () => handleExport(item.title), children: [
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
