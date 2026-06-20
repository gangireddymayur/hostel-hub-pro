import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Eye, Pencil, Upload } from "lucide-react";
import { P as PageHeader, A as Avatar, a as AvatarImage, b as AvatarFallback } from "./dashboard-shell-Bbn3nM6s.mjs";
import { t as getHostelStudents, f as getHostels, v as createStudent, w as updateStudent, x as deleteStudent, y as uploadStudentPhoto, z as uploadParentPhoto, B as Button, I as Input } from "./api-DSdVMJa1.mjs";
import { C as Card, a as CardContent } from "./card-Cou3fdV0.mjs";
import { B as Badge } from "./badge-D1Odnqwk.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-B2b5VjfX.mjs";
import { D as Dialog, a as DialogTrigger, b as DialogContent, c as DialogHeader, d as DialogTitle, e as DialogDescription, f as DialogFooter } from "./dialog-B7TpbGr1.mjs";
import { L as Label } from "./label-EyW0gS79.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-C2P3YQL7.mjs";
import { toast } from "sonner";
import "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "./router-CgH3HpDg.mjs";
import "@radix-ui/react-avatar";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
function StudentsPage() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [parentPhotoFile, setParentPhotoFile] = useState(null);
  const [selectedHostel, setSelectedHostel] = useState("");
  const [hostelFilter, setHostelFilter] = useState("ALL");
  const studentsQuery = useQuery({
    queryKey: ["hostel-students"],
    queryFn: getHostelStudents
  });
  const hostelsQuery = useQuery({
    queryKey: ["active-hostels"],
    queryFn: getHostels
  });
  const hostels = hostelsQuery.data?.data ?? [];
  const list = useMemo(() => studentsQuery.data?.data ?? [], [studentsQuery.data]);
  const filtered = useMemo(() => {
    return list.filter((student) => {
      const matchesSearch = student.name.toLowerCase().includes(q.toLowerCase()) || student.student_id.toLowerCase().includes(q.toLowerCase()) || student.room_number.toLowerCase().includes(q.toLowerCase());
      const matchesHostel = hostelFilter === "ALL" || student.hostel_id === hostelFilter;
      return matchesSearch && matchesHostel;
    });
  }, [list, q, hostelFilter]);
  const createMutation = useMutation({
    mutationFn: createStudent,
    onSuccess: async () => {
      toast.success("Student added");
      setOpen(false);
      setSelectedHostel("");
      await queryClient.invalidateQueries({
        queryKey: ["hostel-students"]
      });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to add student")
  });
  const updateMutation = useMutation({
    mutationFn: ({
      studentId,
      payload
    }) => updateStudent(studentId, payload),
    onSuccess: async () => {
      toast.success("Student updated");
      setEditingStudent(null);
      setSelectedHostel("");
      await queryClient.invalidateQueries({
        queryKey: ["hostel-students"]
      });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update student")
  });
  const deleteMutation = useMutation({
    mutationFn: deleteStudent,
    onSuccess: async () => {
      toast.success("Student deleted successfully");
      setEditingStudent(null);
      await queryClient.invalidateQueries({
        queryKey: ["hostel-students"]
      });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to delete student")
  });
  const photoMutation = useMutation({
    mutationFn: ({
      studentId,
      file
    }) => uploadStudentPhoto(studentId, file),
    onSuccess: async (resData) => {
      toast.success("Student photo uploaded");
      setPhotoFile(null);
      await queryClient.invalidateQueries({
        queryKey: ["hostel-students"]
      });
      if (view) {
        setView((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            profile_photo: resData.data?.profile_photo ?? prev.profile_photo
          };
        });
      }
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to upload photo")
  });
  const parentPhotoMutation = useMutation({
    mutationFn: ({
      studentId,
      file
    }) => uploadParentPhoto(studentId, file),
    onSuccess: async (resData) => {
      toast.success("Parent photo uploaded");
      setParentPhotoFile(null);
      await queryClient.invalidateQueries({
        queryKey: ["hostel-students"]
      });
      if (view) {
        setView((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            parent_profile_photo: resData.data?.profile_photo ?? prev.parent_profile_photo
          };
        });
      }
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to upload photo")
  });
  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSelectedHostel("");
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Students", description: "Manage student records and profiles.", action: /* @__PURE__ */ jsxs(Dialog, { open, onOpenChange: handleOpenChange, children: [
      /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
        " Add Student"
      ] }) }),
      /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-2xl", children: [
        /* @__PURE__ */ jsxs(DialogHeader, { children: [
          /* @__PURE__ */ jsx(DialogTitle, { children: "Add new student" }),
          /* @__PURE__ */ jsx(DialogDescription, { children: "Create a new student profile." })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: (event) => {
          event.preventDefault();
          if (!selectedHostel) {
            toast.error("Hostel is required");
            return;
          }
          const form = new FormData(event.currentTarget);
          createMutation.mutate({
            student_id: String(form.get("student_id") ?? ""),
            name: String(form.get("name") ?? ""),
            room_number: String(form.get("room_number") ?? ""),
            mobile: String(form.get("mobile") ?? ""),
            parent_mobile: String(form.get("parent_mobile") ?? ""),
            password: String(form.get("password") ?? "") || void 0,
            parent_password: String(form.get("parent_password") ?? "") || void 0,
            hostel_id: selectedHostel,
            student_year: String(form.get("student_year") ?? "") || null
          });
        }, className: "grid gap-4 md:grid-cols-2", children: [
          /* @__PURE__ */ jsx(Field, { name: "student_id", label: "Student ID", required: true }),
          /* @__PURE__ */ jsx(Field, { name: "name", label: "Full Name", required: true }),
          /* @__PURE__ */ jsx(Field, { name: "room_number", label: "Room Number", required: true }),
          /* @__PURE__ */ jsx(Field, { name: "mobile", label: "Mobile Number", required: true }),
          /* @__PURE__ */ jsx(Field, { name: "parent_mobile", label: "Parent Mobile", required: true }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "student_year", children: "Student Year" }),
            /* @__PURE__ */ jsxs("select", { id: "student_year", name: "student_year", className: "h-10 rounded-md border border-input bg-background px-3 py-2 text-sm", children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Select Year (Optional)" }),
              /* @__PURE__ */ jsx("option", { value: "1st Year", children: "1st Year" }),
              /* @__PURE__ */ jsx("option", { value: "2nd Year", children: "2nd Year" }),
              /* @__PURE__ */ jsx("option", { value: "3rd Year", children: "3rd Year" }),
              /* @__PURE__ */ jsx("option", { value: "4th Year", children: "4th Year" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "md:col-span-2", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "hostel_id", children: "Hostel" }),
            /* @__PURE__ */ jsxs(Select, { value: selectedHostel, onValueChange: setSelectedHostel, children: [
              /* @__PURE__ */ jsx(SelectTrigger, { id: "hostel_id", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select a hostel" }) }),
              /* @__PURE__ */ jsx(SelectContent, { children: hostels.map((hostel) => /* @__PURE__ */ jsx(SelectItem, { value: hostel.id, children: hostel.hostel_name }, hostel.id)) })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(Field, { name: "password", label: "Student Password (Optional)", type: "password", helper: "Leave blank for default password." }),
          /* @__PURE__ */ jsx(Field, { name: "parent_password", label: "Parent Password (Optional)", type: "password", helper: "Leave blank for default password." }),
          /* @__PURE__ */ jsxs(DialogFooter, { className: "md:col-span-2", children: [
            /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", onClick: () => handleOpenChange(false), children: "Cancel" }),
            /* @__PURE__ */ jsx(Button, { type: "submit", children: "Save Student" })
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-4 flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative max-w-sm flex-1", children: [
          /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
          /* @__PURE__ */ jsx(Input, { placeholder: "Search by name, ID, room…", value: q, onChange: (e) => setQ(e.target.value), className: "pl-9" })
        ] }),
        /* @__PURE__ */ jsxs("select", { value: hostelFilter, onChange: (e) => setHostelFilter(e.target.value), className: "h-10 rounded-md border border-input bg-background px-3 py-2 text-sm", children: [
          /* @__PURE__ */ jsx("option", { value: "ALL", children: "All Hostels" }),
          hostels.map((hostel) => /* @__PURE__ */ jsx("option", { value: hostel.id, children: hostel.hostel_name }, hostel.id))
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-lg border border-border/60", children: /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableHead, { children: "Student" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Hostel" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Room" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Parent" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Mobile" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Status" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: filtered.map((student) => /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxs(Avatar, { className: "h-9 w-9", children: [
              student.profile_photo && /* @__PURE__ */ jsx(AvatarImage, { src: student.profile_photo, alt: student.name, className: "object-cover" }),
              /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-accent text-accent-foreground text-xs", children: student.name.split(" ").map((part) => part[0]).slice(0, 2).join("") })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "font-medium", children: student.name }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: student.student_id })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(TableCell, { children: student.hostel_name || "N/A" }),
          /* @__PURE__ */ jsx(TableCell, { children: student.room_number }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxs(Avatar, { className: "h-8 w-8", children: [
              student.parent_profile_photo && /* @__PURE__ */ jsx(AvatarImage, { src: student.parent_profile_photo, alt: "Parent", className: "object-cover" }),
              /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-secondary text-secondary-foreground text-xs font-semibold", children: "P" })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "font-mono text-xs", children: student.parent_mobile })
          ] }) }),
          /* @__PURE__ */ jsx(TableCell, { className: "font-mono text-xs", children: student.mobile }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { className: student.status === "ACTIVE" ? "bg-success text-success-foreground hover:bg-success" : "bg-warning/20 text-warning-foreground dark:text-warning hover:bg-warning/20", children: student.status === "ACTIVE" ? "In Hostel" : "Disabled" }) }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-1", children: [
            /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", onClick: () => setView(student), children: /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", onClick: () => {
              setEditingStudent(student);
              setSelectedHostel(student.hostel_id ?? "");
            }, children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }) })
          ] }) })
        ] }, student.id)) })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: !!view, onOpenChange: (open2) => {
      if (!open2) {
        setView(null);
        setPhotoFile(null);
        setParentPhotoFile(null);
      }
    }, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-xl", children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Student profile" }) }),
      view ? /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxs(Avatar, { className: "h-16 w-16", children: [
            view.profile_photo && /* @__PURE__ */ jsx(AvatarImage, { src: view.profile_photo, alt: view.name, className: "object-cover" }),
            /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-primary text-primary-foreground", children: view.name.split(" ").map((part) => part[0]).slice(0, 2).join("") })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-lg font-semibold", children: view.name }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: view.student_id })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("dl", { className: "grid grid-cols-2 gap-3 text-sm", children: [
          /* @__PURE__ */ jsx(Info, { k: "Hostel", v: view.hostel_name || "N/A" }),
          /* @__PURE__ */ jsx(Info, { k: "Room", v: view.room_number }),
          /* @__PURE__ */ jsx(Info, { k: "Mobile", v: view.mobile }),
          /* @__PURE__ */ jsx(Info, { k: "Parent", v: view.parent_mobile }),
          /* @__PURE__ */ jsx(Info, { k: "Student Year", v: view.student_year || "N/A" }),
          /* @__PURE__ */ jsx(Info, { k: "Status", v: view.status })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 pt-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid gap-2 rounded-xl border border-border/60 p-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxs(Avatar, { className: "h-12 w-12", children: [
                view.profile_photo && /* @__PURE__ */ jsx(AvatarImage, { src: view.profile_photo, alt: view.name, className: "object-cover" }),
                /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-primary text-primary-foreground text-sm", children: view.name.split(" ").map((part) => part[0]).slice(0, 2).join("") })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "photo", className: "text-xs font-medium", children: "Student photo" }),
                /* @__PURE__ */ jsx(Input, { id: "photo", type: "file", accept: "image/*", className: "mt-1 h-9 text-xs", onChange: (event) => setPhotoFile(event.target.files?.[0] ?? null) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs(Button, { type: "button", size: "sm", className: "w-full mt-1", disabled: !photoFile || photoMutation.isPending, onClick: () => {
              if (!view || !photoFile) return;
              photoMutation.mutate({
                studentId: view.id,
                file: photoFile
              });
            }, children: [
              /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4 mr-2" }),
              "Upload student photo"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-2 rounded-xl border border-border/60 p-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxs(Avatar, { className: "h-12 w-12", children: [
                view.parent_profile_photo && /* @__PURE__ */ jsx(AvatarImage, { src: view.parent_profile_photo, alt: "Parent", className: "object-cover" }),
                /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-secondary text-secondary-foreground text-sm font-semibold", children: "P" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "parent_photo", className: "text-xs font-medium", children: "Parent photo" }),
                /* @__PURE__ */ jsx(Input, { id: "parent_photo", type: "file", accept: "image/*", className: "mt-1 h-9 text-xs", onChange: (event) => setParentPhotoFile(event.target.files?.[0] ?? null) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs(Button, { type: "button", size: "sm", className: "w-full mt-1", disabled: !parentPhotoFile || parentPhotoMutation.isPending, onClick: () => {
              if (!view || !parentPhotoFile) return;
              parentPhotoMutation.mutate({
                studentId: view.id,
                file: parentPhotoFile
              });
            }, children: [
              /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4 mr-2" }),
              "Upload parent photo"
            ] })
          ] })
        ] })
      ] }) : null
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: !!editingStudent, onOpenChange: (open2) => !open2 && setEditingStudent(null), children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-2xl", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: "Edit student" }),
        /* @__PURE__ */ jsx(DialogDescription, { children: "Update student profile and details." })
      ] }),
      editingStudent ? /* @__PURE__ */ jsxs("form", { onSubmit: (event) => {
        event.preventDefault();
        if (!selectedHostel) {
          toast.error("Hostel is required");
          return;
        }
        const form = new FormData(event.currentTarget);
        updateMutation.mutate({
          studentId: editingStudent.id,
          payload: {
            student_id: String(form.get("student_id") ?? ""),
            name: String(form.get("name") ?? ""),
            room_number: String(form.get("room_number") ?? ""),
            mobile: String(form.get("mobile") ?? ""),
            parent_mobile: String(form.get("parent_mobile") ?? ""),
            password: String(form.get("password") ?? "") || void 0,
            parent_password: String(form.get("parent_password") ?? "") || void 0,
            status: String(form.get("status") ?? ""),
            hostel_id: selectedHostel,
            student_year: String(form.get("student_year") ?? "") || null
          }
        });
      }, className: "grid gap-4 md:grid-cols-2", children: [
        /* @__PURE__ */ jsx(Field, { name: "student_id", label: "Student ID", defaultValue: editingStudent.student_id, required: true }),
        /* @__PURE__ */ jsx(Field, { name: "name", label: "Full Name", defaultValue: editingStudent.name, required: true }),
        /* @__PURE__ */ jsx(Field, { name: "room_number", label: "Room Number", defaultValue: editingStudent.room_number, required: true }),
        /* @__PURE__ */ jsx(Field, { name: "mobile", label: "Mobile Number", defaultValue: editingStudent.mobile, required: true }),
        /* @__PURE__ */ jsx(Field, { name: "parent_mobile", label: "Parent Mobile", defaultValue: editingStudent.parent_mobile, required: true }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "student_year", children: "Student Year" }),
          /* @__PURE__ */ jsxs("select", { id: "student_year", name: "student_year", defaultValue: editingStudent.student_year || "", className: "h-10 rounded-md border border-input bg-background px-3 py-2 text-sm", children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Select Year (Optional)" }),
            /* @__PURE__ */ jsx("option", { value: "1st Year", children: "1st Year" }),
            /* @__PURE__ */ jsx("option", { value: "2nd Year", children: "2nd Year" }),
            /* @__PURE__ */ jsx("option", { value: "3rd Year", children: "3rd Year" }),
            /* @__PURE__ */ jsx("option", { value: "4th Year", children: "4th Year" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "md:col-span-2", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "hostel_id", children: "Hostel" }),
          /* @__PURE__ */ jsxs(Select, { value: selectedHostel, onValueChange: setSelectedHostel, children: [
            /* @__PURE__ */ jsx(SelectTrigger, { id: "hostel_id", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select a hostel" }) }),
            /* @__PURE__ */ jsx(SelectContent, { children: hostels.map((hostel) => /* @__PURE__ */ jsx(SelectItem, { value: hostel.id, children: hostel.hostel_name }, hostel.id)) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "md:col-span-2 grid gap-1.5", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "status", children: "Status" }),
          /* @__PURE__ */ jsxs("select", { id: "status", name: "status", defaultValue: editingStudent.status, className: "h-10 rounded-md border border-input bg-background px-3 py-2 text-sm", children: [
            /* @__PURE__ */ jsx("option", { value: "ACTIVE", children: "ACTIVE" }),
            /* @__PURE__ */ jsx("option", { value: "DISABLED", children: "DISABLED" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "Student Password (Optional)" }),
          /* @__PURE__ */ jsx(Input, { id: "password", name: "password", type: "password" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Leave blank to keep current student password." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "parent_password", children: "Parent Password (Optional)" }),
          /* @__PURE__ */ jsx(Input, { id: "parent_password", name: "parent_password", type: "password" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Leave blank to keep current parent password." })
        ] }),
        /* @__PURE__ */ jsxs(DialogFooter, { className: "md:col-span-2 flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-2", children: [
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "destructive", disabled: deleteMutation.isPending, onClick: () => {
            if (window.confirm(`Are you sure you want to delete student ${editingStudent.name}? This will remove all their leave requests and gate passes.`)) {
              deleteMutation.mutate(editingStudent.id);
            }
          }, children: "Delete Student" }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2 w-full sm:w-auto justify-end", children: [
            /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", onClick: () => setEditingStudent(null), children: "Cancel" }),
            /* @__PURE__ */ jsx(Button, { type: "submit", children: "Save Changes" })
          ] })
        ] })
      ] }) : null
    ] }) })
  ] });
}
function Field({
  name,
  label,
  type = "text",
  required,
  defaultValue,
  helper
}) {
  return /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5", children: [
    /* @__PURE__ */ jsx(Label, { htmlFor: name, children: label }),
    /* @__PURE__ */ jsx(Input, { id: name, name, type, required, defaultValue }),
    helper ? /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: helper }) : null
  ] });
}
function Info({
  k,
  v
}) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border/60 bg-muted/30 p-3", children: [
    /* @__PURE__ */ jsx("dt", { className: "text-xs text-muted-foreground", children: k }),
    /* @__PURE__ */ jsx("dd", { className: "mt-0.5 font-medium", children: v })
  ] });
}
export {
  StudentsPage as component
};
