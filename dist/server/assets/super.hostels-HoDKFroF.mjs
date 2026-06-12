import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Pencil, Ban, CheckCircle2 } from "lucide-react";
import { P as PageHeader } from "./dashboard-shell-_f8HUvkb.mjs";
import { a as getSuperHostels, b as createHostel, u as updateHostel, d as setHostelStatus, B as Button, I as Input } from "./api-Do8Q2seI.mjs";
import { C as Card, a as CardContent } from "./card-CzOTNpMa.mjs";
import { B as Badge } from "./badge-BFv5t0GK.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-6UGqWwf5.mjs";
import { D as Dialog, a as DialogTrigger, b as DialogContent, c as DialogHeader, d as DialogTitle, e as DialogDescription, f as DialogFooter } from "./dialog-VC6weQ6o.mjs";
import { L as Label } from "./label-Df9-6PqB.mjs";
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
function HostelsPage() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const hostelsQuery = useQuery({
    queryKey: ["super-hostels"],
    queryFn: getSuperHostels
  });
  const list = useMemo(() => hostelsQuery.data?.data ?? [], [hostelsQuery.data]);
  const filtered = list.filter((hostel) => hostel.hostel_name.toLowerCase().includes(q.toLowerCase()) || hostel.email.toLowerCase().includes(q.toLowerCase()));
  const createMutation = useMutation({
    mutationFn: createHostel,
    onSuccess: async () => {
      toast.success("Hostel created");
      setOpen(false);
      await queryClient.invalidateQueries({
        queryKey: ["super-hostels"]
      });
      await queryClient.invalidateQueries({
        queryKey: ["super-analytics"]
      });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to create hostel")
  });
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload
    }) => updateHostel(id, payload),
    onSuccess: async () => {
      toast.success("Hostel updated");
      setEditing(null);
      await queryClient.invalidateQueries({
        queryKey: ["super-hostels"]
      });
      await queryClient.invalidateQueries({
        queryKey: ["super-analytics"]
      });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update hostel")
  });
  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status
    }) => setHostelStatus(id, status),
    onSuccess: async (_, variables) => {
      toast.success(`Hostel ${variables.status === "ACTIVE" ? "enabled" : "disabled"}`);
      await queryClient.invalidateQueries({
        queryKey: ["super-hostels"]
      });
      await queryClient.invalidateQueries({
        queryKey: ["super-analytics"]
      });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update status")
  });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Hostel management", description: "Create, edit and manage all hostels on the platform.", action: /* @__PURE__ */ jsxs(Dialog, { open, onOpenChange: setOpen, children: [
      /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
        " Create Hostel"
      ] }) }),
      /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-2xl", children: [
        /* @__PURE__ */ jsxs(DialogHeader, { children: [
          /* @__PURE__ */ jsx(DialogTitle, { children: "Create new hostel" }),
          /* @__PURE__ */ jsx(DialogDescription, { children: "Provision a new hostel workspace and admin account." })
        ] }),
        /* @__PURE__ */ jsx(HostelForm, { isCreate: true, onSubmit: (payload) => createMutation.mutate({
          hostel_name: payload.hostel_name ?? "",
          email: payload.email ?? "",
          password: payload.password,
          admin_name: payload.admin_name ?? "",
          admin_email: payload.admin_email ?? "",
          admin_password: payload.admin_password
        }), submitLabel: createMutation.isPending ? "Creating..." : "Create Hostel", onCancel: () => setOpen(false) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-4 flex flex-wrap items-center gap-2", children: /* @__PURE__ */ jsxs("div", { className: "relative max-w-sm flex-1", children: [
        /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsx(Input, { placeholder: "Search hostels…", value: q, onChange: (e) => setQ(e.target.value), className: "pl-9" })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-lg border border-border/60", children: /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableHead, { children: "Hostel" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Students" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Staff" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Status" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: filtered.map((hostel) => /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxs(TableCell, { children: [
            /* @__PURE__ */ jsx("div", { className: "font-medium", children: hostel.hostel_name }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: hostel.email })
          ] }),
          /* @__PURE__ */ jsx(TableCell, { children: hostel._count?.students ?? 0 }),
          /* @__PURE__ */ jsx(TableCell, { children: hostel._count?.staff ?? 0 }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { className: hostel.status === "ACTIVE" ? "bg-success text-success-foreground hover:bg-success" : "bg-muted text-muted-foreground hover:bg-muted", children: hostel.status.toLowerCase() }) }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-1", children: [
            /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", onClick: () => setEditing(hostel), children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", onClick: () => statusMutation.mutate({
              id: hostel.id,
              status: hostel.status === "ACTIVE" ? "DISABLED" : "ACTIVE"
            }), children: hostel.status === "ACTIVE" ? /* @__PURE__ */ jsx(Ban, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" }) })
          ] }) })
        ] }, hostel.id)) })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: !!editing, onOpenChange: (open2) => !open2 && setEditing(null), children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-2xl", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: "Edit hostel" }),
        /* @__PURE__ */ jsx(DialogDescription, { children: "Update hostel details and admin login settings." })
      ] }),
      editing ? /* @__PURE__ */ jsx(HostelForm, { initial: editing, isCreate: false, onSubmit: (payload) => updateMutation.mutate({
        id: editing.id,
        payload
      }), submitLabel: updateMutation.isPending ? "Saving..." : "Save changes", onCancel: () => setEditing(null) }) : null
    ] }) })
  ] });
}
function HostelForm({
  initial,
  isCreate,
  onSubmit,
  submitLabel,
  onCancel
}) {
  return /* @__PURE__ */ jsxs("form", { className: "grid gap-4 md:grid-cols-2", onSubmit: (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit({
      hostel_name: String(form.get("hostel_name") ?? ""),
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? "") || void 0,
      ...isCreate ? {
        admin_name: String(form.get("admin_name") ?? ""),
        admin_email: String(form.get("admin_email") ?? ""),
        admin_password: String(form.get("admin_password") ?? "") || void 0
      } : {}
    });
  }, children: [
    /* @__PURE__ */ jsx(Field, { name: "hostel_name", label: "Hostel Name", defaultValue: initial?.hostel_name ?? "", required: true }),
    /* @__PURE__ */ jsx(Field, { name: "email", label: "Hostel Email", type: "email", defaultValue: initial?.email ?? "", required: true }),
    /* @__PURE__ */ jsx("div", { className: "md:col-span-2", children: /* @__PURE__ */ jsx(Field, { name: "password", label: "Admin Password", type: "password", defaultValue: "", helper: "Leave blank to keep the existing password." }) }),
    isCreate ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Field, { name: "admin_name", label: "Hostel Admin Name", required: true }),
      /* @__PURE__ */ jsx(Field, { name: "admin_email", label: "Hostel Admin Email", type: "email", required: true }),
      /* @__PURE__ */ jsx("div", { className: "md:col-span-2", children: /* @__PURE__ */ jsx(Field, { name: "admin_password", label: "Hostel Admin Password", type: "password", helper: "Leave blank to use the default reset password." }) })
    ] }) : null,
    /* @__PURE__ */ jsxs(DialogFooter, { className: "md:col-span-2", children: [
      /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", onClick: onCancel, children: "Cancel" }),
      /* @__PURE__ */ jsx(Button, { type: "submit", children: submitLabel })
    ] })
  ] });
}
function Field({
  name,
  label,
  type = "text",
  required,
  defaultValue,
  helper
}) {
  return /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5", children: [
    /* @__PURE__ */ jsx(Label, { htmlFor: name, children: label }),
    /* @__PURE__ */ jsx(Input, { id: name, name, type, required, defaultValue }),
    helper ? /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: helper }) : null
  ] });
}
export {
  HostelsPage as component
};
