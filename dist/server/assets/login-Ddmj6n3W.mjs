import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { GraduationCap, BarChart3, Loader2, ArrowRight, Building2, ShieldCheck } from "lucide-react";
import { B as Button, l as login, I as Input } from "./api-HRN8onLj.mjs";
import { C as Card, a as CardContent } from "./card-uHynQIQj.mjs";
import { L as Label } from "./label-V6FSDLgb.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-Co9HLej9.mjs";
import { i as initTheme, g as getSession, s as setSession } from "./router-MtHgmJSR.mjs";
import { toast } from "sonner";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
import "@radix-ui/react-tabs";
import "@tanstack/react-query";
function Landing() {
  const navigate = useNavigate();
  const [role, setRole] = useState("super");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    initTheme();
  }, []);
  useEffect(() => {
    const syncSession = () => {
      const session = getSession();
      if (!session) return;
      navigate({
        to: session.profile.role === "SUPER_ADMIN" ? "/super/dashboard" : "/admin/dashboard"
      });
    };
    syncSession();
    window.addEventListener("hlms-auth-change", syncSession);
    return () => window.removeEventListener("hlms-auth-change", syncSession);
  }, [navigate]);
  const defaults = useMemo(() => ({
    superEmail: "admin@hostelhub.local",
    superPassword: "Admin@12345",
    hostelEmail: "green-valley@hostel.test",
    adminPassword: "Admin@12345"
  }), []);
  const submit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const identifier = String(form.get("identifier") ?? "");
    const password = String(form.get("password") ?? "");
    setLoading(true);
    setError(null);
    try {
      const response = await login({
        type: role === "super" ? "SUPER_ADMIN" : "HOSTEL_ADMIN",
        identifier,
        password
      });
      setSession(response);
      navigate({
        to: response.profile.role === "SUPER_ADMIN" ? "/super/dashboard" : "/admin/dashboard"
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Login failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative min-h-screen overflow-hidden bg-background", children: [
    /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,oklch(0.55_0.21_265/0.18),transparent_70%)]" }),
    /* @__PURE__ */ jsxs("header", { className: "mx-auto flex max-w-6xl items-center justify-between px-6 py-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow", children: /* @__PURE__ */ jsx(GraduationCap, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsx("span", { className: "text-lg font-semibold tracking-tight", children: "HostelOS" })
      ] }),
      /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "Live backend connected" })
    ] }),
    /* @__PURE__ */ jsxs("main", { className: "mx-auto max-w-6xl px-6 pb-20 pt-10", children: [
      /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-3xl text-center", children: [
        /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-success" }),
          " Production portal"
        ] }),
        /* @__PURE__ */ jsxs("h1", { className: "mt-5 text-4xl font-semibold tracking-tight md:text-6xl", children: [
          "Modern leave management for",
          " ",
          /* @__PURE__ */ jsx("span", { className: "bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent", children: "hostels at scale" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mx-auto mt-4 max-w-xl text-base text-muted-foreground", children: "One secure portal for super admins to onboard hostels and hostel admins to manage students, staff and leave approvals." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]", children: [
        /* @__PURE__ */ jsx(Card, { className: "border-border/60 shadow-lg", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
          /* @__PURE__ */ jsx("div", { className: "flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(BarChart3, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsx("h3", { className: "mt-4 text-lg font-semibold", children: "Sign in" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Use the role selector below and your real backend credentials." }),
          /* @__PURE__ */ jsxs("form", { className: "mt-6 grid gap-4", onSubmit: submit, children: [
            /* @__PURE__ */ jsx(Tabs, { value: role, onValueChange: (value) => setRole(value), children: /* @__PURE__ */ jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [
              /* @__PURE__ */ jsx(TabsTrigger, { value: "super", children: "Super Admin" }),
              /* @__PURE__ */ jsx(TabsTrigger, { value: "admin", children: "Hostel Admin" })
            ] }) }),
            role === "super" ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Field, { name: "identifier", label: "Email", type: "email", defaultValue: defaults.superEmail }),
              /* @__PURE__ */ jsx(Field, { name: "password", label: "Password", type: "password", defaultValue: defaults.superPassword })
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Field, { name: "identifier", label: "Hostel Email", type: "email", defaultValue: defaults.hostelEmail }),
              /* @__PURE__ */ jsx(Field, { name: "password", label: "Password", type: "password", defaultValue: defaults.adminPassword })
            ] }),
            error ? /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", children: error }) : null,
            /* @__PURE__ */ jsx(Button, { className: "w-full justify-between", type: "submit", disabled: loading, children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
              "Signing in ",
              /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" })
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              "Continue ",
              /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
            ] }) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { className: "border-border/60 bg-muted/20", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
          /* @__PURE__ */ jsx("div", { className: "flex h-11 w-11 items-center justify-center rounded-xl bg-info/10 text-info", children: /* @__PURE__ */ jsx(Building2, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsx("h3", { className: "mt-4 text-lg font-semibold", children: "What’s included" }),
          /* @__PURE__ */ jsxs("ul", { className: "mt-4 space-y-3 text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsx(ShieldCheck, { className: "mt-0.5 h-4 w-4 text-success" }),
              "JWT-based authentication with role-based access control."
            ] }),
            /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsx(GraduationCap, { className: "mt-0.5 h-4 w-4 text-success" }),
              "Multi-tenant hostel data separated per hostel workspace."
            ] }),
            /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsx(Building2, { className: "mt-0.5 h-4 w-4 text-success" }),
              "Web access is only for super admins and hostel admins."
            ] }),
            /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsx(BarChart3, { className: "mt-0.5 h-4 w-4 text-success" }),
              "Live dashboards, imports, reviews and reports backed by API."
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-6 rounded-xl border border-border bg-background p-4 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-foreground", children: "Test login" }),
            /* @__PURE__ */ jsxs("p", { className: "mt-2", children: [
              "Super admin: ",
              /* @__PURE__ */ jsx("span", { className: "font-mono text-foreground", children: defaults.superEmail })
            ] }),
            /* @__PURE__ */ jsxs("p", { children: [
              "Password: ",
              /* @__PURE__ */ jsx("span", { className: "font-mono text-foreground", children: defaults.superPassword })
            ] })
          ] })
        ] }) })
      ] })
    ] })
  ] });
}
function Field({
  name,
  label,
  type = "text",
  defaultValue
}) {
  return /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5", children: [
    /* @__PURE__ */ jsx(Label, { htmlFor: name, children: label }),
    /* @__PURE__ */ jsx(Input, { id: name, name, type, defaultValue, required: true })
  ] });
}
export {
  Landing as component
};
