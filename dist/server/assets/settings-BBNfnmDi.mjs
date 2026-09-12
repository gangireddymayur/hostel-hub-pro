import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import * as React from "react";
import { useRef, useState, useEffect } from "react";
import { P as PageHeader } from "./dashboard-shell-CzAPsa48.mjs";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent, d as CardDescription } from "./card-Bsh3_7Nr.mjs";
import { c as cn, n as getHostelSettings, o as updateHostelSettings, p as uploadHostelLogo, a as changePassword, r as restoreSystemBackup, B as Button, I as Input, d as downloadSystemBackup } from "./api-Z-Z2fqqD.mjs";
import { L as Label } from "./label-xBHPHV3z.mjs";
import { Building2, Upload, Mail, Phone, MapPin, Database, Download, RotateCcw, ShieldCheck, AlertTriangle, FileJson, CheckCircle2 } from "lucide-react";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from "./dialog-CTW-BnUY.mjs";
import { B as Badge } from "./badge-B-AfTXO-.mjs";
import { toast } from "sonner";
import "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "./router-CrJ2JFYD.mjs";
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
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const restoreFileInputRef = useRef(null);
  const {
    data: settingsData,
    isLoading
  } = useQuery({
    queryKey: ["hostel-settings"],
    queryFn: getHostelSettings
  });
  const hostel = settingsData?.data;
  const [hostelName, setHostelName] = useState("");
  const [hostelEmail, setHostelEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [logoUrl, setLogoUrl] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [selectedBackupFile, setSelectedBackupFile] = useState(null);
  const [parsedBackupData, setParsedBackupData] = useState(null);
  const [restoreMode, setRestoreMode] = useState("merge");
  useEffect(() => {
    if (hostel) {
      setHostelName(hostel.hostel_name || "");
      setHostelEmail(hostel.email || "");
      setPhone(hostel.phone || "");
      setAddress(hostel.address || "");
      setLogoUrl(hostel.logo || null);
    }
  }, [hostel]);
  const updateMutation = useMutation({
    mutationFn: updateHostelSettings,
    onSuccess: (res) => {
      toast.success("Hostel details updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["hostel-settings"]
      });
      if (res.data) {
        setHostelName(res.data.hostel_name || "");
        setHostelEmail(res.data.email || "");
        setPhone(res.data.phone || "");
        setAddress(res.data.address || "");
        setLogoUrl(res.data.logo || null);
      }
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to update hostel details")
  });
  const logoMutation = useMutation({
    mutationFn: uploadHostelLogo,
    onSuccess: (res) => {
      toast.success("Hostel logo uploaded successfully");
      queryClient.invalidateQueries({
        queryKey: ["hostel-settings"]
      });
      if (res.data?.logo) {
        setLogoUrl(res.data.logo);
      }
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to upload logo")
  });
  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => toast.success("Password updated"),
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update password")
  });
  const restoreMutation = useMutation({
    mutationFn: restoreSystemBackup,
    onSuccess: (res) => {
      toast.success(res.message || "System state successfully restored!");
      setRestoreModalOpen(false);
      setSelectedBackupFile(null);
      setParsedBackupData(null);
      queryClient.invalidateQueries();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to restore backup")
  });
  const handleLogoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      logoMutation.mutate(file);
    }
  };
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
      link.download = `gatex_safe_backup_${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Backup downloaded successfully! (${res.counts?.students ?? 0} students, ${res.counts?.leaveRequests ?? 0} requests)`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate backup");
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
        setRestoreMode("merge");
        setRestoreModalOpen(true);
      } catch (err) {
        toast.error("Malformed JSON backup file. Please select a valid GATEX backup file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Hostel Settings", description: "Manage branding, contact information, support details, database backup, and security." }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxs(Card, { className: "border-border/80 shadow-sm", children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-base font-bold flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Building2, { className: "h-4 w-4 text-primary" }),
          "Hostel Details & Support Info"
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "grid gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsx("input", { ref: fileInputRef, type: "file", accept: "image/*", className: "hidden", onChange: handleLogoFileChange }),
            /* @__PURE__ */ jsx("div", { className: "relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 transition hover:bg-muted/50 overflow-hidden shadow-inner", onClick: () => fileInputRef.current?.click(), title: "Click to upload logo", children: logoUrl ? /* @__PURE__ */ jsx("img", { src: logoUrl, alt: "Hostel logo", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1 text-center p-2", children: [
              /* @__PURE__ */ jsx(Building2, { className: "h-6 w-6 text-muted-foreground" }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground font-medium", children: "Add Logo" })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1 flex-1", children: [
              /* @__PURE__ */ jsxs(Button, { type: "button", variant: "outline", size: "sm", className: "gap-1.5 text-xs font-semibold", disabled: logoMutation.isPending, onClick: () => fileInputRef.current?.click(), children: [
                /* @__PURE__ */ jsx(Upload, { className: "h-3.5 w-3.5" }),
                logoMutation.isPending ? "Uploading..." : "Upload Logo"
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "PNG, JPG, or SVG up to 5MB. Rendered across printable PDF dossiers and gate passes." })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "hostel_name", className: "text-xs font-semibold", children: "Hostel / Branch Name" }),
            /* @__PURE__ */ jsx(Input, { id: "hostel_name", value: hostelName, onChange: (e) => setHostelName(e.target.value), placeholder: "e.g. TechnoTrade Men's Hostel" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxs(Label, { htmlFor: "hostel_email", className: "text-xs font-semibold flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(Mail, { className: "h-3.5 w-3.5 text-muted-foreground" }),
              "Official Admin Email"
            ] }),
            /* @__PURE__ */ jsx(Input, { id: "hostel_email", type: "email", value: hostelEmail, onChange: (e) => setHostelEmail(e.target.value), placeholder: "e.g. admin@technotrade.com" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxs(Label, { htmlFor: "hostel_phone", className: "text-xs font-semibold flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(Phone, { className: "h-3.5 w-3.5 text-muted-foreground" }),
              "Contact Phone / Helpline Number"
            ] }),
            /* @__PURE__ */ jsx(Input, { id: "hostel_phone", value: phone, onChange: (e) => setPhone(e.target.value), placeholder: "e.g. +91 9876543210 / 040-23456789" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxs(Label, { htmlFor: "hostel_address", className: "text-xs font-semibold flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(MapPin, { className: "h-3.5 w-3.5 text-muted-foreground" }),
              "Campus Address / Location"
            ] }),
            /* @__PURE__ */ jsx(Textarea, { id: "hostel_address", rows: 3, value: address, onChange: (e) => setAddress(e.target.value), placeholder: "Enter complete hostel address, block number, and landmarks..." })
          ] }),
          /* @__PURE__ */ jsx(Button, { className: "w-fit font-semibold", disabled: isLoading || updateMutation.isPending, onClick: () => {
            updateMutation.mutate({
              hostel_name: hostelName,
              email: hostelEmail,
              phone,
              address
            });
          }, children: updateMutation.isPending ? "Saving..." : "Save Changes" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-6", children: [
        /* @__PURE__ */ jsxs(Card, { className: "border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10 shadow-sm", children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs(CardTitle, { className: "text-base font-bold flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(Database, { className: "h-4 w-4 text-primary" }),
                "Data Management & System Backup"
              ] }),
              /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-[10px] bg-primary/10 text-primary border-primary/20", children: "SAFE BACKUP" })
            ] }),
            /* @__PURE__ */ jsx(CardDescription, { className: "text-xs text-muted-foreground", children: "Export complete snapshots of students, leaves, gate logs, and photos, or restore from an existing backup file." })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsx("input", { ref: restoreFileInputRef, type: "file", accept: ".json,.gatexbkp", className: "hidden", onChange: handleSelectRestoreFile }),
            /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/70 bg-card p-3.5 flex flex-col justify-between shadow-sm", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 font-semibold text-xs text-foreground", children: [
                    /* @__PURE__ */ jsx(Download, { className: "h-4 w-4 text-emerald-600 dark:text-emerald-400" }),
                    "Create Safe Backup"
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "mt-1 text-[11px] text-muted-foreground leading-relaxed", children: "Download a timestamped JSON snapshot of all records, GPS logs, and photos for offline preservation." })
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
                  /* @__PURE__ */ jsx("p", { className: "mt-1 text-[11px] text-muted-foreground leading-relaxed", children: "Restore system state or migrate database records from a previously exported backup file." })
                ] }),
                /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", className: "mt-3 w-full gap-1.5 border-amber-500/30 hover:bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold", onClick: () => restoreFileInputRef.current?.click(), children: [
                  /* @__PURE__ */ jsx(Upload, { className: "h-3.5 w-3.5" }),
                  "Upload Backup"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-[11px] text-muted-foreground pt-1", children: [
              /* @__PURE__ */ jsx(ShieldCheck, { className: "h-3.5 w-3.5 text-primary shrink-0" }),
              /* @__PURE__ */ jsx("span", { children: "All backups include cryptographic verification and pre-restore rollback safety points." })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { className: "border-border/80 shadow-sm", children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base font-bold", children: "Change Password" }) }),
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
            /* @__PURE__ */ jsx(Button, { className: "w-fit font-semibold", type: "submit", disabled: passwordMutation.isPending, children: passwordMutation.isPending ? "Updating..." : "Update Password" })
          ] }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Dialog, { open: restoreModalOpen, onOpenChange: setRestoreModalOpen, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/15 text-amber-600", children: /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(DialogTitle, { className: "text-base font-bold", children: "Restore System Backup" }),
          /* @__PURE__ */ jsx(DialogDescription, { className: "text-xs", children: "Review snapshot contents before applying changes to the live database." })
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
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border/60 bg-card p-2 text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground font-medium", children: "Students" }),
            /* @__PURE__ */ jsx("div", { className: "text-base font-bold text-foreground mt-0.5", children: parsedBackupData.counts?.students ?? (Array.isArray(parsedBackupData.data?.students) ? parsedBackupData.data.students.length : 0) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border/60 bg-card p-2 text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground font-medium", children: "Leave Requests" }),
            /* @__PURE__ */ jsx("div", { className: "text-base font-bold text-foreground mt-0.5", children: parsedBackupData.counts?.leaveRequests ?? (Array.isArray(parsedBackupData.data?.leaveRequests) ? parsedBackupData.data.leaveRequests.length : 0) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border/60 bg-card p-2 text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground font-medium", children: "Gate Passes" }),
            /* @__PURE__ */ jsx("div", { className: "text-base font-bold text-foreground mt-0.5", children: parsedBackupData.counts?.gatePasses ?? (Array.isArray(parsedBackupData.data?.gatePasses) ? parsedBackupData.data.gatePasses.length : 0) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5 pt-1", children: [
          /* @__PURE__ */ jsx(Label, { className: "text-xs font-semibold text-foreground", children: "Restore Mode" }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            /* @__PURE__ */ jsxs("div", { className: `cursor-pointer rounded-lg border p-2.5 transition ${restoreMode === "merge" ? "border-primary bg-primary/10 text-foreground" : "border-border bg-card text-muted-foreground hover:bg-muted/30"}`, onClick: () => setRestoreMode("merge"), children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 font-bold text-xs", children: [
                /* @__PURE__ */ jsx(CheckCircle2, { className: `h-3.5 w-3.5 ${restoreMode === "merge" ? "text-primary" : "text-muted-foreground"}` }),
                "Smart Merge & Upsert"
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "mt-1 text-[10px] leading-snug", children: [
                "(Recommended) Updates existing records & adds missing ones. ",
                /* @__PURE__ */ jsx("strong", { children: "Never deletes" }),
                " newer unbacked-up students."
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: `cursor-pointer rounded-lg border p-2.5 transition ${restoreMode === "clean_replace" ? "border-rose-500 bg-rose-500/10 text-foreground" : "border-border bg-card text-muted-foreground hover:bg-muted/30"}`, onClick: () => setRestoreMode("clean_replace"), children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 font-bold text-xs text-rose-600 dark:text-rose-400", children: [
                /* @__PURE__ */ jsx(AlertTriangle, { className: "h-3.5 w-3.5 text-rose-600" }),
                "Full Replacement"
              ] }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-[10px] leading-snug", children: "Full rollback. Replaces current database to match this exact snapshot file." })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed font-medium", children: restoreMode === "merge" ? /* @__PURE__ */ jsxs("span", { children: [
          "🛡️ ",
          /* @__PURE__ */ jsx("strong", { children: "Zero Data Loss:" }),
          " Smart Merge will update matching student records and insert missing ones. Any students added after this backup was created will remain completely safe."
        ] }) : /* @__PURE__ */ jsxs("span", { children: [
          "⚠️ ",
          /* @__PURE__ */ jsx("strong", { children: "Full Rollback Warning:" }),
          " This will overwrite the current database state with the backup snapshot."
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { className: "gap-2", children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: () => setRestoreModalOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxs(Button, { size: "sm", className: "gap-1.5 bg-primary text-primary-foreground font-semibold", disabled: restoreMutation.isPending || !parsedBackupData, onClick: () => {
          if (parsedBackupData) {
            restoreMutation.mutate({
              ...parsedBackupData,
              mode: restoreMode
            });
          }
        }, children: [
          /* @__PURE__ */ jsx(RotateCcw, { className: "h-3.5 w-3.5" }),
          restoreMutation.isPending ? "Restoring..." : restoreMode === "merge" ? "Apply Smart Merge" : "Confirm Full Replace"
        ] })
      ] })
    ] }) })
  ] });
}
export {
  AdminSettings as component
};
