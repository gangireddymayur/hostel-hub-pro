import { jsx, jsxs } from "react/jsx-runtime";
import { C as Card, a as CardContent } from "./card-CBW7Y-m7.mjs";
import { c as cn } from "./api-Daun0K_T.mjs";
const tones = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-warning-foreground dark:text-warning",
  info: "bg-info/10 text-info",
  destructive: "bg-destructive/10 text-destructive"
};
function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
  trend,
  hint
}) {
  return /* @__PURE__ */ jsx(Card, { className: "overflow-hidden border-border/60 shadow-sm transition hover:shadow-md", children: /* @__PURE__ */ jsx(CardContent, { className: "p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs font-medium uppercase tracking-wider text-muted-foreground", children: label }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-3xl font-semibold tracking-tight text-foreground", children: value }),
      hint && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: hint }),
      trend && /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs font-medium text-success", children: trend })
    ] }),
    /* @__PURE__ */ jsx("div", { className: cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", tones[tone]), children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }) })
  ] }) }) });
}
export {
  StatCard as S
};
