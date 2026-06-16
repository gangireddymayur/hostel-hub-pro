import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Pencil } from "lucide-react";
import { P as PageHeader, A as Avatar, a as AvatarFallback } from "./dashboard-shell-Df4YPNGZ.mjs";
import { e as getHostelStaff, f as getHostels, h as createStaff, i as updateStaff, B as Button, I as Input } from "./api--5whJC5R.mjs";
import { C as Card, a as CardContent } from "./card-CsNNq-g3.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-Ci-eRanC.mjs";
import { D as Dialog, a as DialogTrigger, b as DialogContent, c as DialogHeader, d as DialogTitle, f as DialogFooter } from "./dialog-Difn1sX8.mjs";
import { L as Label } from "./label-D6ZXoduc.mjs";
import { toast } from "sonner";
import "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "./router-Yf6xAzZd.mjs";
import "@radix-ui/react-avatar";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
function StaffPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [selectedHostel, setSelectedHostel] = useState("");
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [hostelFilter, setHostelFilter] = useState("ALL");
  const staffQuery = useQuery({
    queryKey: ["hostel-staff"],
    queryFn: getHostelStaff
  });
  const hostelsQuery = useQuery({
    queryKey: ["active-hostels"],
    queryFn: getHostels
  });
  const list = useMemo(() => staffQuery.data?.data ?? [], [staffQuery.data]);
  const hostels = hostelsQuery.data?.data ?? [];
  const filtered = useMemo(() => {
    return list.filter((staff) => {
      const matchesSearch = staff.name.toLowerCase().includes(q.toLowerCase()) || staff.email.toLowerCase().includes(q.toLowerCase());
      const matchesRole = roleFilter === "ALL" || staff.role === roleFilter;
      const matchesHostel = hostelFilter === "ALL" || staff.hostel_id === hostelFilter;
      return matchesSearch && matchesRole && matchesHostel;
    });
  }, [list, q, roleFilter, hostelFilter]);
  const createMutation = useMutation({
    mutationFn: createStaff,
    onSuccess: async () => {
      toast.success("Staff added");
      setOpen(false);
      setSelectedHostel("");
      await queryClient.invalidateQueries({
        queryKey: ["hostel-staff"]
      });
      await queryClient.invalidateQueries({
        queryKey: ["hostel-dashboard"]
      });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to add staff")
  });
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      ...payload
    }) => updateStaff(id, payload),
    onSuccess: async () => {
      toast.success("Staff updated");
      setOpen(false);
      setEditingStaff(null);
      setSelectedHostel("");
      await queryClient.invalidateQueries({
        queryKey: ["hostel-staff"]
      });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update staff")
  });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Staff", description: "Manage hostel staff members.", action: /* @__PURE__ */ jsxs(Dialog, { open, onOpenChange: (val) => {
      setOpen(val);
      if (!val) {
        setEditingStaff(null);
        setSelectedHostel("");
      }
    }, children: [
      /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
        " Add Staff"
      ] }) }),
      /* @__PURE__ */ jsxs(DialogContent, { children: [
        /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: editingStaff ? "Edit staff member" : "Add staff member" }) }),
        /* @__PURE__ */ jsxs("form", { className: "grid gap-4", onSubmit: (event) => {
          event.preventDefault();
          if (!selectedHostel) {
            toast.error("Hostel is required");
            return;
          }
          const form = new FormData(event.currentTarget);
          const payload = {
            role: String(form.get("role")),
            name: String(form.get("name")),
            email: String(form.get("email")),
            password: String(form.get("password") ?? "") || void 0,
            hostel_id: selectedHostel
          };
          if (editingStaff) {
            updateMutation.mutate({
              id: editingStaff.id,
              ...payload
            });
          } else {
            createMutation.mutate(payload);
          }
        }, children: [
          /* @__PURE__ */ jsx(Field, { name: "name", label: "Name", defaultValue: editingStaff?.name, required: true }),
          /* @__PURE__ */ jsx(Field, { name: "role", label: "Role", asSelect: true, defaultValue: editingStaff?.role, helper: "Choose hostel admin, guard or hostel staff." }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "hostel_select", children: "Hostel" }),
            /* @__PURE__ */ jsxs("select", { id: "hostel_select", value: selectedHostel, onChange: (e) => setSelectedHostel(e.target.value), required: true, className: "h-10 rounded-md border border-input bg-background px-3 py-2 text-sm", children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Select a hostel" }),
              hostels.map((hostel) => /* @__PURE__ */ jsx("option", { value: hostel.id, children: hostel.hostel_name }, hostel.id))
            ] })
          ] }),
          /* @__PURE__ */ jsx(Field, { name: "email", label: "Email", type: "email", defaultValue: editingStaff?.email, required: true }),
          /* @__PURE__ */ jsx(Field, { name: "password", label: "Password", type: "password", helper: editingStaff ? "Leave blank to keep current password." : "Leave blank to use the default reset password." }),
          /* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsx(Button, { type: "submit", children: editingStaff ? "Save changes" : "Save" }) })
        ] }, editingStaff ? editingStaff.id : "new")
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-4 flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative max-w-sm flex-1", children: [
          /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
          /* @__PURE__ */ jsx(Input, { placeholder: "Search staff by name, email…", value: q, onChange: (e) => setQ(e.target.value), className: "pl-9" })
        ] }),
        /* @__PURE__ */ jsxs("select", { value: roleFilter, onChange: (e) => setRoleFilter(e.target.value), className: "h-10 rounded-md border border-input bg-background px-3 py-2 text-sm", children: [
          /* @__PURE__ */ jsx("option", { value: "ALL", children: "All Roles" }),
          /* @__PURE__ */ jsx("option", { value: "HOSTEL_ADMIN", children: "Hostel Admin" }),
          /* @__PURE__ */ jsx("option", { value: "SECURITY_GUARD", children: "Security Guard" }),
          /* @__PURE__ */ jsx("option", { value: "HOSTEL_STAFF", children: "Hostel Staff" })
        ] }),
        /* @__PURE__ */ jsxs("select", { value: hostelFilter, onChange: (e) => setHostelFilter(e.target.value), className: "h-10 rounded-md border border-input bg-background px-3 py-2 text-sm", children: [
          /* @__PURE__ */ jsx("option", { value: "ALL", children: "All Hostels" }),
          hostels.map((hostel) => /* @__PURE__ */ jsx("option", { value: hostel.id, children: hostel.hostel_name }, hostel.id))
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-lg border border-border/60", children: /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableHead, { children: "Name" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Role" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Hostel" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Email" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: filtered.map((staff) => /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(Avatar, { className: "h-8 w-8", children: /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-accent text-accent-foreground text-xs", children: staff.name.split(" ").map((part) => part[0]).slice(0, 2).join("") }) }),
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: staff.name })
          ] }) }),
          /* @__PURE__ */ jsx(TableCell, { children: staff.role.toLowerCase().replaceAll("_", " ") }),
          /* @__PURE__ */ jsx(TableCell, { children: staff.hostel_name || "N/A" }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-xs", children: staff.email }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", onClick: () => {
            setEditingStaff(staff);
            setSelectedHostel(staff.hostel_id ?? "");
            setOpen(true);
          }, children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }) }) })
        ] }, staff.id)) })
      ] }) })
    ] }) })
  ] });
}
function Field({
  name,
  label,
  type = "text",
  required,
  helper,
  asSelect,
  defaultValue
}) {
  return /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5", children: [
    /* @__PURE__ */ jsx(Label, { htmlFor: name, children: label }),
    asSelect ? /* @__PURE__ */ jsxs("select", { id: name, name, required: true, defaultValue, className: "h-10 rounded-md border border-input bg-background px-3 py-2 text-sm", children: [
      /* @__PURE__ */ jsx("option", { value: "HOSTEL_ADMIN", children: "Hostel Admin" }),
      /* @__PURE__ */ jsx("option", { value: "SECURITY_GUARD", children: "Security Guard" }),
      /* @__PURE__ */ jsx("option", { value: "HOSTEL_STAFF", children: "Hostel Staff" })
    ] }) : /* @__PURE__ */ jsx(Input, { id: name, name, type, required, defaultValue }),
    helper ? /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: helper }) : null
  ] });
}
export {
  StaffPage as component
};
