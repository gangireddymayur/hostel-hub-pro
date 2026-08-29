import { QueryClientProvider, useQueryClient, useQuery, QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, redirect, useRouter, Link, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, useRouterState, useNavigate, createRouter } from "@tanstack/react-router";
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useEffect, useState, useMemo } from "react";
import { X, PanelLeft, LayoutDashboard, Building2, BarChart3, Settings, ClipboardList, MapPin, CheckCircle2, Users, FileSpreadsheet, UserCog, FileBarChart, LogOut, Moon, Sun, Search, Bell, User, FileText, ArrowRight, Calendar, Clock, ShieldCheck, Download, Printer, XCircle, Camera } from "lucide-react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { Toaster as Toaster$1, toast } from "sonner";
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip as Tooltip$1, Area } from "recharts";
const appCss = "/assets/styles-CDPvr0co.css";
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
const $$splitComponentImporter$g = () => import("./super-CLgfuYwl.mjs");
const Route$k = createFileRoute("/super")({
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const $$splitComponentImporter$f = () => import("./login-Uz_ppn5m.mjs");
const Route$j = createFileRoute("/login")({
  head: () => ({
    meta: [{
      title: "Hostel GATEX - Login"
    }, {
      name: "description",
      content: "Secure portal for super admins and hostel admins."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const $$splitComponentImporter$e = () => import("./admin-Cf6_L1GP.mjs");
const Route$i = createFileRoute("/admin")({
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
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
const $$splitComponentImporter$d = () => import("./settings-Cm7SwoVv.mjs");
const Route$e = createFileRoute("/super/settings")({
  head: () => ({
    meta: [{
      title: "Settings · Hostel GATEX"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./hostels-CPMIcUtM.mjs");
const Route$d = createFileRoute("/super/hostels")({
  head: () => ({
    meta: [{
      title: "Hostel Management · Hostel GATEX"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./dashboard-CZZUc_XP.mjs");
const Route$c = createFileRoute("/super/dashboard")({
  head: () => ({
    meta: [{
      title: "Super Admin Dashboard · Hostel GATEX"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./analytics-CZ8DY6bn.mjs");
const Route$b = createFileRoute("/super/analytics")({
  head: () => ({
    meta: [{
      title: "Analytics · Hostel GATEX"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./staff-AFrCSfJY.mjs");
const Route$a = createFileRoute("/admin/staff")({
  head: () => ({
    meta: [{
      title: "Staff · Hostel GATEX"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./settings-KcYuV-re.mjs");
const Route$9 = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [{
      title: "Settings · Hostel GATEX"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const MOBILE_BREAKPOINT = 768;
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(void 0);
  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return !!isMobile;
}
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx(Comp, { className: cn(buttonVariants({ variant, size, className })), ref, ...props });
  }
);
Button.displayName = "Button";
const Input = React.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "input",
      {
        type,
        className: cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";
const Separator = React.forwardRef(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => /* @__PURE__ */ jsx(
  SeparatorPrimitive.Root,
  {
    ref,
    decorative,
    orientation,
    className: cn(
      "shrink-0 bg-border",
      orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
      className
    ),
    ...props
  }
));
Separator.displayName = SeparatorPrimitive.Root.displayName;
const Sheet = SheetPrimitive.Root;
const SheetPortal = SheetPrimitive.Portal;
const SheetOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SheetPrimitive.Overlay,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;
const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
      }
    },
    defaultVariants: {
      side: "right"
    }
  }
);
const SheetContent = React.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ jsxs(SheetPortal, { children: [
  /* @__PURE__ */ jsx(SheetOverlay, {}),
  /* @__PURE__ */ jsxs(SheetPrimitive.Content, { ref, className: cn(sheetVariants({ side }), className), ...props, children: [
    /* @__PURE__ */ jsxs(SheetPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary", children: [
      /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
    ] }),
    children
  ] })
] }));
SheetContent.displayName = SheetPrimitive.Content.displayName;
const SheetHeader = ({ className, ...props }) => /* @__PURE__ */ jsx("div", { className: cn("flex flex-col space-y-2 text-center sm:text-left", className), ...props });
SheetHeader.displayName = "SheetHeader";
const SheetTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SheetPrimitive.Title,
  {
    ref,
    className: cn("text-lg font-semibold text-foreground", className),
    ...props
  }
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;
const SheetDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SheetPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;
function Skeleton({ className, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn("animate-pulse rounded-md bg-primary/10", className), ...props });
}
const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(TooltipPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  TooltipPrimitive.Content,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-tooltip-content-transform-origin)",
      className
    ),
    ...props
  }
) }));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;
const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";
const SidebarContext = React.createContext(null);
function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}
const SidebarProvider = React.forwardRef(
  ({
    defaultOpen = true,
    open: openProp,
    onOpenChange: setOpenProp,
    className,
    style,
    children,
    ...props
  }, ref) => {
    const isMobile = useIsMobile();
    const [openMobile, setOpenMobile] = React.useState(false);
    const [_open, _setOpen] = React.useState(defaultOpen);
    const open = openProp ?? _open;
    const setOpen = React.useCallback(
      (value) => {
        const openState = typeof value === "function" ? value(open) : value;
        if (setOpenProp) {
          setOpenProp(openState);
        } else {
          _setOpen(openState);
        }
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
      },
      [setOpenProp, open]
    );
    const toggleSidebar = React.useCallback(() => {
      return isMobile ? setOpenMobile((open2) => !open2) : setOpen((open2) => !open2);
    }, [isMobile, setOpen, setOpenMobile]);
    React.useEffect(() => {
      const handleKeyDown = (event) => {
        if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          toggleSidebar();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [toggleSidebar]);
    const state = open ? "expanded" : "collapsed";
    const contextValue = React.useMemo(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
    );
    return /* @__PURE__ */ jsx(SidebarContext.Provider, { value: contextValue, children: /* @__PURE__ */ jsx(TooltipProvider, { delayDuration: 0, children: /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          "--sidebar-width": SIDEBAR_WIDTH,
          "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
          ...style
        },
        className: cn(
          "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar",
          className
        ),
        ref,
        ...props,
        children
      }
    ) }) });
  }
);
SidebarProvider.displayName = "SidebarProvider";
const Sidebar = React.forwardRef(
  ({
    side = "left",
    variant = "sidebar",
    collapsible = "offcanvas",
    className,
    children,
    ...props
  }, ref) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
    if (collapsible === "none") {
      return /* @__PURE__ */ jsx(
        "div",
        {
          className: cn(
            "flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground",
            className
          ),
          ref,
          ...props,
          children
        }
      );
    }
    if (isMobile) {
      return /* @__PURE__ */ jsx(Sheet, { open: openMobile, onOpenChange: setOpenMobile, ...props, children: /* @__PURE__ */ jsxs(
        SheetContent,
        {
          "data-sidebar": "sidebar",
          "data-mobile": "true",
          className: "w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden",
          style: {
            "--sidebar-width": SIDEBAR_WIDTH_MOBILE
          },
          side,
          children: [
            /* @__PURE__ */ jsxs(SheetHeader, { className: "sr-only", children: [
              /* @__PURE__ */ jsx(SheetTitle, { children: "Sidebar" }),
              /* @__PURE__ */ jsx(SheetDescription, { children: "Displays the mobile sidebar." })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex h-full w-full flex-col", children })
          ]
        }
      ) });
    }
    return /* @__PURE__ */ jsxs(
      "div",
      {
        ref,
        className: "group peer hidden text-sidebar-foreground md:block",
        "data-state": state,
        "data-collapsible": state === "collapsed" ? collapsible : "",
        "data-variant": variant,
        "data-side": side,
        children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: cn(
                "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
                "group-data-[collapsible=offcanvas]:w-0",
                "group-data-[side=right]:rotate-180",
                variant === "floating" || variant === "inset" ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
              )
            }
          ),
          /* @__PURE__ */ jsx(
            "div",
            {
              className: cn(
                "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
                side === "left" ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]" : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
                // Adjust the padding for floating and inset variants.
                variant === "floating" || variant === "inset" ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
                className
              ),
              ...props,
              children: /* @__PURE__ */ jsx(
                "div",
                {
                  "data-sidebar": "sidebar",
                  className: "flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow",
                  children
                }
              )
            }
          )
        ]
      }
    );
  }
);
Sidebar.displayName = "Sidebar";
const SidebarTrigger = React.forwardRef(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();
  return /* @__PURE__ */ jsxs(
    Button,
    {
      ref,
      "data-sidebar": "trigger",
      variant: "ghost",
      size: "icon",
      className: cn("h-7 w-7", className),
      onClick: (event) => {
        onClick?.(event);
        toggleSidebar();
      },
      ...props,
      children: [
        /* @__PURE__ */ jsx(PanelLeft, {}),
        /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Toggle Sidebar" })
      ]
    }
  );
});
SidebarTrigger.displayName = "SidebarTrigger";
const SidebarRail = React.forwardRef(
  ({ className, ...props }, ref) => {
    const { toggleSidebar } = useSidebar();
    return /* @__PURE__ */ jsx(
      "button",
      {
        ref,
        "data-sidebar": "rail",
        "aria-label": "Toggle Sidebar",
        tabIndex: -1,
        onClick: toggleSidebar,
        title: "Toggle Sidebar",
        className: cn(
          "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
          "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
          "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
          "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar",
          "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
          "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
          className
        ),
        ...props
      }
    );
  }
);
SidebarRail.displayName = "SidebarRail";
const SidebarInset = React.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "main",
      {
        ref,
        className: cn(
          "relative flex w-full flex-1 flex-col bg-background",
          "md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
          className
        ),
        ...props
      }
    );
  }
);
SidebarInset.displayName = "SidebarInset";
const SidebarInput = React.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    Input,
    {
      ref,
      "data-sidebar": "input",
      className: cn(
        "h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        className
      ),
      ...props
    }
  );
});
SidebarInput.displayName = "SidebarInput";
const SidebarHeader = React.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "div",
      {
        ref,
        "data-sidebar": "header",
        className: cn("flex flex-col gap-2 p-2", className),
        ...props
      }
    );
  }
);
SidebarHeader.displayName = "SidebarHeader";
const SidebarFooter = React.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "div",
      {
        ref,
        "data-sidebar": "footer",
        className: cn("flex flex-col gap-2 p-2", className),
        ...props
      }
    );
  }
);
SidebarFooter.displayName = "SidebarFooter";
const SidebarSeparator = React.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    Separator,
    {
      ref,
      "data-sidebar": "separator",
      className: cn("mx-2 w-auto bg-sidebar-border", className),
      ...props
    }
  );
});
SidebarSeparator.displayName = "SidebarSeparator";
const SidebarContent = React.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "div",
      {
        ref,
        "data-sidebar": "content",
        className: cn(
          "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
          className
        ),
        ...props
      }
    );
  }
);
SidebarContent.displayName = "SidebarContent";
const SidebarGroup = React.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "div",
      {
        ref,
        "data-sidebar": "group",
        className: cn("relative flex w-full min-w-0 flex-col p-2", className),
        ...props
      }
    );
  }
);
SidebarGroup.displayName = "SidebarGroup";
const SidebarGroupLabel = React.forwardRef(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      ref,
      "data-sidebar": "group-label",
      className: cn(
        "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className
      ),
      ...props
    }
  );
});
SidebarGroupLabel.displayName = "SidebarGroupLabel";
const SidebarGroupAction = React.forwardRef(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      ref,
      "data-sidebar": "group-action",
      className: cn(
        "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring cursor-pointer transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "group-data-[collapsible=icon]:hidden",
        className
      ),
      ...props
    }
  );
});
SidebarGroupAction.displayName = "SidebarGroupAction";
const SidebarGroupContent = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(
    "div",
    {
      ref,
      "data-sidebar": "group-content",
      className: cn("w-full text-sm", className),
      ...props
    }
  )
);
SidebarGroupContent.displayName = "SidebarGroupContent";
const SidebarMenu = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(
    "ul",
    {
      ref,
      "data-sidebar": "menu",
      className: cn("flex w-full min-w-0 flex-col gap-1", className),
      ...props
    }
  )
);
SidebarMenu.displayName = "SidebarMenu";
const SidebarMenuItem = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(
    "li",
    {
      ref,
      "data-sidebar": "menu-item",
      className: cn("group/menu-item relative", className),
      ...props
    }
  )
);
SidebarMenuItem.displayName = "SidebarMenuItem";
const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring cursor-pointer transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline: "bg-background shadow-[0_0_0_1px_var(--sidebar-border)] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_var(--sidebar-accent)]"
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const SidebarMenuButton = React.forwardRef(
  ({
    asChild = false,
    isActive = false,
    variant = "default",
    size = "default",
    tooltip,
    className,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    const { isMobile, state } = useSidebar();
    const button = /* @__PURE__ */ jsx(
      Comp,
      {
        ref,
        "data-sidebar": "menu-button",
        "data-size": size,
        "data-active": isActive,
        className: cn(sidebarMenuButtonVariants({ variant, size }), className),
        ...props
      }
    );
    if (!tooltip) {
      return button;
    }
    if (typeof tooltip === "string") {
      tooltip = {
        children: tooltip
      };
    }
    return /* @__PURE__ */ jsxs(Tooltip, { children: [
      /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: button }),
      /* @__PURE__ */ jsx(
        TooltipContent,
        {
          side: "right",
          align: "center",
          hidden: state !== "collapsed" || isMobile,
          ...tooltip
        }
      )
    ] });
  }
);
SidebarMenuButton.displayName = "SidebarMenuButton";
const SidebarMenuAction = React.forwardRef(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      ref,
      "data-sidebar": "menu-action",
      className: cn(
        "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring cursor-pointer transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover && "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0",
        className
      ),
      ...props
    }
  );
});
SidebarMenuAction.displayName = "SidebarMenuAction";
const SidebarMenuBadge = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(
    "div",
    {
      ref,
      "data-sidebar": "menu-badge",
      className: cn(
        "pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground",
        "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        className
      ),
      ...props
    }
  )
);
SidebarMenuBadge.displayName = "SidebarMenuBadge";
const SidebarMenuSkeleton = React.forwardRef(({ className, showIcon = false, ...props }, ref) => {
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, []);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref,
      "data-sidebar": "menu-skeleton",
      className: cn("flex h-8 items-center gap-2 rounded-md px-2", className),
      ...props,
      children: [
        showIcon && /* @__PURE__ */ jsx(Skeleton, { className: "size-4 rounded-md", "data-sidebar": "menu-skeleton-icon" }),
        /* @__PURE__ */ jsx(
          Skeleton,
          {
            className: "h-4 max-w-(--skeleton-width) flex-1",
            "data-sidebar": "menu-skeleton-text",
            style: {
              "--skeleton-width": width
            }
          }
        )
      ]
    }
  );
});
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton";
const SidebarMenuSub = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(
    "ul",
    {
      ref,
      "data-sidebar": "menu-sub",
      className: cn(
        "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className
      ),
      ...props
    }
  )
);
SidebarMenuSub.displayName = "SidebarMenuSub";
const SidebarMenuSubItem = React.forwardRef(
  ({ ...props }, ref) => /* @__PURE__ */ jsx("li", { ref, ...props })
);
SidebarMenuSubItem.displayName = "SidebarMenuSubItem";
const SidebarMenuSubButton = React.forwardRef(({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      ref,
      "data-sidebar": "menu-sub-button",
      "data-size": size,
      "data-active": isActive,
      className: cn(
        "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className
      ),
      ...props
    }
  );
});
SidebarMenuSubButton.displayName = "SidebarMenuSubButton";
const DEFAULT_BASE_URL = "/api";
const API_BASE_URL = DEFAULT_BASE_URL;
async function parseJson(response) {
  const text = await response.text();
  if (!text) return void 0;
  return JSON.parse(text);
}
async function rawRequest(path, options = {}) {
  const session = getSession();
  const headers = new Headers(options.headers);
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (options.auth !== false && session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }
  if (options.body && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const body = options.body && !isFormData && typeof options.body === "object" && !(options.body instanceof Blob) ? JSON.stringify(options.body) : options.body ?? void 0;
  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body
  });
}
async function request(path, options = {}, retry = true) {
  const response = await rawRequest(path, options);
  if (response.status === 401 && retry && options.auth !== false) {
    const session = getSession();
    if (session?.refreshToken && await refreshAccessToken(session.refreshToken)) {
      return request(path, options, false);
    }
  }
  return handleResponse(response);
}
async function handleResponse(response) {
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.clone().json();
      message = body.message ?? body.error ?? message;
    } catch {
      const text = await response.text();
      if (text) message = text;
    }
    throw new Error(message);
  }
  return parseJson(response);
}
async function refreshAccessToken(refreshToken) {
  try {
    const response = await rawRequest("/auth/refresh", {
      method: "POST",
      auth: false,
      body: { refreshToken }
    });
    if (!response.ok) return false;
    const data = await response.json();
    const current = getSession();
    if (current) {
      setSession({
        ...current,
        accessToken: data.accessToken
      });
    }
    return true;
  } catch {
    clearSession();
    return false;
  }
}
async function login(payload) {
  const data = await request("/auth/login", {
    method: "POST",
    auth: false,
    body: payload
  });
  setSession(data);
  return data;
}
async function logout() {
  const session = getSession();
  if (session?.refreshToken) {
    try {
      await rawRequest("/auth/logout", {
        method: "POST",
        auth: false,
        body: { refreshToken: session.refreshToken }
      });
    } catch {
    }
  }
  clearSession();
}
async function changePassword(payload) {
  return request("/auth/change-password", {
    method: "POST",
    body: payload
  });
}
async function getSuperHostels() {
  return request("/super-admin/hostels");
}
async function createHostel(payload) {
  return request("/super-admin/hostels", {
    method: "POST",
    body: payload
  });
}
async function updateHostel(hostelId, payload) {
  return request(`/super-admin/hostels/${hostelId}`, {
    method: "PATCH",
    body: payload
  });
}
async function deleteHostel(hostelId) {
  return request(`/super-admin/hostels/${hostelId}`, {
    method: "DELETE"
  });
}
async function setHostelStatus(hostelId, status) {
  return request(`/super-admin/hostels/${hostelId}/status`, {
    method: "PATCH",
    body: { status }
  });
}
async function getSuperAnalytics() {
  return request("/super-admin/analytics");
}
async function getHostelDashboard() {
  return request("/hostel-admin/dashboard");
}
async function getHostelStudents() {
  return request("/hostel-admin/students");
}
async function createStudent(payload) {
  return request("/hostel-admin/students", {
    method: "POST",
    body: payload
  });
}
async function updateStudent(studentId, payload) {
  return request(`/hostel-admin/students/${studentId}`, {
    method: "PATCH",
    body: payload
  });
}
async function deleteStudent(studentId) {
  return request(`/hostel-admin/students/${studentId}`, {
    method: "DELETE"
  });
}
async function importStudents(file) {
  const formData = new FormData();
  formData.append("file", file);
  return request("/hostel-admin/students/import", {
    method: "POST",
    body: formData
  });
}
async function uploadStudentPhoto(studentId, file) {
  const formData = new FormData();
  formData.append("photo", file);
  return request(`/hostel-admin/students/${studentId}/photo`, {
    method: "POST",
    body: formData
  });
}
async function uploadParentPhoto(studentId, file) {
  const formData = new FormData();
  formData.append("photo", file);
  return request(`/hostel-admin/students/${studentId}/parent-photo`, {
    method: "POST",
    body: formData
  });
}
async function bulkUploadPhotos(photos) {
  return request("/hostel-admin/students/photos/bulk", {
    method: "POST",
    body: { photos }
  });
}
async function getHostelStaff() {
  return request("/hostel-admin/staff");
}
async function uploadStaffPhoto(id, file) {
  const formData = new FormData();
  formData.append("photo", file);
  return request(`/hostel-admin/staff/${id}/photo`, {
    method: "POST",
    body: formData
  });
}
async function createStaff(payload) {
  return request("/hostel-admin/staff", {
    method: "POST",
    body: payload
  });
}
async function updateStaff(id, payload) {
  return request(`/hostel-admin/staff/${id}`, {
    method: "PATCH",
    body: payload
  });
}
async function deleteStaff(id) {
  return request(`/hostel-admin/staff/${id}`, {
    method: "DELETE"
  });
}
async function getLeaveRequests() {
  return request("/hostel-admin/leave-requests");
}
async function reviewLeaveRequest(leaveRequestId, payload) {
  return request(`/hostel-admin/leave-requests/${leaveRequestId}/review`, {
    method: "PATCH",
    body: payload
  });
}
async function bulkReviewLeaveRequests(payload) {
  return request("/hostel-admin/leave-requests/bulk-review", {
    method: "POST",
    body: payload
  });
}
async function getHostels() {
  return request("/hostels");
}
async function getHostelReports() {
  return request("/hostel-admin/reports");
}
const superNav = [
  { to: "/super/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/super/hostels", label: "Hostel Management", icon: Building2 },
  { to: "/super/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/super/settings", label: "Settings", icon: Settings }
];
const adminNav = [
  { group: "Overview", items: [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/leaves", label: "Permission Requests", icon: ClipboardList },
    { to: "/admin/tracking/outside", label: "Students Outside", icon: MapPin },
    { to: "/admin/tracking/returned", label: "Students Returned", icon: CheckCircle2 }
  ] },
  { group: "Management", items: [
    { to: "/admin/students", label: "Students", icon: Users },
    { to: "/admin/students/import", label: "Import Students", icon: FileSpreadsheet },
    { to: "/admin/hostels", label: "Hostels", icon: Building2 },
    { to: "/admin/staff", label: "Staff", icon: UserCog }
  ] },
  { group: "Insights", items: [
    { to: "/admin/reports", label: "Reports", icon: FileBarChart },
    { to: "/admin/settings", label: "Settings", icon: Settings }
  ] }
];
function AppSidebar({ role }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isActive = (to) => {
    if (path === to) return true;
    if (to === "/admin/students" && path.startsWith("/admin/students/import")) return false;
    return path.startsWith(to + "/");
  };
  return /* @__PURE__ */ jsxs(Sidebar, { collapsible: "icon", children: [
    /* @__PURE__ */ jsx(SidebarHeader, { className: "border-b border-sidebar-border", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 px-2 py-2", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: "/gatex-logo.jpg",
          alt: "Logo",
          className: "h-8 w-8 rounded-lg object-cover shadow-sm group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8"
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden", children: [
        /* @__PURE__ */ jsx("span", { className: "truncate font-semibold tracking-wide", children: "Hostel GATEX" }),
        /* @__PURE__ */ jsx("span", { className: "truncate text-xs text-muted-foreground", children: role === "super" ? "Super Admin" : "Hostel Admin" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(SidebarContent, { children: role === "super" ? /* @__PURE__ */ jsxs(SidebarGroup, { children: [
      /* @__PURE__ */ jsx(SidebarGroupLabel, { children: "Platform" }),
      /* @__PURE__ */ jsx(SidebarGroupContent, { children: /* @__PURE__ */ jsx(SidebarMenu, { children: superNav.map((i) => /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsx(SidebarMenuButton, { asChild: true, isActive: isActive(i.to), tooltip: i.label, children: /* @__PURE__ */ jsxs(Link, { to: i.to, children: [
        /* @__PURE__ */ jsx(i.icon, {}),
        /* @__PURE__ */ jsx("span", { children: i.label })
      ] }) }) }, i.to)) }) })
    ] }) : adminNav.map((g) => /* @__PURE__ */ jsxs(SidebarGroup, { children: [
      /* @__PURE__ */ jsx(SidebarGroupLabel, { children: g.group }),
      /* @__PURE__ */ jsx(SidebarGroupContent, { children: /* @__PURE__ */ jsx(SidebarMenu, { children: g.items.map((i) => /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsx(SidebarMenuButton, { asChild: true, isActive: isActive(i.to), tooltip: i.label, children: /* @__PURE__ */ jsxs(Link, { to: i.to, children: [
        /* @__PURE__ */ jsx(i.icon, {}),
        /* @__PURE__ */ jsx("span", { children: i.label })
      ] }) }) }, i.to)) }) })
    ] }, g.group)) }),
    /* @__PURE__ */ jsx(SidebarFooter, { className: "border-t border-sidebar-border", children: /* @__PURE__ */ jsxs(
      Button,
      {
        variant: "ghost",
        size: "sm",
        className: "justify-start gap-2",
        onClick: async () => {
          await logout();
          queryClient.clear();
          clearSession();
          navigate({ to: "/login" });
        },
        children: [
          /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { className: "group-data-[collapsible=icon]:hidden", children: "Sign out" })
        ]
      }
    ) })
  ] });
}
function ThemeToggle() {
  const [theme, setT] = useState("light");
  useEffect(() => setT(getTheme()), []);
  return /* @__PURE__ */ jsx(
    Button,
    {
      variant: "ghost",
      size: "icon",
      onClick: () => {
        const next = theme === "light" ? "dark" : "light";
        setTheme(next);
        setT(next);
      },
      "aria-label": "Toggle theme",
      children: theme === "light" ? /* @__PURE__ */ jsx(Moon, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Sun, { className: "h-4 w-4" })
    }
  );
}
const Avatar = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AvatarPrimitive.Root,
  {
    ref,
    className: cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className),
    ...props
  }
));
Avatar.displayName = AvatarPrimitive.Root.displayName;
const AvatarImage = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AvatarPrimitive.Image,
  {
    ref,
    className: cn("aspect-square h-full w-full", className),
    ...props
  }
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;
const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AvatarPrimitive.Fallback,
  {
    ref,
    className: cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    ),
    ...props
  }
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
function DashboardShell({ expectedRole, children }) {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    initTheme();
    const syncSession = () => {
      const session = getSession();
      if (!session) {
        setReady(false);
        navigate({ to: "/login" });
        return;
      }
      const r = session.profile.role === "SUPER_ADMIN" ? "super" : "admin";
      if (r !== expectedRole) {
        setReady(false);
        navigate({ to: "/login" });
        return;
      }
      setReady(true);
    };
    syncSession();
    window.addEventListener("hlms-auth-change", syncSession);
    return () => window.removeEventListener("hlms-auth-change", syncSession);
  }, [expectedRole, navigate]);
  if (!ready) return null;
  return /* @__PURE__ */ jsxs(SidebarProvider, { children: [
    /* @__PURE__ */ jsx(AppSidebar, { role: expectedRole }),
    /* @__PURE__ */ jsxs(SidebarInset, { children: [
      /* @__PURE__ */ jsxs("header", { className: "sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur", children: [
        /* @__PURE__ */ jsx(SidebarTrigger, {}),
        /* @__PURE__ */ jsxs("div", { className: "relative hidden flex-1 max-w-md md:block", children: [
          /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
          /* @__PURE__ */ jsx(Input, { placeholder: "Search…", className: "h-9 pl-9" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "ml-auto flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(ThemeToggle, {}),
          /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", "aria-label": "Notifications", children: /* @__PURE__ */ jsx(Bell, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx(Avatar, { className: "h-8 w-8", children: /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-primary text-primary-foreground text-xs", children: expectedRole === "super" ? "SA" : "HA" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("main", { className: "flex-1 p-4 md:p-6", children: children ?? /* @__PURE__ */ jsx(Outlet, {}) }),
      /* @__PURE__ */ jsx(Toaster, { richColors: true, position: "top-right" })
    ] })
  ] });
}
function PageHeader({ title, description, action }) {
  return /* @__PURE__ */ jsxs("div", { className: "mb-6 flex flex-wrap items-end justify-between gap-3", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold tracking-tight text-foreground", children: title }),
      description && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: description })
    ] }),
    action
  ] });
}
const Card = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(
    "div",
    {
      ref,
      className: cn("rounded-xl border bg-card text-card-foreground shadow", className),
      ...props
    }
  )
);
Card.displayName = "Card";
const CardHeader = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", { ref, className: cn("flex flex-col space-y-1.5 p-6", className), ...props })
);
CardHeader.displayName = "CardHeader";
const CardTitle = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(
    "div",
    {
      ref,
      className: cn("font-semibold leading-none tracking-tight", className),
      ...props
    }
  )
);
CardTitle.displayName = "CardTitle";
const CardDescription = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", { ref, className: cn("text-sm text-muted-foreground", className), ...props })
);
CardDescription.displayName = "CardDescription";
const CardContent = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", { ref, className: cn("p-6 pt-0", className), ...props })
);
CardContent.displayName = "CardContent";
const CardFooter = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", { ref, className: cn("flex items-center p-6 pt-0", className), ...props })
);
CardFooter.displayName = "CardFooter";
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({ className, variant, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn(badgeVariants({ variant }), className), ...props });
}
const Dialog = SheetPrimitive.Root;
const DialogTrigger = SheetPrimitive.Trigger;
const DialogPortal = SheetPrimitive.Portal;
const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SheetPrimitive.Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = SheetPrimitive.Overlay.displayName;
const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsx(DialogOverlay, {}),
  /* @__PURE__ */ jsxs(
    SheetPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxs(SheetPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", children: [
          /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
DialogContent.displayName = SheetPrimitive.Content.displayName;
const DialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsx("div", { className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className), ...props });
DialogHeader.displayName = "DialogHeader";
const DialogFooter = ({ className, ...props }) => /* @__PURE__ */ jsx(
  "div",
  {
    className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
    ...props
  }
);
DialogFooter.displayName = "DialogFooter";
const DialogTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SheetPrimitive.Title,
  {
    ref,
    className: cn("text-lg font-semibold leading-none tracking-tight", className),
    ...props
  }
));
DialogTitle.displayName = SheetPrimitive.Title.displayName;
const DialogDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SheetPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DialogDescription.displayName = SheetPrimitive.Description.displayName;
const Route$8 = createFileRoute("/admin/reports")({
  head: () => ({ meta: [{ title: "Reports · Hostel GATEX" }] }),
  component: Reports
});
function Reports() {
  const reportsQuery = useQuery({ queryKey: ["hostel-reports"], queryFn: getHostelReports });
  const leavesQuery = useQuery({ queryKey: ["hostel-leaves"], queryFn: getLeaveRequests });
  const studentsQuery = useQuery({ queryKey: ["hostel-students"], queryFn: getHostelStudents });
  const leaves = leavesQuery.data?.data ?? [];
  const students = studentsQuery.data?.data ?? [];
  const [modalOpen, setModalOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState("Comprehensive Permission & Audit Report");
  const [scopeMode, setScopeMode] = useState("ALL");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [datePreset, setDatePreset] = useState("thisMonth");
  const [fromDate, setFromDate] = useState(() => {
    const d = /* @__PURE__ */ new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = useState(() => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [zoomedPhoto, setZoomedPhoto] = useState(null);
  const handlePresetChange = (preset) => {
    setDatePreset(preset);
    const today = /* @__PURE__ */ new Date();
    const todayStr = today.toISOString().slice(0, 10);
    if (preset === "today") {
      setFromDate(todayStr);
      setToDate(todayStr);
    } else if (preset === "yesterday") {
      const y = /* @__PURE__ */ new Date();
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().slice(0, 10);
      setFromDate(yStr);
      setToDate(yStr);
    } else if (preset === "last7") {
      const d = /* @__PURE__ */ new Date();
      d.setDate(d.getDate() - 7);
      setFromDate(d.toISOString().slice(0, 10));
      setToDate(todayStr);
    } else if (preset === "thisMonth") {
      const d = /* @__PURE__ */ new Date();
      d.setDate(1);
      setFromDate(d.toISOString().slice(0, 10));
      setToDate(todayStr);
    } else if (preset === "last30") {
      const d = /* @__PURE__ */ new Date();
      d.setDate(d.getDate() - 30);
      setFromDate(d.toISOString().slice(0, 10));
      setToDate(todayStr);
    } else if (preset === "all") {
      setFromDate("2020-01-01");
      setToDate(todayStr);
    }
  };
  const openCustomReport = (type, studentId) => {
    if (type === "daily") {
      setReportTitle("Daily Permission & Movement Audit Report");
      setScopeMode("ALL");
      handlePresetChange("today");
      setStatusFilter("ALL");
    } else if (type === "monthly") {
      setReportTitle("Monthly Permission & Movement Audit Report");
      setScopeMode("ALL");
      handlePresetChange("thisMonth");
      setStatusFilter("ALL");
    } else if (type === "outside") {
      setReportTitle("Students Currently Outside Hostel - Movement Report");
      setScopeMode("ALL");
      handlePresetChange("all");
      setStatusFilter("OUT");
    } else if (type === "exits") {
      setReportTitle("Gate Security Exit Activity Report");
      setScopeMode("ALL");
      handlePresetChange("last30");
      setStatusFilter("ALL");
    } else if (type === "returns") {
      setReportTitle("Gate Security Return & Entry Log Report");
      setScopeMode("ALL");
      handlePresetChange("last30");
      setStatusFilter("RETURNED");
    } else if (type === "student") {
      setReportTitle("Individual Student Permission & Audit Dossier");
      setScopeMode("SINGLE");
      handlePresetChange("all");
      setStatusFilter("ALL");
    } else {
      setReportTitle("Comprehensive Permission & Movement Audit Report");
      setScopeMode("ALL");
      handlePresetChange("thisMonth");
      setStatusFilter("ALL");
    }
    setModalOpen(true);
  };
  const filteredStudentsList = useMemo(() => {
    if (!studentSearchTerm.trim()) return students;
    const term = studentSearchTerm.toLowerCase();
    return students.filter(
      (s) => s.name && s.name.toLowerCase().includes(term) || s.student_id && s.student_id.toLowerCase().includes(term) || s.room_number && s.room_number.toLowerCase().includes(term) || s.mobile && s.mobile.includes(term)
    );
  }, [students, studentSearchTerm]);
  const selectedStudentObj = useMemo(() => {
    if (!selectedStudentId) return null;
    return students.find((s) => s.id === selectedStudentId || s.student_id === selectedStudentId) ?? null;
  }, [students, selectedStudentId]);
  const filteredLeaves = useMemo(() => {
    return leaves.filter((leave) => {
      if (scopeMode === "SINGLE") {
        if (selectedStudentId) {
          const matchId = leave.student?.id === selectedStudentId || leave.student?.student_id?.toLowerCase() === selectedStudentId.toLowerCase() || leave.student_id === selectedStudentId;
          if (!matchId) return false;
        }
      }
      const leaveDate = (leave.created_at || leave.from_date || "").slice(0, 10);
      if (fromDate && leaveDate && leaveDate < fromDate) return false;
      if (toDate && leaveDate && leaveDate > toDate) return false;
      if (statusFilter === "APPROVED" && leave.final_status !== "APPROVED") return false;
      if (statusFilter === "PENDING" && leave.final_status !== "PENDING") return false;
      if (statusFilter === "REJECTED" && leave.final_status !== "REJECTED") return false;
      if (statusFilter === "OUT") {
        const isOut = leave.gatePass?.status === "OUT" || leave.gatePass?.out_time_actual && !leave.gatePass?.in_time_actual;
        if (!isOut) return false;
      }
      if (statusFilter === "RETURNED") {
        const isReturned = Boolean(leave.gatePass?.in_time_actual);
        if (!isReturned) return false;
      }
      return true;
    });
  }, [leaves, scopeMode, selectedStudentId, fromDate, toDate, statusFilter]);
  const chartData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, index) => {
      const dayIndex = (index + 1) % 7;
      const dayLeaves = leaves.filter((leave) => new Date(leave.created_at).getDay() === dayIndex);
      return {
        day,
        approved: dayLeaves.filter((leave) => leave.final_status === "APPROVED").length
      };
    });
  }, [leaves]);
  const handleExportCsv = () => {
    if (filteredLeaves.length === 0) {
      toast.error("No records match the current filters to export.");
      return;
    }
    const headers = [
      "Student ID",
      "Student Name",
      "Room Number",
      "Student Mobile",
      "Parent Mobile",
      "Hostel Name",
      "Request Type",
      "Reason",
      "From Date",
      "To Date",
      "Created At",
      "Student Lat",
      "Student Lng",
      "Parent Status",
      "Parent Reject Reason",
      "Parent Lat",
      "Parent Lng",
      "Parent Live Photo Attached",
      "Hostel Status",
      "Hostel Note",
      "Hostel Lat",
      "Hostel Lng",
      "Final Status",
      "Pass Number",
      "Out Time Actual",
      "In Time Actual",
      "Out Guard Lat",
      "Out Guard Lng",
      "In Guard Lat",
      "In Guard Lng"
    ];
    const dataRows = filteredLeaves.map((l) => [
      l.student?.student_id ?? l.student_id ?? "",
      l.student?.name ?? "",
      l.student?.room_number ?? "",
      l.student?.mobile ?? "",
      l.student?.parent_mobile ?? "",
      l.student?.hostel_name ?? "",
      l.request_type ?? "LEAVE",
      l.reason ?? "",
      l.from_date ?? "",
      l.to_date ?? "",
      l.created_at ?? "",
      String(l.student_lat ?? ""),
      String(l.student_lng ?? ""),
      l.parent_status ?? "",
      l.parent_reject_reason ?? "",
      String(l.parent_lat ?? ""),
      String(l.parent_lng ?? ""),
      l.parent_approval_photo ? "YES" : "NO",
      l.hostel_status ?? "",
      l.note ?? l.hostel_reject_reason ?? "",
      String(l.hostel_lat ?? ""),
      String(l.hostel_lng ?? ""),
      l.final_status ?? "",
      l.gatePass?.pass_number ?? "",
      l.gatePass?.out_time_actual ?? "",
      l.gatePass?.in_time_actual ?? "",
      String(l.gatePass?.out_guard_lat ?? ""),
      String(l.gatePass?.out_guard_lng ?? ""),
      String(l.gatePass?.in_guard_lat ?? ""),
      String(l.gatePass?.in_guard_lng ?? "")
    ]);
    const content = [
      headers.join(","),
      ...dataRows.map(
        (row) => row.map((val) => {
          const strVal = String(val ?? "");
          return `"${strVal.replaceAll('"', '""')}"`;
        }).join(",")
      )
    ].join("\n");
    const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const filename = `hostel_gatex_audit_report_${fromDate}_to_${toDate}.csv`;
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredLeaves.length} records to CSV`);
  };
  const handlePrintPdf = () => {
    window.print();
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "print:hidden", children: [
      /* @__PURE__ */ jsx(
        PageHeader,
        {
          title: "Reports & Audit Logs",
          description: "Generate comprehensive student dossiers, multi-point audit timelines, and high-resolution PDF reports."
        }
      ),
      /* @__PURE__ */ jsx(Card, { className: "mb-6 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10 shadow-sm", children: /* @__PURE__ */ jsxs(CardContent, { className: "flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Badge, { className: "bg-primary text-primary-foreground", children: "NEW" }),
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold tracking-tight text-foreground", children: "Comprehensive Student Audit & PDF Report Generator" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Filter by date range or individual student to generate an official PDF dossier with complete 5-step movement audit, parent live photos, and GPS geo-points." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "outline",
              className: "gap-2 border-primary/30 hover:bg-primary/10",
              onClick: () => openCustomReport("student"),
              children: [
                /* @__PURE__ */ jsx(User, { className: "h-4 w-4 text-primary" }),
                "Student Dossier"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            Button,
            {
              className: "gap-2 bg-primary text-primary-foreground shadow hover:bg-primary/90",
              onClick: () => openCustomReport("general"),
              children: [
                /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4" }),
                "Generate Audit PDF"
              ]
            }
          )
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs(Card, { className: "mb-6", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-base font-semibold", children: "Permission Volume - Last 7 Days" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Daily approved student leave and outing permissions" })
          ] }),
          /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", onClick: () => openCustomReport("daily"), children: [
            "View Daily Logs ",
            /* @__PURE__ */ jsx(ArrowRight, { className: "ml-1 h-3.5 w-3.5" })
          ] })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { className: "h-64", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(AreaChart, { data: chartData, margin: { top: 10, right: 10, left: -20, bottom: 0 }, children: [
          /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "g2", x1: "0", y1: "0", x2: "0", y2: "1", children: [
            /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "var(--color-success)", stopOpacity: 0.45 }),
            /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "var(--color-success)", stopOpacity: 0.01 })
          ] }) }),
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--color-border)", vertical: false, opacity: 0.3 }),
          /* @__PURE__ */ jsx(
            XAxis,
            {
              dataKey: "day",
              stroke: "var(--color-muted-foreground)",
              fontSize: 12,
              tickLine: false,
              axisLine: false,
              dy: 8
            }
          ),
          /* @__PURE__ */ jsx(
            YAxis,
            {
              stroke: "var(--color-muted-foreground)",
              fontSize: 12,
              allowDecimals: false,
              tickLine: false,
              axisLine: false,
              dx: -8
            }
          ),
          /* @__PURE__ */ jsx(
            Tooltip$1,
            {
              contentStyle: {
                background: "rgba(15, 23, 42, 0.85)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: 12,
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)"
              },
              itemStyle: { color: "#f8fafc" },
              labelStyle: { color: "#94a3b8", fontWeight: "bold" }
            }
          ),
          /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "approved", stroke: "var(--color-success)", fill: "url(#g2)", strokeWidth: 2 })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsx(
          Card,
          {
            className: "cursor-pointer transition hover:border-primary/50 hover:shadow-md",
            onClick: () => openCustomReport("daily"),
            children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600", children: /* @__PURE__ */ jsx(Calendar, { className: "h-5 w-5" }) }),
                /* @__PURE__ */ jsx(Badge, { variant: "outline", children: "Today" })
              ] }),
              /* @__PURE__ */ jsx("h3", { className: "mt-3 text-base font-semibold", children: "Daily Permission Report" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Permissions created, approved, or rejected today." }),
              /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-between pt-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-primary", children: "Open & Print PDF" }),
                /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 text-primary" })
              ] })
            ] })
          }
        ),
        /* @__PURE__ */ jsx(
          Card,
          {
            className: "cursor-pointer transition hover:border-primary/50 hover:shadow-md",
            onClick: () => openCustomReport("monthly"),
            children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600", children: /* @__PURE__ */ jsx(FileBarChart, { className: "h-5 w-5" }) }),
                /* @__PURE__ */ jsx(Badge, { variant: "outline", children: "Monthly" })
              ] }),
              /* @__PURE__ */ jsx("h3", { className: "mt-3 text-base font-semibold", children: "Monthly Permission Report" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Aggregated permission & movement activity for the month." }),
              /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-between pt-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-primary", children: "Open & Print PDF" }),
                /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 text-primary" })
              ] })
            ] })
          }
        ),
        /* @__PURE__ */ jsx(
          Card,
          {
            className: "cursor-pointer transition hover:border-primary/50 hover:shadow-md",
            onClick: () => openCustomReport("outside"),
            children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600", children: /* @__PURE__ */ jsx(MapPin, { className: "h-5 w-5" }) }),
                /* @__PURE__ */ jsx(Badge, { className: "bg-amber-500/20 text-amber-700 hover:bg-amber-500/30", children: "Active" })
              ] }),
              /* @__PURE__ */ jsx("h3", { className: "mt-3 text-base font-semibold", children: "Students Outside Report" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Students currently scanned out with expected return times." }),
              /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-between pt-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-primary", children: "Open & Print PDF" }),
                /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 text-primary" })
              ] })
            ] })
          }
        ),
        /* @__PURE__ */ jsx(
          Card,
          {
            className: "cursor-pointer transition hover:border-primary/50 hover:shadow-md",
            onClick: () => openCustomReport("exits"),
            children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600", children: /* @__PURE__ */ jsx(Clock, { className: "h-5 w-5" }) }),
                /* @__PURE__ */ jsx(Badge, { variant: "outline", children: "Security Gate" })
              ] }),
              /* @__PURE__ */ jsx("h3", { className: "mt-3 text-base font-semibold", children: "Student Exit History" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Historical gate exit events with guard geo-coordinates." }),
              /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-between pt-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-primary", children: "Open & Print PDF" }),
                /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 text-primary" })
              ] })
            ] })
          }
        ),
        /* @__PURE__ */ jsx(
          Card,
          {
            className: "cursor-pointer transition hover:border-primary/50 hover:shadow-md",
            onClick: () => openCustomReport("returns"),
            children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600", children: /* @__PURE__ */ jsx(ShieldCheck, { className: "h-5 w-5" }) }),
                /* @__PURE__ */ jsx(Badge, { variant: "outline", children: "Security Gate" })
              ] }),
              /* @__PURE__ */ jsx("h3", { className: "mt-3 text-base font-semibold", children: "Student Return History" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Historical gate return events with punctuality checks." }),
              /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-between pt-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-primary", children: "Open & Print PDF" }),
                /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 text-primary" })
              ] })
            ] })
          }
        ),
        /* @__PURE__ */ jsx(
          Card,
          {
            className: "cursor-pointer transition hover:border-primary/50 hover:shadow-md",
            onClick: () => openCustomReport("student"),
            children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600", children: /* @__PURE__ */ jsx(User, { className: "h-5 w-5" }) }),
                /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: "Individual" })
              ] }),
              /* @__PURE__ */ jsx("h3", { className: "mt-3 text-base font-semibold", children: "Individual Student Dossier" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Search any student to generate their complete historical dossier." }),
              /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-between pt-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-primary", children: "Select Student & Print" }),
                /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 text-primary" })
              ] })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5", children: [
        /* @__PURE__ */ jsx(Stat, { label: "Total Requests", value: reportsQuery.data?.data.totalRequests ?? 0 }),
        /* @__PURE__ */ jsx(Stat, { label: "Approved", value: reportsQuery.data?.data.approved ?? 0 }),
        /* @__PURE__ */ jsx(Stat, { label: "Rejected", value: reportsQuery.data?.data.rejected ?? 0 }),
        /* @__PURE__ */ jsx(Stat, { label: "Returned", value: reportsQuery.data?.data.returned ?? 0 }),
        /* @__PURE__ */ jsx(Stat, { label: "Gate Passes", value: reportsQuery.data?.data.gatePasses ?? 0 })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Dialog, { open: modalOpen, onOpenChange: setModalOpen, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-h-[92vh] max-w-5xl overflow-hidden p-0 sm:rounded-xl", children: [
      /* @__PURE__ */ jsx(DialogHeader, { className: "border-b bg-muted/40 px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(DialogTitle, { className: "text-xl font-bold", children: reportTitle }),
          /* @__PURE__ */ jsx(DialogDescription, { className: "text-xs", children: "Review timeline records, parent verification live photos, GPS logs, and export printable PDF." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "gap-1.5", onClick: handleExportCsv, children: [
            /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
            " CSV"
          ] }),
          /* @__PURE__ */ jsxs(Button, { size: "sm", className: "gap-1.5 bg-primary text-primary-foreground", onClick: handlePrintPdf, children: [
            /* @__PURE__ */ jsx(Printer, { className: "h-4 w-4" }),
            " Print / Save PDF"
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "border-b bg-card/60 p-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-3 md:grid-cols-12", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1 md:col-span-3", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Report Scope" }),
            /* @__PURE__ */ jsxs("div", { className: "flex rounded-md bg-muted p-1", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  className: `flex-1 rounded-sm py-1 text-xs font-medium transition ${scopeMode === "ALL" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
                  onClick: () => {
                    setScopeMode("ALL");
                    setSelectedStudentId("");
                  },
                  children: "All Students"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  className: `flex-1 rounded-sm py-1 text-xs font-medium transition ${scopeMode === "SINGLE" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
                  onClick: () => {
                    setScopeMode("SINGLE");
                    if (!selectedStudentId && students[0]) setSelectedStudentId(students[0].student_id || students[0].id);
                  },
                  children: "Single Student"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1 md:col-span-5", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Date Range" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(
                Input,
                {
                  type: "date",
                  value: fromDate,
                  onChange: (e) => {
                    setFromDate(e.target.value);
                    setDatePreset("custom");
                  },
                  className: "h-8 text-xs"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "to" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  type: "date",
                  value: toDate,
                  onChange: (e) => {
                    setToDate(e.target.value);
                    setDatePreset("custom");
                  },
                  className: "h-8 text-xs"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1 md:col-span-4", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Movement Status" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: statusFilter,
                onChange: (e) => setStatusFilter(e.target.value),
                className: "h-8 w-full rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring",
                children: [
                  /* @__PURE__ */ jsxs("option", { value: "ALL", children: [
                    "All Statuses (",
                    leaves.length,
                    ")"
                  ] }),
                  /* @__PURE__ */ jsx("option", { value: "APPROVED", children: "Approved Only" }),
                  /* @__PURE__ */ jsx("option", { value: "PENDING", children: "Pending Only" }),
                  /* @__PURE__ */ jsx("option", { value: "REJECTED", children: "Rejected Only" }),
                  /* @__PURE__ */ jsx("option", { value: "OUT", children: "Currently Outside (OUT)" }),
                  /* @__PURE__ */ jsx("option", { value: "RETURNED", children: "Returned to Hostel" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2.5 flex flex-wrap items-center gap-1.5", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[11px] font-medium text-muted-foreground", children: "Quick Presets:" }),
          [
            { label: "Today", value: "today" },
            { label: "Yesterday", value: "yesterday" },
            { label: "Last 7 Days", value: "last7" },
            { label: "This Month", value: "thisMonth" },
            { label: "Last 30 Days", value: "last30" },
            { label: "All Time", value: "all" }
          ].map((preset) => /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => handlePresetChange(preset.value),
              className: `rounded-full px-2.5 py-0.5 text-[11px] font-medium transition ${datePreset === preset.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"}`,
              children: preset.label
            },
            preset.value
          ))
        ] }),
        scopeMode === "SINGLE" && /* @__PURE__ */ jsxs("div", { className: "mt-3 rounded-lg border border-primary/20 bg-primary/5 p-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-center", children: [
            /* @__PURE__ */ jsxs("div", { className: "relative flex-1", children: [
              /* @__PURE__ */ jsx(Search, { className: "absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  placeholder: "Search student by Name, Roll No (e.g. 21N81A66G4), or Room...",
                  value: studentSearchTerm,
                  onChange: (e) => setStudentSearchTerm(e.target.value),
                  className: "h-8 pl-8 text-xs"
                }
              )
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsx(
              "select",
              {
                value: selectedStudentId,
                onChange: (e) => setSelectedStudentId(e.target.value),
                className: "h-8 w-full rounded-md border border-input bg-background px-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring",
                children: filteredStudentsList.length === 0 ? /* @__PURE__ */ jsx("option", { value: "", children: "No matching students found" }) : filteredStudentsList.map((s) => /* @__PURE__ */ jsxs("option", { value: s.student_id || s.id, children: [
                  s.student_id,
                  " - ",
                  s.name,
                  " (",
                  s.room_number || "No Room",
                  ")"
                ] }, s.id))
              }
            ) })
          ] }),
          selectedStudentObj && /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center gap-3 rounded-md bg-background/80 px-3 py-2 text-xs shadow-sm", children: [
            selectedStudentObj.profile_photo ? /* @__PURE__ */ jsx(
              "img",
              {
                src: selectedStudentObj.profile_photo,
                alt: "",
                className: "h-9 w-9 rounded-full object-cover border border-primary/30"
              }
            ) : /* @__PURE__ */ jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-bold text-primary", children: selectedStudentObj.name?.slice(0, 2).toUpperCase() || "ST" }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: selectedStudentObj.name }),
                /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-[10px]", children: selectedStudentObj.student_id }),
                /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "text-[10px]", children: selectedStudentObj.room_number })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
                "Phone: ",
                selectedStudentObj.mobile,
                " | Parent: ",
                selectedStudentObj.parent_mobile
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b bg-muted/20 px-6 py-2 text-xs font-medium text-muted-foreground", children: [
        /* @__PURE__ */ jsxs("span", { children: [
          "Showing ",
          /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: filteredLeaves.length }),
          " matching records from",
          " ",
          /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: fromDate }),
          " to ",
          /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: toDate })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-emerald-600", children: [
            /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5" }),
            " Approved:",
            " ",
            filteredLeaves.filter((l) => l.final_status === "APPROVED").length
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-amber-600", children: [
            /* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5" }),
            " Out:",
            " ",
            filteredLeaves.filter((l) => l.gatePass?.status === "OUT").length
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-rose-600", children: [
            /* @__PURE__ */ jsx(XCircle, { className: "h-3.5 w-3.5" }),
            " Rejected:",
            " ",
            filteredLeaves.filter((l) => l.final_status === "REJECTED").length
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "max-h-[55vh] space-y-4 overflow-y-auto p-6", children: filteredLeaves.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-12 text-center text-muted-foreground", children: [
        /* @__PURE__ */ jsx(FileText, { className: "h-10 w-10 text-muted-foreground/40" }),
        /* @__PURE__ */ jsx("h4", { className: "mt-3 font-semibold text-foreground", children: "No Records Found" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs", children: "Try adjusting your date range or status filters above." })
      ] }) : filteredLeaves.map((leave, idx) => {
        const isOut = leave.gatePass?.status === "OUT" || leave.gatePass?.out_time_actual && !leave.gatePass?.in_time_actual;
        const isReturned = Boolean(leave.gatePass?.in_time_actual);
        const parentPhoto = leave.parent_approval_photo || leave.parent_profile_photo;
        const studentPhoto = leave.student?.profile_photo;
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: "rounded-xl border border-border/80 bg-card p-4 shadow-sm transition hover:border-primary/40",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 border-b border-border/60 pb-3 sm:flex-row sm:items-center sm:justify-between", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                  studentPhoto ? /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: studentPhoto,
                      alt: "",
                      className: "h-10 w-10 rounded-full border border-primary/20 object-cover shadow-sm"
                    }
                  ) : /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary", children: leave.student?.name?.slice(0, 2).toUpperCase() || "ST" }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsx("span", { className: "font-bold text-foreground", children: leave.student?.name || "Student" }),
                      /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "font-mono text-[10px]", children: leave.student?.student_id || leave.student_id }),
                      /* @__PURE__ */ jsxs(Badge, { variant: "secondary", className: "text-[10px]", children: [
                        "Room ",
                        leave.student?.room_number || "—"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
                      "Hostel: ",
                      leave.student?.hostel_name || "Primary",
                      " | Mobile: ",
                      leave.student?.mobile || "—",
                      " | Parent: ",
                      leave.student?.parent_mobile || "—"
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(
                    Badge,
                    {
                      className: leave.final_status === "APPROVED" ? "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20" : leave.final_status === "REJECTED" ? "bg-rose-500/15 text-rose-700 hover:bg-rose-500/20" : "bg-amber-500/15 text-amber-700 hover:bg-amber-500/20",
                      children: leave.final_status
                    }
                  ),
                  isOut && /* @__PURE__ */ jsx(Badge, { className: "bg-blue-600 text-white animate-pulse", children: "CURRENTLY OUT" }),
                  isReturned && /* @__PURE__ */ jsx(Badge, { className: "bg-teal-600 text-white", children: "RETURNED" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "mt-3 grid gap-2 sm:grid-cols-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-muted/40 p-2.5 sm:col-span-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Reason / Destination" }),
                  /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-xs font-medium text-foreground", children: leave.reason || "No reason specified" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-muted/40 p-2.5", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Scheduled Window" }),
                  /* @__PURE__ */ jsxs("p", { className: "mt-0.5 text-xs font-medium text-foreground", children: [
                    leave.from_date?.slice(0, 10),
                    " ➔ ",
                    leave.to_date?.slice(0, 10)
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground", children: "Movement & Verification Audit Trail" }),
                /* @__PURE__ */ jsxs("div", { className: "mt-2 grid gap-2 sm:grid-cols-5", children: [
                  /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border/80 bg-muted/20 p-2.5", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 font-semibold text-xs text-foreground", children: [
                      /* @__PURE__ */ jsx("span", { className: "flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground", children: "1" }),
                      "Student Request"
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "mt-1.5 space-y-1 text-[11px] text-muted-foreground", children: [
                      /* @__PURE__ */ jsxs("div", { children: [
                        "Submitted: ",
                        leave.created_at ? new Date(leave.created_at).toLocaleString() : "—"
                      ] }),
                      leave.student_lat != null && leave.student_lng != null ? /* @__PURE__ */ jsxs(
                        "a",
                        {
                          href: `https://maps.google.com/?q=${leave.student_lat},${leave.student_lng}`,
                          target: "_blank",
                          rel: "noreferrer",
                          className: "flex items-center gap-1 text-[10px] text-primary hover:underline",
                          children: [
                            /* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3" }),
                            "Lat: ",
                            Number(leave.student_lat).toFixed(4),
                            ", Lng: ",
                            Number(leave.student_lng).toFixed(4)
                          ]
                        }
                      ) : /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/70", children: "No GPS recorded" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: `rounded-lg border p-2.5 ${leave.parent_status === "APPROVED" ? "border-emerald-500/30 bg-emerald-500/5" : leave.parent_status === "REJECTED" ? "border-rose-500/30 bg-rose-500/5" : "border-amber-500/30 bg-amber-500/5"}`, children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 font-semibold text-xs text-foreground", children: [
                        /* @__PURE__ */ jsx("span", { className: "flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground", children: "2" }),
                        "Parent Verification"
                      ] }),
                      /* @__PURE__ */ jsx("span", { className: `text-[10px] font-bold ${leave.parent_status === "APPROVED" ? "text-emerald-600" : leave.parent_status === "REJECTED" ? "text-rose-600" : "text-amber-600"}`, children: leave.parent_status || "PENDING" })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "mt-1.5 space-y-1 text-[11px] text-muted-foreground", children: [
                      leave.parent_lat != null && leave.parent_lng != null && /* @__PURE__ */ jsxs(
                        "a",
                        {
                          href: `https://maps.google.com/?q=${leave.parent_lat},${leave.parent_lng}`,
                          target: "_blank",
                          rel: "noreferrer",
                          className: "flex items-center gap-1 text-[10px] text-primary hover:underline",
                          children: [
                            /* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3" }),
                            "Parent GPS"
                          ]
                        }
                      ),
                      parentPhoto ? /* @__PURE__ */ jsxs("div", { className: "pt-1", children: [
                        /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-semibold text-foreground flex items-center gap-1", children: [
                          /* @__PURE__ */ jsx(Camera, { className: "h-3 w-3 text-primary" }),
                          " Live Photo:"
                        ] }),
                        /* @__PURE__ */ jsx(
                          "img",
                          {
                            src: parentPhoto,
                            alt: "Parent Live Verification",
                            className: "mt-1 h-14 w-full cursor-pointer rounded border border-border object-cover transition hover:opacity-90 shadow-sm",
                            onClick: () => setZoomedPhoto({ url: parentPhoto, title: `Parent Verification Photo - ${leave.student?.name}` })
                          }
                        )
                      ] }) : /* @__PURE__ */ jsx("span", { className: "text-[10px] italic text-muted-foreground", children: "No photo uploaded" }),
                      leave.parent_reject_reason && /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-rose-600", children: [
                        "Reject: ",
                        leave.parent_reject_reason
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: `rounded-lg border p-2.5 ${leave.hostel_status === "APPROVED" ? "border-emerald-500/30 bg-emerald-500/5" : leave.hostel_status === "REJECTED" ? "border-rose-500/30 bg-rose-500/5" : "border-amber-500/30 bg-amber-500/5"}`, children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 font-semibold text-xs text-foreground", children: [
                        /* @__PURE__ */ jsx("span", { className: "flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground", children: "3" }),
                        "Warden Review"
                      ] }),
                      /* @__PURE__ */ jsx("span", { className: `text-[10px] font-bold ${leave.hostel_status === "APPROVED" ? "text-emerald-600" : leave.hostel_status === "REJECTED" ? "text-rose-600" : "text-amber-600"}`, children: leave.hostel_status || "PENDING" })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "mt-1.5 space-y-1 text-[11px] text-muted-foreground", children: [
                      leave.hostel_lat != null && /* @__PURE__ */ jsxs(
                        "a",
                        {
                          href: `https://maps.google.com/?q=${leave.hostel_lat},${leave.hostel_lng}`,
                          target: "_blank",
                          rel: "noreferrer",
                          className: "flex items-center gap-1 text-[10px] text-primary hover:underline",
                          children: [
                            /* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3" }),
                            " Warden GPS"
                          ]
                        }
                      ),
                      leave.note && /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-foreground font-medium", children: [
                        "Note: ",
                        leave.note
                      ] }),
                      leave.hostel_reject_reason && /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-rose-600 font-medium", children: [
                        "Reject: ",
                        leave.hostel_reject_reason
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border/80 bg-muted/20 p-2.5", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 font-semibold text-xs text-foreground", children: [
                        /* @__PURE__ */ jsx("span", { className: "flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground", children: "4" }),
                        "Gate Exit"
                      ] }),
                      leave.gatePass?.out_time_actual ? /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "bg-emerald-500/10 text-[9px] text-emerald-700", children: "SCANNED OUT" }) : /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground", children: "Pending" })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "mt-1.5 space-y-1 text-[11px] text-muted-foreground", children: [
                      /* @__PURE__ */ jsxs("div", { children: [
                        "Time: ",
                        leave.gatePass?.out_time_actual ? new Date(leave.gatePass.out_time_actual).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"
                      ] }),
                      leave.gatePass?.out_guard_lat != null && /* @__PURE__ */ jsxs(
                        "a",
                        {
                          href: `https://maps.google.com/?q=${leave.gatePass.out_guard_lat},${leave.gatePass.out_guard_lng}`,
                          target: "_blank",
                          rel: "noreferrer",
                          className: "flex items-center gap-1 text-[10px] text-primary hover:underline",
                          children: [
                            /* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3" }),
                            " Gate GPS"
                          ]
                        }
                      )
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border/80 bg-muted/20 p-2.5", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 font-semibold text-xs text-foreground", children: [
                        /* @__PURE__ */ jsx("span", { className: "flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground", children: "5" }),
                        "Gate Return"
                      ] }),
                      leave.gatePass?.in_time_actual ? /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "bg-teal-500/10 text-[9px] text-teal-700", children: "RETURNED" }) : isOut ? /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "bg-blue-500/10 text-[9px] text-blue-700", children: "OUTSIDE" }) : /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground", children: "Pending" })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "mt-1.5 space-y-1 text-[11px] text-muted-foreground", children: [
                      /* @__PURE__ */ jsxs("div", { children: [
                        "Time: ",
                        leave.gatePass?.in_time_actual ? new Date(leave.gatePass.in_time_actual).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"
                      ] }),
                      leave.gatePass?.in_guard_lat != null && /* @__PURE__ */ jsxs(
                        "a",
                        {
                          href: `https://maps.google.com/?q=${leave.gatePass.in_guard_lat},${leave.gatePass.in_guard_lng}`,
                          target: "_blank",
                          rel: "noreferrer",
                          className: "flex items-center gap-1 text-[10px] text-primary hover:underline",
                          children: [
                            /* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3" }),
                            " Return GPS"
                          ]
                        }
                      )
                    ] })
                  ] })
                ] })
              ] })
            ]
          },
          leave.id || idx
        );
      }) }),
      /* @__PURE__ */ jsx(DialogFooter, { className: "border-t bg-muted/30 px-6 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex w-full items-center justify-between", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "Hostel GATEX Automated Audit & Movement Logging System" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: () => setModalOpen(false), children: "Close" }),
          /* @__PURE__ */ jsxs(Button, { size: "sm", className: "gap-1.5 bg-primary text-primary-foreground", onClick: handlePrintPdf, children: [
            /* @__PURE__ */ jsx(Printer, { className: "h-4 w-4" }),
            " Print / Save as PDF"
          ] })
        ] })
      ] }) })
    ] }) }),
    zoomedPhoto && /* @__PURE__ */ jsx(Dialog, { open: Boolean(zoomedPhoto), onOpenChange: () => setZoomedPhoto(null), children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-md p-4", children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { className: "text-sm font-semibold", children: zoomedPhoto.title }) }),
      /* @__PURE__ */ jsx("div", { className: "mt-2 overflow-hidden rounded-lg border border-border", children: /* @__PURE__ */ jsx("img", { src: zoomedPhoto.url, alt: "Enlarged preview", className: "w-full object-contain" }) }),
      /* @__PURE__ */ jsx(DialogFooter, { className: "mt-4", children: /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", onClick: () => setZoomedPhoto(null), children: "Close" }) })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "hidden print:block font-sans text-black", children: [
      /* @__PURE__ */ jsx("style", { dangerouslySetInnerHTML: { __html: `
          @media print {
            @page { size: A4 portrait; margin: 12mm 12mm 12mm 12mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #fff !important; color: #000 !important; }
            .print-break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
          }
        ` } }),
      /* @__PURE__ */ jsx("div", { className: "border-b-2 border-black pb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("img", { src: "/gatex-logo.jpg", alt: "Logo", className: "h-12 w-12 rounded object-cover" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-xl font-extrabold uppercase tracking-wide", children: "Hostel GATEX Management System" }),
            /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-gray-700", children: reportTitle })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-right text-xs text-gray-600", children: [
          /* @__PURE__ */ jsxs("p", { children: [
            "Generated: ",
            (/* @__PURE__ */ new Date()).toLocaleString()
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            "Date Range: ",
            fromDate,
            " to ",
            toDate
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            "Total Records: ",
            filteredLeaves.length
          ] })
        ] })
      ] }) }),
      selectedStudentObj && /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center gap-4 rounded-lg border border-gray-400 bg-gray-50 p-3 print-break-inside-avoid", children: [
        selectedStudentObj.profile_photo && /* @__PURE__ */ jsx("img", { src: selectedStudentObj.profile_photo, alt: "", className: "h-16 w-16 rounded border object-cover" }),
        /* @__PURE__ */ jsxs("div", { className: "text-xs", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold text-gray-900", children: selectedStudentObj.name }),
          /* @__PURE__ */ jsxs("p", { children: [
            "Student Roll No: ",
            /* @__PURE__ */ jsx("strong", { children: selectedStudentObj.student_id }),
            " | Room: ",
            /* @__PURE__ */ jsx("strong", { children: selectedStudentObj.room_number })
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            "Student Mobile: ",
            /* @__PURE__ */ jsx("strong", { children: selectedStudentObj.mobile }),
            " | Parent Mobile: ",
            /* @__PURE__ */ jsx("strong", { children: selectedStudentObj.parent_mobile })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 grid grid-cols-4 gap-2 text-center text-xs print-break-inside-avoid", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded border border-gray-300 bg-gray-100 p-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Total Requests" }),
          /* @__PURE__ */ jsx("p", { className: "text-base font-bold", children: filteredLeaves.length })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded border border-gray-300 bg-gray-100 p-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Approved" }),
          /* @__PURE__ */ jsx("p", { className: "text-base font-bold text-green-700", children: filteredLeaves.filter((l) => l.final_status === "APPROVED").length })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded border border-gray-300 bg-gray-100 p-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Currently Outside" }),
          /* @__PURE__ */ jsx("p", { className: "text-base font-bold text-blue-700", children: filteredLeaves.filter((l) => l.gatePass?.status === "OUT").length })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded border border-gray-300 bg-gray-100 p-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Rejected" }),
          /* @__PURE__ */ jsx("p", { className: "text-base font-bold text-red-700", children: filteredLeaves.filter((l) => l.final_status === "REJECTED").length })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-6 space-y-4", children: filteredLeaves.map((leave, index) => {
        const parentPhoto = leave.parent_approval_photo || leave.parent_profile_photo;
        const studentPhoto = leave.student?.profile_photo;
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: "rounded-lg border border-gray-400 p-3 print-break-inside-avoid text-xs",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-gray-300 pb-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  studentPhoto && /* @__PURE__ */ jsx("img", { src: studentPhoto, alt: "", className: "h-8 w-8 rounded-full border object-cover" }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("span", { className: "font-bold text-sm text-gray-900", children: leave.student?.name }),
                    /* @__PURE__ */ jsxs("span", { className: "ml-2 font-mono text-gray-700", children: [
                      "(",
                      leave.student?.student_id,
                      ")"
                    ] }),
                    /* @__PURE__ */ jsxs("span", { className: "ml-2 text-gray-600", children: [
                      "Room: ",
                      leave.student?.room_number
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "text-right", children: /* @__PURE__ */ jsx("span", { className: "rounded px-2 py-0.5 font-bold uppercase border border-gray-700", children: leave.final_status }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "mt-2 grid grid-cols-3 gap-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "col-span-2", children: [
                  /* @__PURE__ */ jsxs("p", { children: [
                    /* @__PURE__ */ jsx("strong", { children: "Reason:" }),
                    " ",
                    leave.reason || "N/A"
                  ] }),
                  /* @__PURE__ */ jsxs("p", { children: [
                    /* @__PURE__ */ jsx("strong", { children: "Timing:" }),
                    " ",
                    leave.from_date,
                    " ➔ ",
                    leave.to_date
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                  /* @__PURE__ */ jsxs("p", { children: [
                    /* @__PURE__ */ jsx("strong", { children: "Student Mobile:" }),
                    " ",
                    leave.student?.mobile
                  ] }),
                  /* @__PURE__ */ jsxs("p", { children: [
                    /* @__PURE__ */ jsx("strong", { children: "Parent Mobile:" }),
                    " ",
                    leave.student?.parent_mobile
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("table", { className: "mt-2 w-full border-collapse border border-gray-300 text-[10px]", children: [
                /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-gray-100", children: [
                  /* @__PURE__ */ jsx("th", { className: "border border-gray-300 p-1", children: "1. Student Request" }),
                  /* @__PURE__ */ jsx("th", { className: "border border-gray-300 p-1", children: "2. Parent Verification" }),
                  /* @__PURE__ */ jsx("th", { className: "border border-gray-300 p-1", children: "3. Warden Approval" }),
                  /* @__PURE__ */ jsx("th", { className: "border border-gray-300 p-1", children: "4. Gate Exit" }),
                  /* @__PURE__ */ jsx("th", { className: "border border-gray-300 p-1", children: "5. Gate Return" })
                ] }) }),
                /* @__PURE__ */ jsx("tbody", { children: /* @__PURE__ */ jsxs("tr", { children: [
                  /* @__PURE__ */ jsxs("td", { className: "border border-gray-300 p-1.5 align-top", children: [
                    /* @__PURE__ */ jsx("p", { children: leave.created_at ? new Date(leave.created_at).toLocaleString() : "—" }),
                    leave.student_lat != null && /* @__PURE__ */ jsxs("p", { className: "text-gray-600", children: [
                      "GPS: ",
                      Number(leave.student_lat).toFixed(3),
                      ", ",
                      Number(leave.student_lng).toFixed(3)
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("td", { className: "border border-gray-300 p-1.5 align-top", children: [
                    /* @__PURE__ */ jsxs("p", { children: [
                      /* @__PURE__ */ jsx("strong", { children: "Status:" }),
                      " ",
                      leave.parent_status || "PENDING"
                    ] }),
                    leave.parent_lat != null && /* @__PURE__ */ jsxs("p", { className: "text-gray-600", children: [
                      "GPS: ",
                      Number(leave.parent_lat).toFixed(3),
                      ", ",
                      Number(leave.parent_lng).toFixed(3)
                    ] }),
                    parentPhoto && /* @__PURE__ */ jsx("div", { className: "mt-1", children: /* @__PURE__ */ jsx("img", { src: parentPhoto, alt: "Parent live photo", className: "h-12 w-12 rounded border object-cover" }) })
                  ] }),
                  /* @__PURE__ */ jsxs("td", { className: "border border-gray-300 p-1.5 align-top", children: [
                    /* @__PURE__ */ jsxs("p", { children: [
                      /* @__PURE__ */ jsx("strong", { children: "Status:" }),
                      " ",
                      leave.hostel_status || "PENDING"
                    ] }),
                    leave.note && /* @__PURE__ */ jsx("p", { className: "italic", children: String(leave.note) })
                  ] }),
                  /* @__PURE__ */ jsxs("td", { className: "border border-gray-300 p-1.5 align-top", children: [
                    /* @__PURE__ */ jsx("p", { children: leave.gatePass?.out_time_actual ? new Date(leave.gatePass.out_time_actual).toLocaleTimeString() : "Not Scanned" }),
                    leave.gatePass?.out_guard_lat != null && /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "Gate GPS recorded" })
                  ] }),
                  /* @__PURE__ */ jsx("td", { className: "border border-gray-300 p-1.5 align-top", children: /* @__PURE__ */ jsx("p", { children: leave.gatePass?.in_time_actual ? new Date(leave.gatePass.in_time_actual).toLocaleTimeString() : "Not Returned" }) })
                ] }) })
              ] })
            ]
          },
          leave.id || index
        );
      }) }),
      /* @__PURE__ */ jsxs("div", { className: "mt-8 border-t border-gray-400 pt-4 text-center text-xs text-gray-500", children: [
        /* @__PURE__ */ jsx("p", { children: "Hostel GATEX Automated Multi-Point Movement Verification & Security Compliance Report" }),
        /* @__PURE__ */ jsx("p", { children: "This is an officially certified electronic audit report." })
      ] })
    ] })
  ] });
}
function Stat({ label, value }) {
  return /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
    /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-2xl font-semibold", children: value })
  ] }) });
}
const $$splitComponentImporter$7 = () => import("./leaves-BQCYy3Hb.mjs");
const Route$7 = createFileRoute("/admin/leaves")({
  head: () => ({
    meta: [{
      title: "Permission Requests · Hostel GATEX"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./hostels-DpfgUV5x.mjs");
const Route$6 = createFileRoute("/admin/hostels")({
  head: () => ({
    meta: [{
      title: "Hostel Management · Hostel GATEX"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./guards-CYOvbobf.mjs");
const Route$5 = createFileRoute("/admin/guards")({
  head: () => ({
    meta: [{
      title: "Security Guards · Hostel GATEX"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./dashboard-DsiOCyzM.mjs");
const Route$4 = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [{
      title: "Dashboard · Hostel GATEX"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./index-DdxeMjzF.mjs");
const Route$3 = createFileRoute("/admin/students/")({
  head: () => ({
    meta: [{
      title: "Students · Hostel GATEX"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./returned-DI9hWXXT.mjs");
const Route$2 = createFileRoute("/admin/tracking/returned")({
  head: () => ({
    meta: [{
      title: "Students Returned · Hostel GATEX"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./outside-DzKJh6LX.mjs");
const Route$1 = createFileRoute("/admin/tracking/outside")({
  head: () => ({
    meta: [{
      title: "Students Outside · Hostel GATEX"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./import-hwwglrEC.mjs");
const Route = createFileRoute("/admin/students/import")({
  head: () => ({
    meta: [{
      title: "Import & Bulk Photos · Hostel GATEX"
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
  updateStaff as A,
  Button as B,
  Card as C,
  DashboardShell as D,
  deleteStaff as E,
  Avatar as F,
  AvatarImage as G,
  AvatarFallback as H,
  Input as I,
  getLeaveRequests as J,
  reviewLeaveRequest as K,
  bulkReviewLeaveRequests as L,
  deleteHostel as M,
  getHostelDashboard as N,
  getHostelStudents as O,
  PageHeader as P,
  createStudent as Q,
  updateStudent as R,
  deleteStudent as S,
  uploadStudentPhoto as T,
  uploadParentPhoto as U,
  importStudents as V,
  bulkUploadPhotos as W,
  router as X,
  CardContent as a,
  changePassword as b,
  cn as c,
  CardHeader as d,
  CardTitle as e,
  getSuperHostels as f,
  getSession as g,
  createHostel as h,
  initTheme as i,
  setHostelStatus as j,
  Dialog as k,
  login as l,
  DialogTrigger as m,
  DialogContent as n,
  DialogHeader as o,
  DialogTitle as p,
  DialogDescription as q,
  Badge as r,
  setSession as s,
  DialogFooter as t,
  updateHostel as u,
  getSuperAnalytics as v,
  getHostelStaff as w,
  getHostels as x,
  uploadStaffPhoto as y,
  createStaff as z
};
