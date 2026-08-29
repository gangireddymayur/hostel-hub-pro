import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { P as PageHeader, A as Avatar, b as AvatarFallback } from "./dashboard-shell-Yx5LRXaj.mjs";
import { C as Card, a as CardContent } from "./card-9RdRi1rI.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-ChfPxHVg.mjs";
import { B as Badge } from "./badge-CWyUZ6W5.mjs";
import { n as getLeaveRequests } from "./api-Dkx78klK.mjs";
import "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "lucide-react";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "./router-65FBkeVi.mjs";
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
  const outsideStudents = useMemo(() => leaves.filter((leave) => leave.gatePass?.status === "OUT").map((leave) => ({
    id: leave.id,
    name: leave.student.name,
    studentId: leave.student.student_id,
    room: leave.student.room_number,
    outTime: leave.gatePass?.out_time_actual ?? leave.out_time,
    expectedReturn: leave.return_time,
    studentLat: leave.student_lat,
    studentLng: leave.student_lng,
    guardLat: leave.gatePass?.out_guard_lat,
    guardLng: leave.gatePass?.out_guard_lng
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
        /* @__PURE__ */ jsx(TableHead, { children: "Request Location" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Exit Location" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Status" })
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: outsideStudents.map((student) => /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(Avatar, { className: "h-8 w-8", children: /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-accent text-accent-foreground text-xs", children: student.name.split(" ").map((part) => part[0]).slice(0, 2).join("") }) }),
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: student.name })
        ] }) }),
        /* @__PURE__ */ jsx(TableCell, { children: student.studentId }),
        /* @__PURE__ */ jsx(TableCell, { children: student.room }),
        /* @__PURE__ */ jsx(TableCell, { children: new Date(student.outTime).toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }) }),
        /* @__PURE__ */ jsx(TableCell, { children: new Date(student.expectedReturn).toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }) }),
        /* @__PURE__ */ jsx(TableCell, { children: student.studentLat && student.studentLng ? /* @__PURE__ */ jsxs("a", { href: `https://www.google.com/maps/search/?api=1&query=${student.studentLat},${student.studentLng}`, target: "_blank", rel: "noopener noreferrer", className: "text-xs text-primary hover:underline font-mono", children: [
          "📍 ",
          student.studentLat.toFixed(4),
          ", ",
          student.studentLng.toFixed(4)
        ] }) : /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "-" }) }),
        /* @__PURE__ */ jsx(TableCell, { children: student.guardLat && student.guardLng ? /* @__PURE__ */ jsxs("a", { href: `https://www.google.com/maps/search/?api=1&query=${student.guardLat},${student.guardLng}`, target: "_blank", rel: "noopener noreferrer", className: "text-xs text-emerald-600 hover:underline font-mono", children: [
          "📍 ",
          student.guardLat.toFixed(4),
          ", ",
          student.guardLng.toFixed(4)
        ] }) : /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "-" }) }),
        /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { className: "bg-warning/20 text-warning-foreground dark:text-warning hover:bg-warning/20", children: "Outside" }) })
      ] }, student.id)) })
    ] }) }) }) })
  ] });
}
export {
  Page as component
};
