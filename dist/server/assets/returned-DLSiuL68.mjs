import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { P as PageHeader, A as Avatar, a as AvatarFallback } from "./dashboard-shell-BDMfd1iz.mjs";
import { C as Card, a as CardContent } from "./card-ffd04v1y.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-RyCQmIrD.mjs";
import { B as Badge } from "./badge-CqBrWyAO.mjs";
import { j as getLeaveRequests } from "./api-DZPXXUJT.mjs";
import "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "lucide-react";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "./router-DLvrpDNy.mjs";
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
  const returnedToday = useMemo(() => leaves.filter((leave) => leave.gatePass?.status === "RETURNED" || !!leave.gatePass?.in_time_actual).map((leave) => ({
    id: leave.student.id,
    name: leave.student.name,
    studentId: leave.student.student_id,
    room: leave.student.room_number,
    returnTime: leave.gatePass?.in_time_actual ?? leave.return_time
  })), [leaves]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Students returned today", description: "Verified entries logged by security guards." }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-lg border border-border/60", children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableHead, { children: "Student" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Student ID" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Room" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Return Time" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Status" })
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: returnedToday.map((student) => /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(Avatar, { className: "h-8 w-8", children: /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-accent text-accent-foreground text-xs", children: student.name.split(" ").map((part) => part[0]).slice(0, 2).join("") }) }),
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: student.name })
        ] }) }),
        /* @__PURE__ */ jsx(TableCell, { children: student.studentId }),
        /* @__PURE__ */ jsx(TableCell, { children: student.room }),
        /* @__PURE__ */ jsx(TableCell, { children: new Date(student.returnTime).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        }) }),
        /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { className: "bg-success text-success-foreground hover:bg-success", children: "Returned" }) })
      ] }, student.id)) })
    ] }) }) }) })
  ] });
}
export {
  Page as component
};
