import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useMutation } from "@tanstack/react-query";
import { P as PageHeader } from "./dashboard-shell-CH7YiG8J.mjs";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./card-B1P1l_sU.mjs";
import { c as cn, a as changePassword, B as Button, I as Input } from "./api-B-SZgp9F.mjs";
import { L as Label } from "./label-_kwgVFmO.mjs";
import { Upload } from "lucide-react";
import * as React from "react";
import { g as getSession } from "./router-CrmuCNA4.mjs";
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
const Textarea = React.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "textarea",
      {
        className: cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";
function AdminSettings() {
  const session = getSession();
  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => toast.success("Password updated"),
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update password")
  });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Hostel settings", description: "Branding, notifications and integration preferences." }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Hostel details" }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "grid gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-2xl font-bold text-primary-foreground", children: (session?.profile.email ?? "HA").slice(0, 2).toUpperCase() }),
            /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", children: [
              /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4" }),
              " Upload logo"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsx(Label, { children: "Hostel email" }),
            /* @__PURE__ */ jsx(Input, { defaultValue: session?.profile.email ?? "", readOnly: true })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsx(Label, { children: "Address" }),
            /* @__PURE__ */ jsx(Textarea, { placeholder: "Enter hostel address" })
          ] }),
          /* @__PURE__ */ jsx(Button, { className: "w-fit", variant: "outline", children: "Save changes" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-4", children: /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Change password" }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "grid gap-4", children: /* @__PURE__ */ jsxs("form", { className: "grid gap-4", onSubmit: (event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          passwordMutation.mutate({
            currentPassword: String(form.get("currentPassword") ?? ""),
            newPassword: String(form.get("newPassword") ?? "")
          });
        }, children: [
          /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "currentPassword", children: "Current password" }),
            /* @__PURE__ */ jsx(Input, { id: "currentPassword", name: "currentPassword", type: "password", required: true })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "newPassword", children: "New password" }),
            /* @__PURE__ */ jsx(Input, { id: "newPassword", name: "newPassword", type: "password", required: true })
          ] }),
          /* @__PURE__ */ jsx(Button, { className: "w-fit", type: "submit", children: "Update password" })
        ] }) })
      ] }) })
    ] })
  ] });
}
export {
  AdminSettings as component
};
