import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { Plus, ShieldCheck, Pencil } from "lucide-react";
import { P as PageHeader, A as Avatar, a as AvatarImage, b as AvatarFallback } from "./dashboard-shell-mrMXMb84.mjs";
import { h as uploadStaffPhoto, e as getHostelStaff, i as createStaff, j as updateStaff, k as deleteStaff, B as Button, I as Input } from "./api-1s68NJGb.mjs";
import { C as Card, a as CardContent } from "./card-Dji2GI0L.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-B-n7IwX6.mjs";
import { D as Dialog, a as DialogTrigger, b as DialogContent, c as DialogHeader, d as DialogTitle, f as DialogFooter } from "./dialog-AcqKNbeP.mjs";
import { L as Label } from "./label-CR2g_uAF.mjs";
import { toast } from "sonner";
import "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "./router--ACQUFm8.mjs";
import "@radix-ui/react-avatar";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
function GuardsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingGuard, setEditingGuard] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const photoMutation = useMutation({
    mutationFn: ({
      id,
      file
    }) => uploadStaffPhoto(id, file),
    onSuccess: async () => {
      toast.success("Profile photo uploaded");
      setPhotoFile(null);
      await queryClient.invalidateQueries({
        queryKey: ["hostel-staff"]
      });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to upload photo")
  });
  const staffQuery = useQuery({
    queryKey: ["hostel-staff"],
    queryFn: getHostelStaff
  });
  const list = useMemo(() => (staffQuery.data?.data ?? []).filter((staff) => staff.role === "SECURITY_GUARD"), [staffQuery.data]);
  const createMutation = useMutation({
    mutationFn: createStaff,
    onSuccess: async () => {
      toast.success("Guard added");
      setOpen(false);
      await queryClient.invalidateQueries({
        queryKey: ["hostel-staff"]
      });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to add guard")
  });
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      ...payload
    }) => updateStaff(id, payload),
    onSuccess: async () => {
      toast.success("Guard updated");
      setOpen(false);
      setEditingGuard(null);
      await queryClient.invalidateQueries({
        queryKey: ["hostel-staff"]
      });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update guard")
  });
  const deleteMutation = useMutation({
    mutationFn: deleteStaff,
    onSuccess: async () => {
      toast.success("Security guard deleted successfully");
      setOpen(false);
      setEditingGuard(null);
      await queryClient.invalidateQueries({
        queryKey: ["hostel-staff"]
      });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to delete guard")
  });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Security guards", description: "Manage security guards with Android app access.", action: /* @__PURE__ */ jsxs(Dialog, { open, onOpenChange: (val) => {
      setOpen(val);
      if (!val) setEditingGuard(null);
    }, children: [
      /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
        " Add Guard"
      ] }) }),
      /* @__PURE__ */ jsxs(DialogContent, { children: [
        /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: editingGuard ? "Edit guard" : "Add guard" }) }),
        /* @__PURE__ */ jsxs("form", { className: "grid gap-4", onSubmit: (event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const payload = {
            role: "SECURITY_GUARD",
            name: String(form.get("name")),
            email: String(form.get("email")),
            password: String(form.get("password") ?? "") || void 0
          };
          if (editingGuard) {
            updateMutation.mutate({
              id: editingGuard.id,
              ...payload
            });
          } else {
            createMutation.mutate(payload);
          }
        }, children: [
          /* @__PURE__ */ jsx(Field, { name: "name", label: "Name", defaultValue: editingGuard?.name, required: true }),
          /* @__PURE__ */ jsx(Field, { name: "email", label: "Email", type: "email", defaultValue: editingGuard?.email, required: true }),
          editingGuard && /* @__PURE__ */ jsxs("div", { className: "grid gap-2 rounded-xl border border-border/60 p-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxs(Avatar, { className: "h-12 w-12", children: [
                editingGuard.profile_photo && /* @__PURE__ */ jsx(AvatarImage, { src: editingGuard.profile_photo, alt: editingGuard.name, className: "object-cover" }),
                /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-primary text-primary-foreground text-sm", children: editingGuard.name.split(" ").map((part) => part[0]).slice(0, 2).join("") })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "photo", className: "text-xs font-medium", children: "Upload profile photo" }),
                /* @__PURE__ */ jsx(Input, { id: "photo", type: "file", accept: "image/*", className: "mt-1 h-9 text-xs", onChange: (event) => setPhotoFile(event.target.files?.[0] ?? null) })
              ] })
            ] }),
            /* @__PURE__ */ jsx(Button, { type: "button", size: "sm", className: "w-fit", disabled: !photoFile || photoMutation.isPending, onClick: () => {
              if (!editingGuard || !photoFile) return;
              photoMutation.mutate({
                id: editingGuard.id,
                file: photoFile
              });
            }, children: "Upload photo" })
          ] }),
          /* @__PURE__ */ jsx(Field, { name: "password", label: "Password", type: "password", helper: editingGuard ? "Leave blank to keep current password." : "Leave blank to use the default reset password." }),
          /* @__PURE__ */ jsxs(DialogFooter, { className: "flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-2", children: [
            editingGuard ? /* @__PURE__ */ jsx(Button, { type: "button", variant: "destructive", disabled: deleteMutation.isPending, onClick: () => {
              if (window.confirm(`Are you sure you want to delete security guard ${editingGuard.name}? This action cannot be undone.`)) {
                deleteMutation.mutate(editingGuard.id);
              }
            }, children: "Delete Guard" }) : /* @__PURE__ */ jsx("div", {}),
            /* @__PURE__ */ jsx(Button, { type: "submit", children: editingGuard ? "Save changes" : "Save" })
          ] })
        ] }, editingGuard ? editingGuard.id : "new")
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-lg border border-border/60", children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableHead, { children: "Name" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Email" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: list.map((guard) => /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(ShieldCheck, { className: "h-4 w-4 text-primary" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxs(Avatar, { className: "h-8 w-8", children: [
              guard.profile_photo && /* @__PURE__ */ jsx(AvatarImage, { src: guard.profile_photo, alt: guard.name, className: "object-cover" }),
              /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-accent text-accent-foreground text-xs", children: guard.name.split(" ").map((part) => part[0]).slice(0, 2).join("") })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: guard.name })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(TableCell, { className: "text-xs", children: guard.email }),
        /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", onClick: () => {
          setEditingGuard(guard);
          setOpen(true);
        }, children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }) }) })
      ] }, guard.id)) })
    ] }) }) }) })
  ] });
}
function Field({
  name,
  label,
  type = "text",
  required,
  helper,
  defaultValue
}) {
  return /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5", children: [
    /* @__PURE__ */ jsx(Label, { htmlFor: name, children: label }),
    /* @__PURE__ */ jsx(Input, { id: name, name, type, required, defaultValue }),
    helper ? /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: helper }) : null
  ] });
}
export {
  GuardsPage as component
};
