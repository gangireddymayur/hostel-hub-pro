import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useMemo } from "react";
import { P as PageHeader } from "./dashboard-shell-CUtatoSb.mjs";
import { C as Card, a as CardContent } from "./card-DT9ybtLb.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-CG_WE0p-.mjs";
import { B as Badge } from "./badge-BNSdVhqQ.mjs";
import { useQuery } from "@tanstack/react-query";
import { h as getHostelStudents } from "./api-Cf7DDPxk.mjs";
import "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "lucide-react";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "./router-c2wuqsTo.mjs";
import "@radix-ui/react-avatar";
import "sonner";
import "clsx";
import "tailwind-merge";
function RoomsPage() {
  const studentsQuery = useQuery({
    queryKey: ["hostel-students"],
    queryFn: getHostelStudents
  });
  const students = studentsQuery.data?.data ?? [];
  const rooms = useMemo(() => {
    const grouped = /* @__PURE__ */ new Map();
    for (const student of students) {
      grouped.set(student.room_number, (grouped.get(student.room_number) ?? 0) + 1);
    }
    return Array.from(grouped.entries()).map(([number, occupied]) => ({
      number,
      capacity: 4,
      occupied
    }));
  }, [students]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Rooms", description: "Room allocation is derived from student records in the backend." }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-lg border border-border/60", children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableHead, { children: "Room" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Capacity" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Occupied" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Available" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Occupancy" })
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: rooms.map((room) => {
        const available = room.capacity - room.occupied;
        const pct = Math.round(room.occupied / room.capacity * 100);
        return /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: room.number }),
          /* @__PURE__ */ jsx(TableCell, { children: room.capacity }),
          /* @__PURE__ */ jsx(TableCell, { children: room.occupied }),
          /* @__PURE__ */ jsx(TableCell, { children: available }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "h-2 w-24 overflow-hidden rounded-full bg-muted", children: /* @__PURE__ */ jsx("div", { className: "h-full rounded-full bg-primary", style: {
              width: `${pct}%`
            } }) }),
            /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "text-[10px]", children: [
              pct,
              "%"
            ] })
          ] }) })
        ] }, room.number);
      }) })
    ] }) }) }) })
  ] });
}
export {
  RoomsPage as component
};
