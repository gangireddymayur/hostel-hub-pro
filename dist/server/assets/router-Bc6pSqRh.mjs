import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, redirect, useRouter, Link, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, createRouter } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
const appCss = "/assets/styles-Poxo-Y48.css";
function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error"
    }
  );
}
const KEY = "hlms_session";
function emitSessionChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("hlms-auth-change"));
}
function setSession(session) {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(session));
    emitSessionChange();
  }
}
function getSession() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(KEY);
    return null;
  }
}
function clearSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(KEY);
    emitSessionChange();
  }
}
const THEME = "hlms_theme";
function getTheme() {
  if (typeof window === "undefined") return "light";
  return localStorage.getItem(THEME) ?? "light";
}
function setTheme(t) {
  if (typeof window === "undefined") return;
  localStorage.setItem(THEME, t);
  document.documentElement.classList.toggle("dark", t === "dark");
}
function initTheme() {
  if (typeof window === "undefined") return;
  document.documentElement.classList.toggle("dark", getTheme() === "dark");
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$l = createRootRouteWithContext()({
  beforeLoad: ({ location }) => {
    if (location.pathname !== "/login" && !getSession()) {
      throw redirect({ to: "/login" });
    }
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovable App" },
      { name: "description", content: "Lovable Generated Project" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      { property: "og:description", content: "Lovable Generated Project" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$l.useRouteContext();
  return /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(Outlet, {}) });
}
const $$splitComponentImporter$h = () => import("./super-DsXgDqWY.mjs");
const Route$k = createFileRoute("/super")({
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
const $$splitComponentImporter$g = () => import("./login-5cJAH3tx.mjs");
const Route$j = createFileRoute("/login")({
  head: () => ({
    meta: [{
      title: "HostelOS - Login"
    }, {
      name: "description",
      content: "Secure portal for super admins and hostel admins."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const $$splitComponentImporter$f = () => import("./admin-CjfKI7Xb.mjs");
const Route$i = createFileRoute("/admin")({
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const Route$h = createFileRoute("/")({
  beforeLoad: () => {
    const session = getSession();
    throw redirect({
      to: session?.profile.role === "SUPER_ADMIN" ? "/super/dashboard" : session?.profile.role === "HOSTEL_ADMIN" ? "/admin/dashboard" : "/login"
    });
  }
});
const Route$g = createFileRoute("/super/")({
  beforeLoad: () => {
    throw redirect({ to: "/super/dashboard" });
  }
});
const Route$f = createFileRoute("/admin/")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/dashboard" });
  }
});
const $$splitComponentImporter$e = () => import("./settings-Ccq07hEl.mjs");
const Route$e = createFileRoute("/super/settings")({
  head: () => ({
    meta: [{
      title: "Settings · HostelOS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./hostels-Bq8zqnOe.mjs");
const Route$d = createFileRoute("/super/hostels")({
  head: () => ({
    meta: [{
      title: "Hostel Management · HostelOS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./dashboard-ucfdBWaN.mjs");
const Route$c = createFileRoute("/super/dashboard")({
  head: () => ({
    meta: [{
      title: "Super Admin Dashboard · HostelOS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./analytics-DTzWJ1ts.mjs");
const Route$b = createFileRoute("/super/analytics")({
  head: () => ({
    meta: [{
      title: "Analytics · HostelOS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./staff-CcQ4tHj3.mjs");
const Route$a = createFileRoute("/admin/staff")({
  head: () => ({
    meta: [{
      title: "Staff · HostelOS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./settings-85KjrHF4.mjs");
const Route$9 = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [{
      title: "Settings · HostelOS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./reports-DS7kdUaJ.mjs");
const Route$8 = createFileRoute("/admin/reports")({
  head: () => ({
    meta: [{
      title: "Reports · HostelOS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./leaves-C47O5p6D.mjs");
const Route$7 = createFileRoute("/admin/leaves")({
  head: () => ({
    meta: [{
      title: "Permission Requests · HostelOS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./hostels-BWz_3O3_.mjs");
const Route$6 = createFileRoute("/admin/hostels")({
  head: () => ({
    meta: [{
      title: "Hostel Management · HostelOS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./guards-CBVD484a.mjs");
const Route$5 = createFileRoute("/admin/guards")({
  head: () => ({
    meta: [{
      title: "Security Guards · HostelOS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./dashboard-f-9rEdwx.mjs");
const Route$4 = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [{
      title: "Dashboard · HostelOS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./index-D7jQzvBR.mjs");
const Route$3 = createFileRoute("/admin/students/")({
  head: () => ({
    meta: [{
      title: "Students · HostelOS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./returned-BhvQ4zHU.mjs");
const Route$2 = createFileRoute("/admin/tracking/returned")({
  head: () => ({
    meta: [{
      title: "Students Returned · HostelOS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./outside-DzbP3BFx.mjs");
const Route$1 = createFileRoute("/admin/tracking/outside")({
  head: () => ({
    meta: [{
      title: "Students Outside · HostelOS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./import-2DpfNsjE.mjs");
const Route = createFileRoute("/admin/students/import")({
  head: () => ({
    meta: [{
      title: "Import Students · HostelOS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const SuperRoute = Route$k.update({
  id: "/super",
  path: "/super",
  getParentRoute: () => Route$l
});
const LoginRoute = Route$j.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$l
});
const AdminRoute = Route$i.update({
  id: "/admin",
  path: "/admin",
  getParentRoute: () => Route$l
});
const IndexRoute = Route$h.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$l
});
const SuperIndexRoute = Route$g.update({
  id: "/super/",
  path: "/",
  getParentRoute: () => SuperRoute
});
const AdminIndexRoute = Route$f.update({
  id: "/admin/",
  path: "/",
  getParentRoute: () => AdminRoute
});
const SuperSettingsRoute = Route$e.update({
  id: "/super/settings",
  path: "/settings",
  getParentRoute: () => SuperRoute
});
const SuperHostelsRoute = Route$d.update({
  id: "/super/hostels",
  path: "/hostels",
  getParentRoute: () => SuperRoute
});
const SuperDashboardRoute = Route$c.update({
  id: "/super/dashboard",
  path: "/dashboard",
  getParentRoute: () => SuperRoute
});
const SuperAnalyticsRoute = Route$b.update({
  id: "/super/analytics",
  path: "/analytics",
  getParentRoute: () => SuperRoute
});
const AdminStaffRoute = Route$a.update({
  id: "/admin/staff",
  path: "/staff",
  getParentRoute: () => AdminRoute
});
const AdminSettingsRoute = Route$9.update({
  id: "/admin/settings",
  path: "/settings",
  getParentRoute: () => AdminRoute
});
const AdminReportsRoute = Route$8.update({
  id: "/admin/reports",
  path: "/reports",
  getParentRoute: () => AdminRoute
});
const AdminLeavesRoute = Route$7.update({
  id: "/admin/leaves",
  path: "/leaves",
  getParentRoute: () => AdminRoute
});
const AdminHostelsRoute = Route$6.update({
  id: "/admin/hostels",
  path: "/hostels",
  getParentRoute: () => AdminRoute
});
const AdminGuardsRoute = Route$5.update({
  id: "/admin/guards",
  path: "/guards",
  getParentRoute: () => AdminRoute
});
const AdminDashboardRoute = Route$4.update({
  id: "/admin/dashboard",
  path: "/dashboard",
  getParentRoute: () => AdminRoute
});
const AdminStudentsIndexRoute = Route$3.update({
  id: "/admin/students/",
  path: "/students/",
  getParentRoute: () => AdminRoute
});
const AdminTrackingReturnedRoute = Route$2.update({
  id: "/admin/tracking/returned",
  path: "/tracking/returned",
  getParentRoute: () => AdminRoute
});
const AdminTrackingOutsideRoute = Route$1.update({
  id: "/admin/tracking/outside",
  path: "/tracking/outside",
  getParentRoute: () => AdminRoute
});
const AdminStudentsImportRoute = Route.update({
  id: "/admin/students/import",
  path: "/students/import",
  getParentRoute: () => AdminRoute
});
const AdminRouteChildren = {
  AdminDashboardRoute,
  AdminGuardsRoute,
  AdminHostelsRoute,
  AdminLeavesRoute,
  AdminReportsRoute,
  AdminSettingsRoute,
  AdminStaffRoute,
  AdminIndexRoute,
  AdminStudentsImportRoute,
  AdminTrackingOutsideRoute,
  AdminTrackingReturnedRoute,
  AdminStudentsIndexRoute
};
const AdminRouteWithChildren = AdminRoute._addFileChildren(AdminRouteChildren);
const SuperRouteChildren = {
  SuperAnalyticsRoute,
  SuperDashboardRoute,
  SuperHostelsRoute,
  SuperSettingsRoute,
  SuperIndexRoute
};
const SuperRouteWithChildren = SuperRoute._addFileChildren(SuperRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  AdminRoute: AdminRouteWithChildren,
  LoginRoute,
  SuperRoute: SuperRouteWithChildren
};
const routeTree = Route$l._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  getTheme as a,
  setTheme as b,
  clearSession as c,
  getSession as g,
  initTheme as i,
  router as r,
  setSession as s
};
