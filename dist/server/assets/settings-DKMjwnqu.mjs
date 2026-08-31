import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useMutation } from "@tanstack/react-query";
import { P as PageHeader } from "./dashboard-shell-CcdhqBCX.mjs";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./card--WHMiqoo.mjs";
import { c as cn, a as changePassword, I as Input, B as Button } from "./api-MNZaOU0e.mjs";
import { L as Label } from "./label-CbnpqQ5A.mjs";
import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { g as getSession } from "./router-DhAOx7wo.mjs";
import { toast } from "sonner";
import "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "lucide-react";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "@radix-ui/react-avatar";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
const Switch = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SwitchPrimitives.Root,
  {
    className: cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    ),
    ...props,
    ref,
    children: /* @__PURE__ */ jsx(
      SwitchPrimitives.Thumb,
      {
        className: cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
        )
      }
    )
  }
));
Switch.displayName = SwitchPrimitives.Root.displayName;
function SuperSettings() {
  const session = getSession();
  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => toast.success("Password updated"),
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update password")
  });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Platform settings", description: "Configure your Hostel GATEX workspace." }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Account" }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "grid gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsx(Label, { children: "Signed in as" }),
            /* @__PURE__ */ jsx(Input, { value: session?.profile.email ?? "", readOnly: true })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsx(Label, { children: "Role" }),
            /* @__PURE__ */ jsx(Input, { value: session?.profile.role ?? "", readOnly: true })
          ] }),
          /* @__PURE__ */ jsx(Button, { className: "w-fit", variant: "outline", children: "Save changes" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4", children: [
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Notifications" }) }),
          /* @__PURE__ */ jsx(CardContent, { className: "grid gap-4", children: [["New hostel onboarded", "Send email when a new hostel signs up."], ["Subscription expiring", "Notify 7 days before subscription ends."], ["Weekly summary", "Receive a weekly performance digest."]].map(([title, description]) => /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: title }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: description })
            ] }),
            /* @__PURE__ */ jsx(Switch, { defaultChecked: true })
          ] }, title)) })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Change password" }) }),
          /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("form", { className: "grid gap-4", onSubmit: (event) => {
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
        ] })
      ] })
    ] })
  ] });
}
export {
  SuperSettings as component
};
