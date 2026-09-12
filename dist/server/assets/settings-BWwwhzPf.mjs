import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import * as React from "react";
import { useRef, useState } from "react";
import { P as PageHeader } from "./dashboard-shell-CzAPsa48.mjs";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent, d as CardDescription } from "./card-Bsh3_7Nr.mjs";
import { c as cn, a as changePassword, r as restoreSystemBackup, I as Input, B as Button, d as downloadSystemBackup } from "./api-Z-Z2fqqD.mjs";
import { L as Label } from "./label-xBHPHV3z.mjs";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { B as Badge } from "./badge-B-AfTXO-.mjs";
import { Database, Download, RotateCcw, Upload, ShieldCheck, AlertTriangle, FileJson } from "lucide-react";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from "./dialog-CTW-BnUY.mjs";
import { g as getSession } from "./router-CrJ2JFYD.mjs";
import { toast } from "sonner";
import "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
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
  const queryClient = useQueryClient();
  const restoreFileInputRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [selectedBackupFile, setSelectedBackupFile] = useState(null);
  const [parsedBackupData, setParsedBackupData] = useState(null);
  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => toast.success("Password updated"),
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update password")
  });
  const restoreMutation = useMutation({
    mutationFn: restoreSystemBackup,
    onSuccess: (res) => {
      toast.success(res.message || "Global system state successfully restored!");
      setRestoreModalOpen(false);
      setSelectedBackupFile(null);
      setParsedBackupData(null);
      queryClient.invalidateQueries();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to restore backup")
  });
  const handleDownloadBackup = async () => {
    try {
      setIsDownloading(true);
      const res = await downloadSystemBackup();
      const jsonString = JSON.stringify(res, null, 2);
      const blob = new Blob([jsonString], {
        type: "application/json"
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-").slice(0, 19);
      link.href = url;
      link.download = `gatex_master_backup_${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Master backup downloaded! (${res.counts?.hostels ?? 0} hostels, ${res.counts?.students ?? 0} students)`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate master backup");
    } finally {
      setIsDownloading(false);
    }
  };
  const handleSelectRestoreFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        const json = JSON.parse(text);
        if (!json.data || typeof json.data !== "object") {
          toast.error("Invalid backup file: Missing database payload.");
          return;
        }
        setSelectedBackupFile(file);
        setParsedBackupData(json);
        setRestoreModalOpen(true);
      } catch (err) {
        toast.error("Malformed JSON backup file. Please select a valid GATEX backup file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Platform settings", description: "Configure your GATEX workspace, system backups, and security." }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid gap-6", children: [
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
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { className: "border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10 shadow-sm", children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs(CardTitle, { className: "text-base font-bold flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(Database, { className: "h-4 w-4 text-primary" }),
                "Master Database Backup & Restore"
              ] }),
              /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-[10px] bg-primary/10 text-primary border-primary/20", children: "SUPER ADMIN" })
            ] }),
            /* @__PURE__ */ jsx(CardDescription, { className: "text-xs text-muted-foreground", children: "Generate complete multi-hostel database snapshots or restore platform state." })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsx("input", { ref: restoreFileInputRef, type: "file", accept: ".json,.gatexbkp", className: "hidden", onChange: handleSelectRestoreFile }),
            /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/70 bg-card p-3.5 flex flex-col justify-between shadow-sm", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 font-semibold text-xs text-foreground", children: [
                    /* @__PURE__ */ jsx(Download, { className: "h-4 w-4 text-emerald-600 dark:text-emerald-400" }),
                    "Create Master Backup"
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "mt-1 text-[11px] text-muted-foreground leading-relaxed", children: "Download complete snapshot of all hostels, students, gate passes, GPS logs, and audit trails." })
                ] }),
                /* @__PURE__ */ jsxs(Button, { size: "sm", className: "mt-3 w-full gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 font-semibold shadow-sm", disabled: isDownloading, onClick: handleDownloadBackup, children: [
                  /* @__PURE__ */ jsx(Download, { className: "h-3.5 w-3.5" }),
                  isDownloading ? "Generating..." : "Download Backup"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/70 bg-card p-3.5 flex flex-col justify-between shadow-sm", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 font-semibold text-xs text-foreground", children: [
                    /* @__PURE__ */ jsx(RotateCcw, { className: "h-4 w-4 text-amber-600 dark:text-amber-400" }),
                    "Upload & Restore"
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "mt-1 text-[11px] text-muted-foreground leading-relaxed", children: "Restore platform data or migrate full database from a previously exported JSON backup." })
                ] }),
                /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", className: "mt-3 w-full gap-1.5 border-amber-500/30 hover:bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold", onClick: () => restoreFileInputRef.current?.click(), children: [
                  /* @__PURE__ */ jsx(Upload, { className: "h-3.5 w-3.5" }),
                  "Upload Backup"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-[11px] text-muted-foreground pt-1", children: [
              /* @__PURE__ */ jsx(ShieldCheck, { className: "h-3.5 w-3.5 text-primary shrink-0" }),
              /* @__PURE__ */ jsx("span", { children: "Encrypted schema check and automatic rollback snapshot created on every restore." })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-6", children: [
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
            /* @__PURE__ */ jsx(Button, { className: "w-fit", type: "submit", disabled: passwordMutation.isPending, children: passwordMutation.isPending ? "Updating..." : "Update password" })
          ] }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Dialog, { open: restoreModalOpen, onOpenChange: setRestoreModalOpen, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/15 text-amber-600", children: /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(DialogTitle, { className: "text-base font-bold", children: "Restore Master Backup" }),
          /* @__PURE__ */ jsx(DialogDescription, { className: "text-xs", children: "Review platform snapshot contents before applying changes to the live database." })
        ] })
      ] }) }),
      parsedBackupData && /* @__PURE__ */ jsxs("div", { className: "space-y-3 py-2 text-xs", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border/80 bg-muted/30 p-3 space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between font-semibold", children: [
            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 text-foreground", children: [
              /* @__PURE__ */ jsx(FileJson, { className: "h-4 w-4 text-primary" }),
              selectedBackupFile?.name || "Backup File"
            ] }),
            /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-[10px]", children: parsedBackupData.version ? `v${parsedBackupData.version}` : "GATEX JSON" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-muted-foreground text-[11px] grid grid-cols-2 gap-1 pt-1 border-t border-border/40", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              "Exported: ",
              parsedBackupData.exported_at ? new Date(parsedBackupData.exported_at).toLocaleString() : "Unknown"
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              "Exported By: ",
              parsedBackupData.exported_by || "Administrator"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-4 gap-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border/60 bg-card p-2 text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground font-medium", children: "Hostels" }),
            /* @__PURE__ */ jsx("div", { className: "text-base font-bold text-foreground mt-0.5", children: parsedBackupData.counts?.hostels ?? (Array.isArray(parsedBackupData.data?.hostels) ? parsedBackupData.data.hostels.length : 0) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border/60 bg-card p-2 text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground font-medium", children: "Students" }),
            /* @__PURE__ */ jsx("div", { className: "text-base font-bold text-foreground mt-0.5", children: parsedBackupData.counts?.students ?? (Array.isArray(parsedBackupData.data?.students) ? parsedBackupData.data.students.length : 0) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border/60 bg-card p-2 text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground font-medium", children: "Requests" }),
            /* @__PURE__ */ jsx("div", { className: "text-base font-bold text-foreground mt-0.5", children: parsedBackupData.counts?.leaveRequests ?? (Array.isArray(parsedBackupData.data?.leaveRequests) ? parsedBackupData.data.leaveRequests.length : 0) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border/60 bg-card p-2 text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground font-medium", children: "Passes" }),
            /* @__PURE__ */ jsx("div", { className: "text-base font-bold text-foreground mt-0.5", children: parsedBackupData.counts?.gatePasses ?? (Array.isArray(parsedBackupData.data?.gatePasses) ? parsedBackupData.data.gatePasses.length : 0) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed font-medium", children: [
          "⚠️ ",
          /* @__PURE__ */ jsx("strong", { children: "Safety Notice:" }),
          " Restoring this backup will replace current database tables with records from this backup snapshot."
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { className: "gap-2", children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: () => setRestoreModalOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxs(Button, { size: "sm", className: "gap-1.5 bg-amber-600 text-white hover:bg-amber-700 font-semibold", disabled: restoreMutation.isPending || !parsedBackupData, onClick: () => {
          if (parsedBackupData) {
            restoreMutation.mutate(parsedBackupData);
          }
        }, children: [
          /* @__PURE__ */ jsx(RotateCcw, { className: "h-3.5 w-3.5" }),
          restoreMutation.isPending ? "Restoring Platform..." : "Confirm & Apply Restore"
        ] })
      ] })
    ] }) })
  ] });
}
export {
  SuperSettings as component
};
