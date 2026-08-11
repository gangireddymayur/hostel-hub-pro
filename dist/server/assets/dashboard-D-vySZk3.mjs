import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, MapPin, ClipboardList, CheckCircle2, XCircle } from "lucide-react";
import { P as PageHeader, A as Avatar, b as AvatarFallback } from "./dashboard-shell-BwyRuoJO.mjs";
import { S as StatCard } from "./stat-card-BIz4eYxQ.mjs";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle } from "./card-CGu0YnWZ.mjs";
import { B as Badge } from "./badge-C6IXJ7eQ.mjs";
import { q as getHostelDashboard, t as getHostelStudents, n as getLeaveRequests, f as getHostels, B as Button } from "./api-IwPjIbYU.mjs";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from "recharts";
import "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "./router-B1SINeXp.mjs";
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
  const [timeRange, setTimeRange] = useState("week");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [outsideSearch, setOutsideSearch] = useState("");
  const [outsideTimeFilter, setOutsideTimeFilter] = useState("24h");
  const [outsideCustomFrom, setOutsideCustomFrom] = useState("");
  const [outsideCustomTo, setOutsideCustomTo] = useState("");
  const [reviewedFilter, setReviewedFilter] = useState("ALL");
  const [reviewedTimeFilter, setReviewedTimeFilter] = useState("24h");
  const [reviewedCustomFrom, setReviewedCustomFrom] = useState("");
  const [reviewedCustomTo, setReviewedCustomTo] = useState("");
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
  const chartData = useMemo(() => {
    const now = /* @__PURE__ */ new Date();
    let startDate = /* @__PURE__ */ new Date();
    let endDate = /* @__PURE__ */ new Date();
    if (timeRange === "week") {
      startDate.setDate(now.getDate() - 6);
    } else if (timeRange === "month") {
      startDate.setDate(now.getDate() - 29);
    } else if (timeRange === "custom") {
      if (customFrom) startDate = new Date(customFrom);
      if (customTo) {
        endDate = new Date(customTo);
      } else {
        endDate = /* @__PURE__ */ new Date();
      }
    }
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    const buckets = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      const dateStr = current.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      });
      buckets.push({
        day: dateStr,
        requests: 0,
        approved: 0
      });
      current.setDate(current.getDate() + 1);
      if (buckets.length > 120) break;
    }
    filteredLeaves.forEach((leave) => {
      const created = new Date(leave.created_at);
      if (created >= startDate && created <= endDate) {
        const dateStr = created.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric"
        });
        const bucket = buckets.find((b) => b.day === dateStr);
        if (bucket) {
          bucket.requests += 1;
          if (leave.final_status === "APPROVED") {
            bucket.approved += 1;
          }
        }
      }
    });
    return buckets;
  }, [filteredLeaves, timeRange, customFrom, customTo]);
  const outsideLast24h = useMemo(() => {
    const now = /* @__PURE__ */ new Date();
    let startDate = /* @__PURE__ */ new Date();
    let endDate = /* @__PURE__ */ new Date();
    if (outsideTimeFilter === "24h") {
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1e3);
    } else if (outsideTimeFilter === "week") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
    } else if (outsideTimeFilter === "month") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3);
    } else if (outsideTimeFilter === "custom") {
      if (outsideCustomFrom) startDate = new Date(outsideCustomFrom);
      if (outsideCustomTo) {
        endDate = new Date(outsideCustomTo);
        endDate.setHours(23, 59, 59, 999);
      } else {
        endDate = /* @__PURE__ */ new Date();
      }
    }
    const list = filteredLeaves.filter((leave) => {
      if (leave.gatePass?.status !== "OUT") return false;
      const outTime = leave.gatePass.out_time_actual ? new Date(leave.gatePass.out_time_actual) : null;
      if (!outTime) return true;
      if (outsideTimeFilter === "custom") {
        return outTime >= startDate && outTime <= endDate;
      }
      return outTime >= startDate;
    });
    if (!outsideSearch.trim()) return list;
    return list.filter((l) => l.student.name.toLowerCase().includes(outsideSearch.toLowerCase()) || l.student.student_id.toLowerCase().includes(outsideSearch.toLowerCase()));
  }, [filteredLeaves, outsideSearch, outsideTimeFilter, outsideCustomFrom, outsideCustomTo]);
  const reviewedRequests = useMemo(() => {
    const now = /* @__PURE__ */ new Date();
    let startDate = /* @__PURE__ */ new Date();
    let endDate = /* @__PURE__ */ new Date();
    if (reviewedTimeFilter === "24h") {
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1e3);
    } else if (reviewedTimeFilter === "week") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
    } else if (reviewedTimeFilter === "month") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3);
    } else if (reviewedTimeFilter === "custom") {
      if (reviewedCustomFrom) startDate = new Date(reviewedCustomFrom);
      if (reviewedCustomTo) {
        endDate = new Date(reviewedCustomTo);
        endDate.setHours(23, 59, 59, 999);
      } else {
        endDate = /* @__PURE__ */ new Date();
      }
    }
    const list = filteredLeaves.filter((leave) => {
      if (leave.final_status !== "APPROVED" && leave.final_status !== "REJECTED") return false;
      const date = leave.updated_at ? new Date(leave.updated_at) : leave.created_at ? new Date(leave.created_at) : null;
      if (!date) return true;
      if (reviewedTimeFilter === "custom") {
        return date >= startDate && date <= endDate;
      }
      return date >= startDate;
    });
    let filtered = list;
    if (reviewedFilter !== "ALL") {
      filtered = list.filter((l) => l.final_status === reviewedFilter);
    }
    return filtered.sort((a, b) => {
      const dateA = a.updated_at || a.created_at;
      const dateB = b.updated_at || b.created_at;
      return String(dateB).localeCompare(String(dateA));
    });
  }, [filteredLeaves, reviewedFilter, reviewedTimeFilter, reviewedCustomFrom, reviewedCustomTo]);
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
    /* @__PURE__ */ jsxs("div", { className: "mt-6 grid gap-6 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "pb-3 border-b border-border/50", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-base font-semibold", children: "Students Outside" }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-1.5", children: [
              /* @__PURE__ */ jsx("input", { type: "text", placeholder: "Search name/ID…", value: outsideSearch, onChange: (e) => setOutsideSearch(e.target.value), className: "h-8 w-32 rounded-md border border-input bg-background px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring font-medium" }),
              /* @__PURE__ */ jsxs("select", { value: outsideTimeFilter, onChange: (e) => setOutsideTimeFilter(e.target.value), className: "h-8 w-28 rounded-md border border-input bg-background px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring font-medium", children: [
                /* @__PURE__ */ jsx("option", { value: "24h", children: "Last 24h" }),
                /* @__PURE__ */ jsx("option", { value: "week", children: "This Week" }),
                /* @__PURE__ */ jsx("option", { value: "month", children: "This Month" }),
                /* @__PURE__ */ jsx("option", { value: "custom", children: "Custom" })
              ] })
            ] })
          ] }),
          outsideTimeFilter === "custom" && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 mt-2 justify-end", children: [
            /* @__PURE__ */ jsx("input", { type: "date", value: outsideCustomFrom, onChange: (e) => setOutsideCustomFrom(e.target.value), className: "h-7 rounded-md border border-input bg-background px-2 text-[10px] font-medium focus:outline-none focus:ring-1 focus:ring-ring" }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground", children: "to" }),
            /* @__PURE__ */ jsx("input", { type: "date", value: outsideCustomTo, onChange: (e) => setOutsideCustomTo(e.target.value), className: "h-7 rounded-md border border-input bg-background px-2 text-[10px] font-medium focus:outline-none focus:ring-1 focus:ring-ring" })
          ] })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { className: "h-[450px] overflow-y-auto pt-4 space-y-4", children: outsideLast24h.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground py-8 text-center", children: "No students currently outside within selected timeframe." }) : outsideLast24h.map((leave) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border/40 pb-3 last:border-0 last:pb-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(Avatar, { className: "h-8 w-8", children: /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-accent text-accent-foreground text-xs font-semibold", children: leave.student.name.split(" ").map((n) => n[0]).slice(0, 2).join("") }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: leave.student.name }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
                leave.student.student_id,
                " · Room ",
                leave.student.room_number
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsx("span", { className: "inline-flex items-center rounded-full bg-warning/10 px-2 py-0.5 text-2xs font-medium text-warning border border-warning/20", children: "OUT" }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground mt-1", children: leave.gatePass?.out_time_actual ? new Date(leave.gatePass.out_time_actual).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            }) : "N/A" })
          ] })
        ] }, leave.id)) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "pb-3 border-b border-border/50", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-base font-semibold", children: "Reviewed Requests" }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-1.5", children: [
              /* @__PURE__ */ jsxs("select", { value: reviewedFilter, onChange: (e) => setReviewedFilter(e.target.value), className: "h-8 w-28 rounded-md border border-input bg-background px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring font-medium", children: [
                /* @__PURE__ */ jsx("option", { value: "ALL", children: "All Statuses" }),
                /* @__PURE__ */ jsx("option", { value: "APPROVED", children: "Approved" }),
                /* @__PURE__ */ jsx("option", { value: "REJECTED", children: "Rejected" })
              ] }),
              /* @__PURE__ */ jsxs("select", { value: reviewedTimeFilter, onChange: (e) => setReviewedTimeFilter(e.target.value), className: "h-8 w-28 rounded-md border border-input bg-background px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring font-medium", children: [
                /* @__PURE__ */ jsx("option", { value: "24h", children: "Last 24h" }),
                /* @__PURE__ */ jsx("option", { value: "week", children: "This Week" }),
                /* @__PURE__ */ jsx("option", { value: "month", children: "This Month" }),
                /* @__PURE__ */ jsx("option", { value: "custom", children: "Custom" })
              ] })
            ] })
          ] }),
          reviewedTimeFilter === "custom" && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 mt-2 justify-end", children: [
            /* @__PURE__ */ jsx("input", { type: "date", value: reviewedCustomFrom, onChange: (e) => setReviewedCustomFrom(e.target.value), className: "h-7 rounded-md border border-input bg-background px-2 text-[10px] font-medium focus:outline-none focus:ring-1 focus:ring-ring" }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground", children: "to" }),
            /* @__PURE__ */ jsx("input", { type: "date", value: reviewedCustomTo, onChange: (e) => setReviewedCustomTo(e.target.value), className: "h-7 rounded-md border border-input bg-background px-2 text-[10px] font-medium focus:outline-none focus:ring-1 focus:ring-ring" })
          ] })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { className: "h-[450px] overflow-y-auto pt-4 space-y-4", children: reviewedRequests.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground py-8 text-center", children: "No reviewed requests found." }) : reviewedRequests.map((leave) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border/40 pb-3 last:border-0 last:pb-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(Avatar, { className: "h-8 w-8", children: /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-accent text-accent-foreground text-xs font-semibold", children: leave.student.name.split(" ").map((n) => n[0]).slice(0, 2).join("") }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: leave.student.name }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: leave.reason })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-right shrink-0", children: [
            /* @__PURE__ */ jsx(StatusBadge, { status: leave.final_status.toLowerCase() }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground mt-1 font-medium", children: (() => {
              const date = leave.updated_at ? new Date(leave.updated_at) : leave.created_at ? new Date(leave.created_at) : null;
              return date ? date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric"
              }) + " " + date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
              }) : "N/A";
            })() })
          ] })
        ] }, leave.id)) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-6 grid gap-4", children: /* @__PURE__ */ jsxs(Card, { className: "w-full", children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2", children: [
        /* @__PURE__ */ jsx(CardTitle, { children: "Permission Activity" }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [
          /* @__PURE__ */ jsx(Button, { size: "sm", variant: timeRange === "week" ? "default" : "outline", onClick: () => setTimeRange("week"), className: "h-8 text-xs px-3", children: "This Week" }),
          /* @__PURE__ */ jsx(Button, { size: "sm", variant: timeRange === "month" ? "default" : "outline", onClick: () => setTimeRange("month"), className: "h-8 text-xs px-3", children: "This Month" }),
          /* @__PURE__ */ jsx(Button, { size: "sm", variant: timeRange === "custom" ? "default" : "outline", onClick: () => setTimeRange("custom"), className: "h-8 text-xs px-3", children: "Custom Range" }),
          timeRange === "custom" && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 ml-2", children: [
            /* @__PURE__ */ jsx("input", { type: "date", value: customFrom, onChange: (e) => setCustomFrom(e.target.value), className: "h-8 rounded-md border border-input bg-background px-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "to" }),
            /* @__PURE__ */ jsx("input", { type: "date", value: customTo, onChange: (e) => setCustomTo(e.target.value), className: "h-8 rounded-md border border-input bg-background px-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { className: "h-72", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: chartData, margin: {
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
    ] }) })
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
