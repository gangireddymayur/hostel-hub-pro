import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, useRouter, Link, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, redirect, createRouter } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
const appCss = "/assets/styles-DoBDQcsl.css";
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
  const router = useRouter();
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
            router.invalidate();
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
const Route$k = createRootRouteWithContext()({
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
  const { queryClient } = Route$k.useRouteContext();
  return /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(Outlet, {}) });
}
const $$splitComponentImporter$h = () => import("./super-CT5M-73G.mjs");
const Route$j = createFileRoute("/super")({
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
const $$splitComponentImporter$g = () => import("./admin-DVdj2yAR.mjs");
const Route$i = createFileRoute("/admin")({
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const $$splitComponentImporter$f = () => import("./index-BDvoXypK.mjs");
const Route$h = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "HostelOS - Login"
    }, {
      name: "description",
      content: "Secure portal for super admins and hostel admins."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
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
const $$splitComponentImporter$e = () => import("./settings-CWNUunsx.mjs");
const Route$e = createFileRoute("/super/settings")({
  head: () => ({
    meta: [{
      title: "Settings · HostelOS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./hostels-DpLxY6Ck.mjs");
const Route$d = createFileRoute("/super/hostels")({
  head: () => ({
    meta: [{
      title: "Hostel Management · HostelOS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./dashboard-DRzqXOF7.mjs");
const Route$c = createFileRoute("/super/dashboard")({
  head: () => ({
    meta: [{
      title: "Super Admin Dashboard · HostelOS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./analytics-B6xcYo1z.mjs");
const Route$b = createFileRoute("/super/analytics")({
  head: () => ({
    meta: [{
      title: "Analytics · HostelOS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./staff-9n8svke3.mjs");
const Route$a = createFileRoute("/admin/staff")({
  head: () => ({
    meta: [{
      title: "Staff · HostelOS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./settings-DlvlNF0O.mjs");
const Route$9 = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [{
      title: "Settings · HostelOS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./rooms-C1fy7WHg.mjs");
const Route$8 = createFileRoute("/admin/rooms")({
  head: () => ({
    meta: [{
      title: "Rooms · HostelOS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./reports-iI5EAv1E.mjs");
const Route$7 = createFileRoute("/admin/reports")({
  head: () => ({
    meta: [{
      title: "Reports · HostelOS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./leaves-TVSJagnU.mjs");
const Route$6 = createFileRoute("/admin/leaves")({
  head: () => ({
    meta: [{
      title: "Leave Requests · HostelOS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./guards-hy47q1_-.mjs");
const Route$5 = createFileRoute("/admin/guards")({
  head: () => ({
    meta: [{
      title: "Security Guards · HostelOS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./dashboard-DEWAU4wD.mjs");
const Route$4 = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [{
      title: "Dashboard · HostelOS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./index--UtGNXBN.mjs");
const Route$3 = createFileRoute("/admin/students/")({
  head: () => ({
    meta: [{
      title: "Students · HostelOS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./returned-I4BeWIIM.mjs");
const Route$2 = createFileRoute("/admin/tracking/returned")({
  head: () => ({
    meta: [{
      title: "Students Returned · HostelOS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./outside-Dz5cKJYY.mjs");
const Route$1 = createFileRoute("/admin/tracking/outside")({
  head: () => ({
    meta: [{
      title: "Students Outside · HostelOS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./import-BCwtC8TO.mjs");
const Route = createFileRoute("/admin/students/import")({
  head: () => ({
    meta: [{
      title: "Import Students · HostelOS"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const SuperRoute = Route$j.update({
  id: "/super",
  path: "/super",
  getParentRoute: () => Route$k
});
const AdminRoute = Route$i.update({
  id: "/admin",
  path: "/admin",
  getParentRoute: () => Route$k
});
const IndexRoute = Route$h.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$k
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
const AdminRoomsRoute = Route$8.update({
  id: "/admin/rooms",
  path: "/rooms",
  getParentRoute: () => AdminRoute
});
const AdminReportsRoute = Route$7.update({
  id: "/admin/reports",
  path: "/reports",
  getParentRoute: () => AdminRoute
});
const AdminLeavesRoute = Route$6.update({
  id: "/admin/leaves",
  path: "/leaves",
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
  AdminLeavesRoute,
  AdminReportsRoute,
  AdminRoomsRoute,
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
  SuperRoute: SuperRouteWithChildren
};
const routeTree = Route$k._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router;
};
export {
  getRouter
};
