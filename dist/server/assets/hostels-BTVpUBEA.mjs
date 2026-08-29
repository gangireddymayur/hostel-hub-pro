import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Pencil, Ban, CheckCircle2, Trash } from "lucide-react";
import { P as PageHeader } from "./dashboard-shell-C0Hk8nU9.mjs";
import { g as getSuperHostels, b as createHostel, u as updateHostel, s as setHostelStatus, p as deleteHostel, B as Button, I as Input } from "./api-CtgfTzSB.mjs";
import { C as Card, a as CardContent } from "./card-Box4fE8c.mjs";
import { B as Badge } from "./badge-szN-90wj.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-B3_OMsdD.mjs";
import { D as Dialog, a as DialogTrigger, b as DialogContent, c as DialogHeader, d as DialogTitle, e as DialogDescription, f as DialogFooter } from "./dialog-DSImvFTA.mjs";
import { L as Label } from "./label-Bn2GD0TI.mjs";
import { toast } from "sonner";
import "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "./router-BKnKXYaw.mjs";
import "@radix-ui/react-avatar";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
function HostelsPage() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const hostelsQuery = useQuery({
    queryKey: ["super-hostels"],
    queryFn: getSuperHostels
  });
  const createMutation = useMutation({
    mutationFn: createHostel,
    onSuccess: async (response) => {
      const creds = response.data.credentials;
      if (creds) {
        toast.success("Hostel created", {
          description: `Login Email: ${creds.hostel_email} | Password: ${creds.password}`
        });
      } else {
        toast.success("Branch created successfully");
      }
      setOpen(false);
      await queryClient.invalidateQueries({
        queryKey: ["super-hostels"]
      });
      await queryClient.invalidateQueries({
        queryKey: ["active-hostels"]
      });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to create branch")
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
        queryKey: ["active-hostels"]
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
        queryKey: ["active-hostels"]
      });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update status")
  });
  const deleteMutation = useMutation({
    mutationFn: deleteHostel,
    onSuccess: async () => {
      toast.success("Branch deleted successfully");
      setConfirmDelete(null);
      await queryClient.invalidateQueries({
        queryKey: ["super-hostels"]
      });
      await queryClient.invalidateQueries({
        queryKey: ["active-hostels"]
      });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to delete branch")
  });
  const list = useMemo(() => hostelsQuery.data?.data ?? [], [hostelsQuery.data]);
  const filtered = useMemo(() => {
    return list.filter((hostel) => (hostel.hostel_name?.toLowerCase() ?? "").includes(q.toLowerCase()) || (hostel.email?.toLowerCase() ?? "").includes(q.toLowerCase()));
  }, [list, q]);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, page]);
  if (hostelsQuery.isLoading) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(PageHeader, { title: "Branch management", description: "Create, edit and manage sub-hostel branches under this hostel." }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-6 text-sm text-muted-foreground", children: "Loading hostels..." }) })
    ] });
  }
  if (hostelsQuery.isError) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(PageHeader, { title: "Branch management", description: "Create, edit and manage sub-hostel branches under this hostel." }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-destructive", children: "Failed to load hostels." }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: hostelsQuery.error?.message ?? "Unknown error" })
      ] }) })
    ] });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Branch management", description: "Create, edit and manage sub-hostel branches under this hostel.", action: /* @__PURE__ */ jsxs(Dialog, { open, onOpenChange: setOpen, children: [
      /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
        " Create Branch"
      ] }) }),
      /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-2xl", children: [
        /* @__PURE__ */ jsxs(DialogHeader, { children: [
          /* @__PURE__ */ jsx(DialogTitle, { children: "Create new branch" }),
          /* @__PURE__ */ jsx(DialogDescription, { children: "Add a sub-hostel branch to organize students." })
        ] }),
        /* @__PURE__ */ jsx(HostelForm, { isCreate: true, onSubmit: (payload) => createMutation.mutate({
          hostel_name: payload.hostel_name ?? ""
        }), submitLabel: createMutation.isPending ? "Creating..." : "Create Branch", onCancel: () => setOpen(false) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-4 flex flex-wrap items-center gap-2", children: /* @__PURE__ */ jsxs("div", { className: "relative max-w-sm flex-1", children: [
        /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsx(Input, { placeholder: "Search hostels…", value: q, onChange: (e) => {
          setQ(e.target.value);
          setPage(1);
        }, className: "pl-9" })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-lg border border-border/60 bg-card", children: /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableHead, { children: "Branch" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Students" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Staff" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Status" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: paginated.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 5, children: /* @__PURE__ */ jsx("div", { className: "py-8 text-center text-sm text-muted-foreground font-medium", children: "No branches yet. Add the first branch to get started." }) }) }) : paginated.map((hostel) => /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("div", { className: "font-semibold text-foreground", children: hostel.hostel_name }) }),
          /* @__PURE__ */ jsx(TableCell, { className: "font-semibold", children: hostel._count?.students ?? 0 }),
          /* @__PURE__ */ jsx(TableCell, { className: "font-semibold", children: hostel._count?.staff ?? 0 }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { className: hostel.status === "ACTIVE" ? "bg-success text-success-foreground hover:bg-success" : "bg-muted text-muted-foreground hover:bg-muted", children: hostel.status.toLowerCase() }) }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-1", children: [
            /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", onClick: () => setEditing(hostel), children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", onClick: () => statusMutation.mutate({
              id: hostel.id,
              status: hostel.status === "ACTIVE" ? "DISABLED" : "ACTIVE"
            }), children: hostel.status === "ACTIVE" ? /* @__PURE__ */ jsx(Ban, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", onClick: () => setConfirmDelete(hostel), className: "text-destructive hover:bg-destructive/10", children: /* @__PURE__ */ jsx(Trash, { className: "h-4 w-4" }) })
          ] }) })
        ] }, hostel.id)) })
      ] }) }),
      totalPages > 1 && /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-between border-t border-border/40 pt-4", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Showing ",
          /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: (page - 1) * itemsPerPage + 1 }),
          " to",
          " ",
          /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: Math.min(page * itemsPerPage, filtered.length) }),
          " ",
          "of ",
          /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: filtered.length }),
          " branches"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: () => setPage((p) => Math.max(p - 1, 1)), disabled: page === 1, className: "h-8 text-xs font-semibold", children: "Previous" }),
          Array.from({
            length: totalPages
          }).map((_, idx) => {
            const pNum = idx + 1;
            return /* @__PURE__ */ jsx(Button, { variant: page === pNum ? "default" : "outline", size: "sm", onClick: () => setPage(pNum), className: "h-8 w-8 text-xs font-semibold p-0", children: pNum }, pNum);
          }),
          /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: () => setPage((p) => Math.min(p + 1, totalPages)), disabled: page === totalPages, className: "h-8 text-xs font-semibold", children: "Next" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: !!editing, onOpenChange: (open2) => !open2 && setEditing(null), children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-2xl", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: "Edit branch" }),
        /* @__PURE__ */ jsx(DialogDescription, { children: "Update branch details." })
      ] }),
      editing ? /* @__PURE__ */ jsx(HostelForm, { initial: editing, isCreate: false, onSubmit: (payload) => updateMutation.mutate({
        id: editing.id,
        payload
      }), submitLabel: updateMutation.isPending ? "Saving..." : "Save changes", onCancel: () => setEditing(null) }) : null
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: !!confirmDelete, onOpenChange: (open2) => !open2 && setConfirmDelete(null), children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: "Delete branch" }),
        /* @__PURE__ */ jsxs(DialogDescription, { children: [
          "Are you sure you want to delete ",
          /* @__PURE__ */ jsx("strong", { children: confirmDelete?.hostel_name }),
          "?"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 py-3 text-sm", children: [
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "This branch currently has:" }),
        /* @__PURE__ */ jsxs("ul", { className: "list-disc pl-5 font-medium space-y-1", children: [
          /* @__PURE__ */ jsxs("li", { children: [
            confirmDelete?._count?.students ?? 0,
            " students"
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            confirmDelete?._count?.staff ?? 0,
            " staff members"
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-destructive font-medium bg-destructive/10 p-3 rounded-lg text-xs border border-destructive/20", children: "Warning: Deleting this branch will NOT delete any students or staff. Instead, they will be unassigned from this branch and reassigned back to the main hostel." })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", onClick: () => setConfirmDelete(null), children: "Cancel" }),
        /* @__PURE__ */ jsx(Button, { type: "button", variant: "destructive", onClick: () => {
          if (confirmDelete) {
            deleteMutation.mutate(confirmDelete.id);
          }
        }, disabled: deleteMutation.isPending, children: deleteMutation.isPending ? "Deleting..." : "Confirm Delete" })
      ] })
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
  return /* @__PURE__ */ jsxs("form", { className: "grid gap-4", onSubmit: (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit({
      hostel_name: String(form.get("hostel_name") ?? "")
    });
  }, children: [
    /* @__PURE__ */ jsx(Field, { name: "hostel_name", label: "Branch Name", defaultValue: initial?.hostel_name ?? "", required: true }),
    /* @__PURE__ */ jsxs(DialogFooter, { children: [
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
