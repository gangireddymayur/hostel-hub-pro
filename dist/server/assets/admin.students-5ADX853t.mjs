import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Eye, Pencil, Upload } from "lucide-react";
import { P as PageHeader, A as Avatar, a as AvatarFallback } from "./dashboard-shell-BzmPZMY4.mjs";
import { f as getHostelStudents, h as createStudent, j as uploadStudentPhoto, B as Button, I as Input } from "./api-DEjzvlT8.mjs";
import { C as Card, a as CardContent } from "./card-D8nYzdvl.mjs";
import { B as Badge } from "./badge-4cEzl_Fr.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-PCgFw4dv.mjs";
import { D as Dialog, a as DialogTrigger, b as DialogContent, c as DialogHeader, d as DialogTitle, e as DialogDescription, f as DialogFooter } from "./dialog-7TY4qtO7.mjs";
import { L as Label } from "./label-B_Y3GPVW.mjs";
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
import "@radix-ui/react-label";
function StudentsPage() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const studentsQuery = useQuery({
    queryKey: ["hostel-students"],
    queryFn: getHostelStudents
  });
  const list = useMemo(() => studentsQuery.data?.data ?? [], [studentsQuery.data]);
  const filtered = list.filter((student) => student.name.toLowerCase().includes(q.toLowerCase()) || student.student_id.toLowerCase().includes(q.toLowerCase()) || student.room_number.toLowerCase().includes(q.toLowerCase()));
  const createMutation = useMutation({
    mutationFn: createStudent,
    onSuccess: async () => {
      toast.success("Student added");
      setOpen(false);
      await queryClient.invalidateQueries({
        queryKey: ["hostel-students"]
      });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to add student")
  });
  const photoMutation = useMutation({
    mutationFn: ({
      studentId,
      file
    }) => uploadStudentPhoto(studentId, file),
    onSuccess: async () => {
      toast.success("Student photo uploaded");
      setPhotoFile(null);
      await queryClient.invalidateQueries({
        queryKey: ["hostel-students"]
      });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to upload photo")
  });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Students", description: "Manage student records, profiles and rooms.", action: /* @__PURE__ */ jsxs(Dialog, { open, onOpenChange: setOpen, children: [
      /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
        " Add Student"
      ] }) }),
      /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-2xl", children: [
        /* @__PURE__ */ jsxs(DialogHeader, { children: [
          /* @__PURE__ */ jsx(DialogTitle, { children: "Add new student" }),
          /* @__PURE__ */ jsx(DialogDescription, { children: "Create a new student profile." })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: (event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          createMutation.mutate({
            student_id: String(form.get("student_id") ?? ""),
            name: String(form.get("name") ?? ""),
            room_number: String(form.get("room_number") ?? ""),
            mobile: String(form.get("mobile") ?? ""),
            parent_mobile: String(form.get("parent_mobile") ?? ""),
            password: String(form.get("password") ?? "") || void 0
          });
        }, className: "grid gap-4 md:grid-cols-2", children: [
          /* @__PURE__ */ jsx(Field, { name: "student_id", label: "Student ID", required: true }),
          /* @__PURE__ */ jsx(Field, { name: "name", label: "Full Name", required: true }),
          /* @__PURE__ */ jsx(Field, { name: "room_number", label: "Room Number", required: true }),
          /* @__PURE__ */ jsx(Field, { name: "mobile", label: "Mobile Number", required: true }),
          /* @__PURE__ */ jsx("div", { className: "md:col-span-2", children: /* @__PURE__ */ jsx(Field, { name: "parent_mobile", label: "Parent Mobile", required: true }) }),
          /* @__PURE__ */ jsx("div", { className: "md:col-span-2", children: /* @__PURE__ */ jsx(Field, { name: "password", label: "Password", type: "password", helper: "Leave blank to use the default reset password." }) }),
          /* @__PURE__ */ jsxs(DialogFooter, { className: "md:col-span-2", children: [
            /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", onClick: () => setOpen(false), children: "Cancel" }),
            /* @__PURE__ */ jsx(Button, { type: "submit", children: "Save Student" })
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-4 relative max-w-sm", children: [
        /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsx(Input, { placeholder: "Search by name, ID, room…", value: q, onChange: (e) => setQ(e.target.value), className: "pl-9" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-lg border border-border/60", children: /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableHead, { children: "Student" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Room" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Parent Mobile" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Mobile" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Status" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: filtered.map((student) => /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(Avatar, { className: "h-9 w-9", children: /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-accent text-accent-foreground text-xs", children: student.name.split(" ").map((part) => part[0]).slice(0, 2).join("") }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "font-medium", children: student.name }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: student.student_id })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(TableCell, { children: student.room_number }),
          /* @__PURE__ */ jsx(TableCell, { className: "font-mono text-xs", children: student.parent_mobile }),
          /* @__PURE__ */ jsx(TableCell, { className: "font-mono text-xs", children: student.mobile }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { className: student.status === "ACTIVE" ? "bg-success text-success-foreground hover:bg-success" : "bg-warning/20 text-warning-foreground dark:text-warning hover:bg-warning/20", children: student.status === "ACTIVE" ? "In Hostel" : "Disabled" }) }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-1", children: [
            /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", onClick: () => setView(student), children: /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", onClick: () => setView(student), children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }) })
          ] }) })
        ] }, student.id)) })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: !!view, onOpenChange: () => setView(null), children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-xl", children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Student profile" }) }),
      view ? /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx(Avatar, { className: "h-16 w-16", children: /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-primary text-primary-foreground", children: view.name.split(" ").map((part) => part[0]).slice(0, 2).join("") }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-lg font-semibold", children: view.name }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: view.student_id })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("dl", { className: "grid grid-cols-2 gap-3 text-sm", children: [
          /* @__PURE__ */ jsx(Info, { k: "Room", v: view.room_number }),
          /* @__PURE__ */ jsx(Info, { k: "Mobile", v: view.mobile }),
          /* @__PURE__ */ jsx(Info, { k: "Parent", v: view.parent_mobile }),
          /* @__PURE__ */ jsx(Info, { k: "Status", v: view.status })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2 rounded-xl border border-border/60 p-4", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "photo", children: "Upload profile photo" }),
          /* @__PURE__ */ jsx(Input, { id: "photo", type: "file", accept: "image/*", onChange: (event) => setPhotoFile(event.target.files?.[0] ?? null) }),
          /* @__PURE__ */ jsxs(Button, { type: "button", className: "w-fit", disabled: !photoFile || photoMutation.isPending, onClick: () => {
            if (!view || !photoFile) return;
            photoMutation.mutate({
              studentId: view.id,
              file: photoFile
            });
          }, children: [
            /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4" }),
            "Upload photo"
          ] })
        ] })
      ] }) : null
    ] }) })
  ] });
}
function Field({
  name,
  label,
  type = "text",
  required,
  helper
}) {
  return /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5", children: [
    /* @__PURE__ */ jsx(Label, { htmlFor: name, children: label }),
    /* @__PURE__ */ jsx(Input, { id: name, name, type, required }),
    helper ? /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: helper }) : null
  ] });
}
function Info({
  k,
  v
}) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border/60 bg-muted/30 p-3", children: [
    /* @__PURE__ */ jsx("dt", { className: "text-xs text-muted-foreground", children: k }),
    /* @__PURE__ */ jsx("dd", { className: "mt-0.5 font-medium", children: v })
  ] });
}
export {
  StudentsPage as component
};
