import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useState, useMemo } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { P as PageHeader } from "./dashboard-shell-CH7YiG8J.mjs";
import { C as Card, a as CardContent } from "./card-B1P1l_sU.mjs";
import { c as cn, n as getLeaveRequests, r as reviewLeaveRequest, o as bulkReviewLeaveRequests, I as Input } from "./api-B-SZgp9F.mjs";
import { B as Badge } from "./badge-BXX4Mmxj.mjs";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-tG1q74FK.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-DrvBWu-9.mjs";
import { toast } from "sonner";
import "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "./router-CrmuCNA4.mjs";
import "@radix-ui/react-avatar";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-select";
const Tabs = TabsPrimitive.Root;
const TabsList = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.List,
  {
    ref,
    className: cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className
    ),
    ...props
  }
));
TabsList.displayName = TabsPrimitive.List.displayName;
const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.Trigger,
  {
    ref,
    className: cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
      className
    ),
    ...props
  }
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;
const TabsContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.Content,
  {
    ref,
    className: cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    ),
    ...props
  }
));
TabsContent.displayName = TabsPrimitive.Content.displayName;
function LeavesPage() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [reason, setReason] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);
  const leavesQuery = useQuery({
    queryKey: ["hostel-leaves"],
    queryFn: getLeaveRequests
  });
  const list = useMemo(() => leavesQuery.data?.data ?? [], [leavesQuery.data]);
  const reasons = useMemo(() => Array.from(new Set(list.map((leave) => leave.reason))), [list]);
  useMutation({
    mutationFn: ({
      id,
      status
    }) => reviewLeaveRequest(id, {
      status
    }),
    onSuccess: async (_, variables) => {
      toast.success(`Permission ${variables.status.toLowerCase()}`);
      setSelectedIds((prev) => prev.filter((id) => id !== variables.id));
      await queryClient.invalidateQueries({
        queryKey: ["hostel-leaves"]
      });
      await queryClient.invalidateQueries({
        queryKey: ["hostel-dashboard"]
      });
      await queryClient.invalidateQueries({
        queryKey: ["hostel-reports"]
      });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update permission")
  });
  useMutation({
    mutationFn: (status) => bulkReviewLeaveRequests({
      ids: selectedIds,
      status
    }),
    onSuccess: async (_, status) => {
      toast.success(`Bulk permissions ${status.toLowerCase()} successfully`);
      setSelectedIds([]);
      await queryClient.invalidateQueries({
        queryKey: ["hostel-leaves"]
      });
      await queryClient.invalidateQueries({
        queryKey: ["hostel-dashboard"]
      });
      await queryClient.invalidateQueries({
        queryKey: ["hostel-reports"]
      });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to bulk update permissions")
  });
  const filter = (status) => list.filter((leave) => {
    if (status && leave.final_status !== status) return false;
    if (reason !== "all" && leave.reason !== reason) return false;
    if (q && !(leave.student.name.toLowerCase().includes(q.toLowerCase()) || leave.student.student_id.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Permission requests", description: "Review parent-approved permission requests from students." }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-4 flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative max-w-sm flex-1 min-w-[200px]", children: [
          /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
          /* @__PURE__ */ jsx(Input, { placeholder: "Search by name or ID…", value: q, onChange: (e) => setQ(e.target.value), className: "pl-9" })
        ] }),
        /* @__PURE__ */ jsxs(Select, { value: reason, onValueChange: setReason, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { className: "w-[180px]", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "All reasons" }),
            reasons.map((item) => /* @__PURE__ */ jsx(SelectItem, { value: item, children: item }, item))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Tabs, { defaultValue: "pending", children: [
        /* @__PURE__ */ jsxs(TabsList, { children: [
          /* @__PURE__ */ jsx(TabsTrigger, { value: "pending", children: "Pending" }),
          /* @__PURE__ */ jsx(TabsTrigger, { value: "approved", children: "Approved" }),
          /* @__PURE__ */ jsx(TabsTrigger, { value: "rejected", children: "Rejected" }),
          /* @__PURE__ */ jsx(TabsTrigger, { value: "all", children: "History" })
        ] }),
        [{
          v: "pending",
          filter: filter("PENDING")
        }, {
          v: "approved",
          filter: filter("APPROVED")
        }, {
          v: "rejected",
          filter: filter("REJECTED")
        }, {
          v: "all",
          filter: filter()
        }].map((tab) => /* @__PURE__ */ jsx(TabsContent, { value: tab.v, className: "mt-4", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-lg border border-border/60", children: /* @__PURE__ */ jsxs(Table, { children: [
          /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableHead, { children: "Student" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Reason" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Dates" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Parent" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Hostel" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Status" })
          ] }) }),
          /* @__PURE__ */ jsx(TableBody, { children: tab.filter.map((leave) => /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxs(TableCell, { children: [
              /* @__PURE__ */ jsx("div", { className: "font-medium", children: leave.student.name }),
              /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
                leave.student.student_id,
                " · ",
                leave.student.room_number,
                " ",
                leave.student.hostel_name ? `(${leave.student.hostel_name})` : ""
              ] })
            ] }),
            /* @__PURE__ */ jsx(TableCell, { children: leave.reason }),
            /* @__PURE__ */ jsxs(TableCell, { className: "text-xs", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                new Date(leave.from_date).toLocaleDateString(),
                " → ",
                new Date(leave.to_date).toLocaleDateString()
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-muted-foreground", children: [
                new Date(leave.out_time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                }),
                " /",
                " ",
                new Date(leave.return_time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                })
              ] })
            ] }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(ApprovalDot, { s: leave.parent_status.toLowerCase() }) }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(ApprovalDot, { s: leave.hostel_status.toLowerCase() }) }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(StatusBadge, { s: leave.final_status.toLowerCase() }) })
          ] }, leave.id)) })
        ] }) }) }, tab.v))
      ] })
    ] }) })
  ] });
}
function ApprovalDot({
  s
}) {
  const c = s === "approved" ? "bg-success" : s === "rejected" ? "bg-destructive" : "bg-warning";
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs capitalize", children: [
    /* @__PURE__ */ jsx("span", { className: `h-2 w-2 rounded-full ${c}` }),
    s
  ] });
}
function StatusBadge({
  s
}) {
  const cls = s === "approved" ? "bg-success text-success-foreground hover:bg-success" : s === "rejected" ? "bg-destructive text-destructive-foreground hover:bg-destructive" : "bg-warning/20 text-warning-foreground dark:text-warning hover:bg-warning/20";
  return /* @__PURE__ */ jsx(Badge, { className: `capitalize ${cls}`, children: s });
}
export {
  LeavesPage as component
};
