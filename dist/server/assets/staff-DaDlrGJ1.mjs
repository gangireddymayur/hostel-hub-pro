import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Pencil } from "lucide-react";
import { P as PageHeader, A as Avatar, a as AvatarFallback } from "./dashboard-shell-M3Py_msi.mjs";
import { d as getHostelStaff, e as createStaff, f as updateStaff, B as Button, I as Input } from "./api-DVtsb3nb.mjs";
import { C as Card, a as CardContent } from "./card-cemIaUje.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-P9NCCuf1.mjs";
import { D as Dialog, a as DialogTrigger, b as DialogContent, c as DialogHeader, d as DialogTitle, f as DialogFooter } from "./dialog-dFW5wQ-O.mjs";
import { L as Label } from "./label-D7QXdHyr.mjs";
import { toast } from "sonner";
import "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "./router-DcrV_NkA.mjs";
import "@radix-ui/react-avatar";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
function StaffPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const staffQuery = useQuery({
    queryKey: ["hostel-staff"],
    queryFn: getHostelStaff
  });
  const list = useMemo(() => staffQuery.data?.data ?? [], [staffQuery.data]);
  const createMutation = useMutation({
    mutationFn: createStaff,
    onSuccess: async () => {
      toast.success("Staff added");
      setOpen(false);
      await queryClient.invalidateQueries({
        queryKey: ["hostel-staff"]
      });
      await queryClient.invalidateQueries({
        queryKey: ["hostel-dashboard"]
      });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to add staff")
  });
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      ...payload
    }) => updateStaff(id, payload),
    onSuccess: async () => {
      toast.success("Staff updated");
      setOpen(false);
      setEditingStaff(null);
      await queryClient.invalidateQueries({
        queryKey: ["hostel-staff"]
      });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update staff")
  });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Staff", description: "Manage hostel staff members.", action: /* @__PURE__ */ jsxs(Dialog, { open, onOpenChange: (val) => {
      setOpen(val);
      if (!val) setEditingStaff(null);
    }, children: [
      /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
        " Add Staff"
      ] }) }),
      /* @__PURE__ */ jsxs(DialogContent, { children: [
        /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: editingStaff ? "Edit staff member" : "Add staff member" }) }),
        /* @__PURE__ */ jsxs("form", { className: "grid gap-4", onSubmit: (event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const payload = {
            role: String(form.get("role")),
            name: String(form.get("name")),
            email: String(form.get("email")),
            password: String(form.get("password") ?? "") || void 0
          };
          if (editingStaff) {
            updateMutation.mutate({
              id: editingStaff.id,
              ...payload
            });
          } else {
            createMutation.mutate(payload);
          }
        }, children: [
          /* @__PURE__ */ jsx(Field, { name: "name", label: "Name", defaultValue: editingStaff?.name, required: true }),
          /* @__PURE__ */ jsx(Field, { name: "role", label: "Role", asSelect: true, defaultValue: editingStaff?.role, helper: "Choose hostel admin, guard or hostel staff." }),
          /* @__PURE__ */ jsx(Field, { name: "email", label: "Email", type: "email", defaultValue: editingStaff?.email, required: true }),
          /* @__PURE__ */ jsx(Field, { name: "password", label: "Password", type: "password", helper: editingStaff ? "Leave blank to keep current password." : "Leave blank to use the default reset password." }),
          /* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsx(Button, { type: "submit", children: editingStaff ? "Save changes" : "Save" }) })
        ] }, editingStaff ? editingStaff.id : "new")
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-lg border border-border/60", children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableHead, { children: "Name" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Role" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Email" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: list.map((staff) => /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(Avatar, { className: "h-8 w-8", children: /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-accent text-accent-foreground text-xs", children: staff.name.split(" ").map((part) => part[0]).slice(0, 2).join("") }) }),
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: staff.name })
        ] }) }),
        /* @__PURE__ */ jsx(TableCell, { children: staff.role.toLowerCase().replaceAll("_", " ") }),
        /* @__PURE__ */ jsx(TableCell, { className: "text-xs", children: staff.email }),
        /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", onClick: () => {
          setEditingStaff(staff);
          setOpen(true);
        }, children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }) }) })
      ] }, staff.id)) })
    ] }) }) }) })
  ] });
}
function Field({
  name,
  label,
  type = "text",
  required,
  helper,
  asSelect,
  defaultValue
}) {
  return /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5", children: [
    /* @__PURE__ */ jsx(Label, { htmlFor: name, children: label }),
    asSelect ? /* @__PURE__ */ jsxs("select", { id: name, name, required: true, defaultValue, className: "h-10 rounded-md border border-input bg-background px-3 py-2 text-sm", children: [
      /* @__PURE__ */ jsx("option", { value: "HOSTEL_ADMIN", children: "Hostel Admin" }),
      /* @__PURE__ */ jsx("option", { value: "SECURITY_GUARD", children: "Security Guard" }),
      /* @__PURE__ */ jsx("option", { value: "HOSTEL_STAFF", children: "Hostel Staff" })
    ] }) : /* @__PURE__ */ jsx(Input, { id: name, name, type, required, defaultValue }),
    helper ? /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: helper }) : null
  ] });
}
export {
  StaffPage as component
};
