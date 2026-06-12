import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useState, useMemo } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { ChevronDown, Check, ChevronUp, Search, X } from "lucide-react";
import { P as PageHeader } from "./dashboard-shell-CxMKUYR1.mjs";
import { C as Card, a as CardContent } from "./card-D4-FAbbD.mjs";
import { j as cn, n as getLeaveRequests, r as reviewLeaveRequest, I as Input, B as Button } from "./api-Dj6jg67T.mjs";
import { B as Badge } from "./badge-DYO3FDf8.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-4nJ4d36Z.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-U-NKtDWF.mjs";
import * as SelectPrimitive from "@radix-ui/react-select";
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
import "@radix-ui/react-tabs";
const Select = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;
const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Trigger,
  {
    ref,
    className: cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx(SelectPrimitive.Icon, { asChild: true, children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 opacity-50" }) })
    ]
  }
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;
const SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.ScrollUpButton,
  {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ jsx(ChevronUp, { className: "h-4 w-4" })
  }
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;
const SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.ScrollDownButton,
  {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" })
  }
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;
const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ jsx(SelectPrimitive.Portal, { children: /* @__PURE__ */ jsxs(
  SelectPrimitive.Content,
  {
    ref,
    className: cn(
      "relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)",
      position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
      className
    ),
    position,
    ...props,
    children: [
      /* @__PURE__ */ jsx(SelectScrollUpButton, {}),
      /* @__PURE__ */ jsx(
        SelectPrimitive.Viewport,
        {
          className: cn(
            "p-1",
            position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          ),
          children
        }
      ),
      /* @__PURE__ */ jsx(SelectScrollDownButton, {})
    ]
  }
) }));
SelectContent.displayName = SelectPrimitive.Content.displayName;
const SelectLabel = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.Label,
  {
    ref,
    className: cn("px-2 py-1.5 text-sm font-semibold", className),
    ...props
  }
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;
const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(SelectPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsx(SelectPrimitive.ItemText, { children })
    ]
  }
));
SelectItem.displayName = SelectPrimitive.Item.displayName;
const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.Separator,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;
function LeavesPage() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [reason, setReason] = useState("all");
  const leavesQuery = useQuery({
    queryKey: ["hostel-leaves"],
    queryFn: getLeaveRequests
  });
  const list = useMemo(() => leavesQuery.data?.data ?? [], [leavesQuery.data]);
  const reasons = useMemo(() => Array.from(new Set(list.map((leave) => leave.reason))), [list]);
  const reviewMutation = useMutation({
    mutationFn: ({
      id,
      status
    }) => reviewLeaveRequest(id, {
      status
    }),
    onSuccess: async (_, variables) => {
      toast.success(`Leave ${variables.status.toLowerCase()}`);
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
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update leave")
  });
  const filter = (status) => list.filter((leave) => {
    if (status && leave.final_status !== status) return false;
    if (reason !== "all" && leave.reason !== reason) return false;
    if (q && !(leave.student.name.toLowerCase().includes(q.toLowerCase()) || leave.student.student_id.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Leave requests", description: "Review parent-approved leave requests from students." }),
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
            /* @__PURE__ */ jsx(TableHead, { children: "Status" }),
            /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Action" })
          ] }) }),
          /* @__PURE__ */ jsx(TableBody, { children: tab.filter.map((leave) => /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxs(TableCell, { children: [
              /* @__PURE__ */ jsx("div", { className: "font-medium", children: leave.student.name }),
              /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
                leave.student.student_id,
                " · ",
                leave.student.room_number
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
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(StatusBadge, { s: leave.final_status.toLowerCase() }) }),
            /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: leave.final_status === "PENDING" ? /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-1", children: [
              /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", onClick: () => reviewMutation.mutate({
                id: leave.id,
                status: "APPROVED"
              }), className: "text-success border-success/30 hover:bg-success/10", children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", onClick: () => reviewMutation.mutate({
                id: leave.id,
                status: "REJECTED"
              }), className: "text-destructive border-destructive/30 hover:bg-destructive/10", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
            ] }) : /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "—" }) })
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
