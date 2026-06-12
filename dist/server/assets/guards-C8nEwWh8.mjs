import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { Plus, ShieldCheck, Pencil } from "lucide-react";
import { P as PageHeader, A as Avatar, a as AvatarFallback } from "./dashboard-shell-CftfEji3.mjs";
import { d as getHostelStaff, e as createStaff, B as Button, I as Input } from "./api-CkJot7SJ.mjs";
import { C as Card, a as CardContent } from "./card-CDUCg3x-.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-jLULTAL6.mjs";
import { D as Dialog, a as DialogTrigger, b as DialogContent, c as DialogHeader, d as DialogTitle, f as DialogFooter } from "./dialog-BgCGaW9c.mjs";
import { L as Label } from "./label-Dffs5szO.mjs";
import { toast } from "sonner";
import "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "./router-C7PLRwIH.mjs";
import "@radix-ui/react-avatar";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
function GuardsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
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
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Security guards", description: "Manage security guards with Android app access.", action: /* @__PURE__ */ jsxs(Dialog, { open, onOpenChange: setOpen, children: [
      /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
        " Add Guard"
      ] }) }),
      /* @__PURE__ */ jsxs(DialogContent, { children: [
        /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Add guard" }) }),
        /* @__PURE__ */ jsxs("form", { className: "grid gap-4", onSubmit: (event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          createMutation.mutate({
            role: "SECURITY_GUARD",
            name: String(form.get("name")),
            email: String(form.get("email")),
            password: String(form.get("password") ?? "") || void 0
          });
        }, children: [
          /* @__PURE__ */ jsx(Field, { name: "name", label: "Name", required: true }),
          /* @__PURE__ */ jsx(Field, { name: "email", label: "Email", type: "email", required: true }),
          /* @__PURE__ */ jsx(Field, { name: "password", label: "Password", type: "password", helper: "Leave blank to use the default reset password." }),
          /* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsx(Button, { type: "submit", children: "Save" }) })
        ] })
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
            /* @__PURE__ */ jsx(Avatar, { className: "h-8 w-8", children: /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-accent text-accent-foreground text-xs", children: guard.name.split(" ").map((part) => part[0]).slice(0, 2).join("") }) }),
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: guard.name })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(TableCell, { className: "text-xs", children: guard.email }),
        /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", onClick: () => toast.info("Edit guard is handled through the admin API."), children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }) }) })
      ] }, guard.id)) })
    ] }) }) }) })
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
export {
  GuardsPage as component
};
