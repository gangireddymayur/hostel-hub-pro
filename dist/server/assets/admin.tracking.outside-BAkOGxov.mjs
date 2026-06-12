import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { P as PageHeader, A as Avatar, a as AvatarFallback } from "./dashboard-shell-_f8HUvkb.mjs";
import { C as Card, a as CardContent } from "./card-CzOTNpMa.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-6UGqWwf5.mjs";
import { B as Badge } from "./badge-BFv5t0GK.mjs";
import { p as getLeaveRequests } from "./api-Do8Q2seI.mjs";
import "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "lucide-react";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "@radix-ui/react-avatar";
import "sonner";
import "clsx";
import "tailwind-merge";
function Page() {
  const leaveQuery = useQuery({
    queryKey: ["hostel-leaves"],
    queryFn: getLeaveRequests
  });
  const leaves = leaveQuery.data?.data ?? [];
  const outsideStudents = useMemo(() => leaves.filter((leave) => leave.gatePass?.status === "OUT" || leave.final_status === "APPROVED" && !leave.gatePass?.in_time_actual).map((leave) => ({
    id: leave.student.id,
    name: leave.student.name,
    studentId: leave.student.student_id,
    room: leave.student.room_number,
    outTime: leave.gatePass?.out_time_actual ?? leave.out_time,
    expectedReturn: leave.return_time
  })), [leaves]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Students currently outside", description: "Live view of all students who haven't returned yet." }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-lg border border-border/60", children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableHead, { children: "Student" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Student ID" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Room" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Out Time" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Expected Return" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Status" })
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: outsideStudents.map((student) => /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(Avatar, { className: "h-8 w-8", children: /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-accent text-accent-foreground text-xs", children: student.name.split(" ").map((part) => part[0]).slice(0, 2).join("") }) }),
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: student.name })
        ] }) }),
        /* @__PURE__ */ jsx(TableCell, { children: student.studentId }),
        /* @__PURE__ */ jsx(TableCell, { children: student.room }),
        /* @__PURE__ */ jsx(TableCell, { children: new Date(student.outTime).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        }) }),
        /* @__PURE__ */ jsx(TableCell, { children: new Date(student.expectedReturn).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        }) }),
        /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { className: "bg-warning/20 text-warning-foreground dark:text-warning hover:bg-warning/20", children: "Outside" }) })
      ] }, student.id)) })
    ] }) }) }) })
  ] });
}
export {
  Page as component
};
