import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import * as React from "react";
import { useRef, useState, useEffect } from "react";
import { P as PageHeader } from "./dashboard-shell-npjU-JCC.mjs";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./card-De1Y_KBq.mjs";
import { c as cn, m as getHostelSettings, n as updateHostelSettings, o as uploadHostelLogo, a as changePassword, B as Button, I as Input } from "./api-BngjPNyl.mjs";
import { L as Label } from "./label-CWULM9Wc.mjs";
import { Building2, Upload, Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "./router-tMoz9BTl.mjs";
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
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
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
  const handleLogoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      logoMutation.mutate(file);
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Hostel Settings", description: "Manage branding, contact information, support details, and security." }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxs(Card, { className: "border-border/80 shadow-sm", children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-base font-bold flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Building2, { className: "h-4 w-4 text-primary" }),
          "Hostel Details & Support Info"
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "grid gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsx("input", { ref: fileInputRef, type: "file", accept: "image/*", className: "hidden", onChange: handleLogoFileChange }),
            /* @__PURE__ */ jsx("div", { className: "relative flex h-16 w-16 overflow-hidden items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 text-xl font-bold text-primary shadow-sm", children: logoUrl ? /* @__PURE__ */ jsx("img", { src: logoUrl, alt: "Hostel Logo", className: "h-full w-full object-cover" }) : (hostelName || "HA").slice(0, 2).toUpperCase() }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxs(Button, { type: "button", variant: "outline", size: "sm", disabled: logoMutation.isPending, onClick: () => fileInputRef.current?.click(), className: "gap-1.5", children: [
                /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4" }),
                logoMutation.isPending ? "Uploading..." : "Upload Logo"
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground", children: "PNG, JPG, or SVG for branding and student app header." })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "hostel_name", className: "text-xs font-semibold", children: "Hostel Name" }),
            /* @__PURE__ */ jsx(Input, { id: "hostel_name", value: hostelName, onChange: (e) => setHostelName(e.target.value), placeholder: "e.g. TechnoTrade Men's Hostel" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxs(Label, { htmlFor: "hostel_email", className: "text-xs font-semibold flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(Mail, { className: "h-3.5 w-3.5 text-muted-foreground" }),
              "Support & Contact Email"
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
      /* @__PURE__ */ jsx("div", { className: "grid gap-4", children: /* @__PURE__ */ jsxs(Card, { className: "border-border/80 shadow-sm", children: [
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
      ] }) })
    ] })
  ] });
}
export {
  AdminSettings as component
};
