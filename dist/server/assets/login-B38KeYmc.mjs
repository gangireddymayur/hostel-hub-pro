import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Phone, Mail, BarChart3, Loader2, ArrowRight, Building2, ShieldCheck, GraduationCap } from "lucide-react";
import { B as Button, l as login, I as Input } from "./api-DhJE2b2M.mjs";
import { C as Card, a as CardContent } from "./card-CEop6Y0t.mjs";
import { L as Label } from "./label-BR4XxljA.mjs";
import { i as initTheme, g as getSession, s as setSession } from "./router-BLyKIXcb.mjs";
import { toast } from "sonner";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
import "@tanstack/react-query";
function AdvaithaBranding() {
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto mt-14 w-full max-w-4xl overflow-hidden rounded-2xl border border-sky-200/80 bg-card shadow-2xl transition hover:shadow-sky-500/10 dark:border-sky-900/60 dark:bg-card", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border/80 bg-muted/40 px-6 py-3", children: [
      /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold uppercase tracking-widest text-muted-foreground", children: "Technology & Development Partner" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-xs font-medium", children: [
        /* @__PURE__ */ jsxs(
          "a",
          {
            href: "tel:9490468368",
            className: "flex items-center gap-1 text-sky-600 hover:text-sky-700 dark:text-sky-400",
            children: [
              /* @__PURE__ */ jsx(Phone, { className: "h-3.5 w-3.5" }),
              " 9490468368"
            ]
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "text-border", children: "|" }),
        /* @__PURE__ */ jsxs(
          "a",
          {
            href: "mailto:contact@advaitha.co.in",
            className: "flex items-center gap-1 text-sky-600 hover:text-sky-700 dark:text-sky-400",
            children: [
              /* @__PURE__ */ jsx(Mail, { className: "h-3.5 w-3.5" }),
              " contact@advaitha.co.in"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "relative overflow-hidden bg-white p-2 sm:p-4 dark:bg-slate-950", children: /* @__PURE__ */ jsx(
      "img",
      {
        src: "/advaitha-banner.png",
        alt: "ADVAITHA Automations - Services, Hardware & Certified Partners",
        className: "h-auto w-full rounded-xl object-contain shadow-inner"
      }
    ) })
  ] });
}
function Landing() {
  const navigate = useNavigate();
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
  const submit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const identifier = String(form.get("identifier") ?? "");
    const password = String(form.get("password") ?? "");
    setLoading(true);
    setError(null);
    try {
      const response = await login({
        type: "AUTO",
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
        /* @__PURE__ */ jsx("img", { src: "/gatex-logo.jpg", alt: "GATEX logo", className: "h-9 w-auto rounded-lg object-contain shadow" }),
        /* @__PURE__ */ jsx("span", { className: "text-lg font-semibold tracking-widest", children: "GATEX" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsx("span", { children: "Powered by" }),
        /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: "ADVAITHA Automations" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("main", { className: "mx-auto max-w-6xl px-6 pb-20 pt-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-3xl text-center", children: [
        /* @__PURE__ */ jsx("span", { className: "inline-flex items-center gap-2 rounded-full border border-sky-300/80 bg-sky-50 px-3.5 py-1 text-xs font-semibold text-sky-800 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300", children: "Enterprise Management System" }),
        /* @__PURE__ */ jsxs("h1", { className: "mt-5 text-4xl font-semibold tracking-tight md:text-6xl", children: [
          "Smart gate pass management for",
          " ",
          /* @__PURE__ */ jsx("span", { className: "bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent", children: "hostels at scale" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mx-auto mt-4 max-w-xl text-base text-muted-foreground", children: "One secure portal for super admins to onboard hostels and hostel admins to manage students, gate passes and permissions." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]", children: [
        /* @__PURE__ */ jsx(Card, { className: "border-border/60 shadow-lg", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
          /* @__PURE__ */ jsx("div", { className: "flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(BarChart3, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsx("h3", { className: "mt-4 text-lg font-semibold", children: "Sign in" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Enter your email and password — your access level is detected automatically." }),
          /* @__PURE__ */ jsxs("form", { className: "mt-6 grid gap-4", onSubmit: submit, children: [
            /* @__PURE__ */ jsx(Field, { name: "identifier", label: "Email", type: "email" }),
            /* @__PURE__ */ jsx(Field, { name: "password", label: "Password", type: "password" }),
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
          /* @__PURE__ */ jsx("h3", { className: "mt-4 text-lg font-semibold", children: "What's included" }),
          /* @__PURE__ */ jsxs("ul", { className: "mt-4 space-y-3 text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsx(ShieldCheck, { className: "mt-0.5 h-4 w-4 text-success" }),
              "JWT-based authentication with automatic role detection."
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
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx(AdvaithaBranding, {})
    ] })
  ] });
}
function Field({
  name,
  label,
  type = "text"
}) {
  return /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5", children: [
    /* @__PURE__ */ jsx(Label, { htmlFor: name, children: label }),
    /* @__PURE__ */ jsx(Input, { id: name, name, type, required: true })
  ] });
}
export {
  Landing as component
};
