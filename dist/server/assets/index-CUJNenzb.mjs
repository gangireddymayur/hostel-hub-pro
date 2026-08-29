import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Trash2, Search, Eye, Pencil, AlertTriangle, Upload } from "lucide-react";
import { P as PageHeader, A as Avatar, a as AvatarImage, b as AvatarFallback } from "./dashboard-shell-Yx5LRXaj.mjs";
import { o as getHostelStudents, f as getHostels, v as createStudent, w as updateStudent, x as deleteStudent, y as bulkDeleteStudents, z as uploadStudentPhoto, A as uploadParentPhoto, B as Button, I as Input } from "./api-Dkx78klK.mjs";
import { C as Card, a as CardContent } from "./card-9RdRi1rI.mjs";
import { B as Badge } from "./badge-CWyUZ6W5.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-ChfPxHVg.mjs";
import { D as Dialog, a as DialogTrigger, b as DialogContent, c as DialogHeader, d as DialogTitle, e as DialogDescription, f as DialogFooter } from "./dialog-CVXR-hrn.mjs";
import { L as Label } from "./label-usc8BDYa.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-DF3jgcPS.mjs";
import { toast } from "sonner";
import "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "./router-65FBkeVi.mjs";
import "@radix-ui/react-avatar";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
function formatRoom(raw) {
  if (!raw) return "N/A";
  const trimmed = raw.trim();
  if (/^room\s*/i.test(trimmed)) return trimmed;
  return `Room ${trimmed}`;
}
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
  const [yearFilter, setYearFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
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
      const matchesSearch = student.name.toLowerCase().includes(q.toLowerCase()) || student.student_id.toLowerCase().includes(q.toLowerCase()) || student.room_number.toLowerCase().includes(q.toLowerCase()) || student.mobile.includes(q) || student.parent_mobile.includes(q);
      const matchesHostel = hostelFilter === "ALL" || student.hostel_id === hostelFilter;
      const matchesYear = yearFilter === "ALL" || student.student_year === yearFilter;
      return matchesSearch && matchesHostel && matchesYear;
    });
  }, [list, q, hostelFilter, yearFilter]);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, page]);
  const isAllCurrentPageSelected = paginated.length > 0 && paginated.every((s) => selectedIds.includes(s.id));
  const isSomeCurrentPageSelected = paginated.some((s) => selectedIds.includes(s.id)) && !isAllCurrentPageSelected;
  const toggleSelectAllCurrentPage = () => {
    if (isAllCurrentPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !paginated.some((s) => s.id === id)));
    } else {
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        paginated.forEach((s) => newSet.add(s.id));
        return Array.from(newSet);
      });
    }
  };
  const selectAllFiltered = () => {
    setSelectedIds(filtered.map((s) => s.id));
  };
  const clearSelection = () => {
    setSelectedIds([]);
  };
  const toggleSelectStudent = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  };
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
  const bulkDeleteMutation = useMutation({
    mutationFn: bulkDeleteStudents,
    onSuccess: async (res) => {
      toast.success(res.message || `Deleted ${selectedIds.length} student(s) successfully`);
      setSelectedIds([]);
      setBulkDeleteOpen(false);
      await queryClient.invalidateQueries({
        queryKey: ["hostel-students"]
      });
      await queryClient.invalidateQueries({
        queryKey: ["hostel-leaves"]
      });
      await queryClient.invalidateQueries({
        queryKey: ["hostel-reports"]
      });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to delete selected students")
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
    /* @__PURE__ */ jsx(PageHeader, { title: "Students", description: "Manage student records, profiles, and bulk management.", action: /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxs(Dialog, { open, onOpenChange: handleOpenChange, children: [
      /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { className: "gap-1.5", children: [
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
            /* @__PURE__ */ jsx(Label, { htmlFor: "new_student_year", children: "Student Year" }),
            /* @__PURE__ */ jsxs("select", { id: "new_student_year", name: "student_year", className: "h-10 rounded-md border border-input bg-background px-3 py-2 text-sm", children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Select Year (Optional)" }),
              /* @__PURE__ */ jsx("option", { value: "1st Year", children: "1st Year" }),
              /* @__PURE__ */ jsx("option", { value: "2nd Year", children: "2nd Year" }),
              /* @__PURE__ */ jsx("option", { value: "3rd Year", children: "3rd Year" }),
              /* @__PURE__ */ jsx("option", { value: "4th Year", children: "4th Year" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "md:col-span-2", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "new_hostel_id", children: "Hostel" }),
            /* @__PURE__ */ jsxs(Select, { value: selectedHostel, onValueChange: setSelectedHostel, children: [
              /* @__PURE__ */ jsx(SelectTrigger, { id: "new_hostel_id", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select a hostel" }) }),
              /* @__PURE__ */ jsx(SelectContent, { children: hostels.map((hostel) => /* @__PURE__ */ jsx(SelectItem, { value: hostel.id, children: hostel.hostel_name }, hostel.id)) })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "new_password", children: "Student Password (Optional)" }),
            /* @__PURE__ */ jsx(Input, { id: "new_password", name: "password", type: "password", placeholder: "Default password if blank" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "new_parent_password", children: "Parent Password (Optional)" }),
            /* @__PURE__ */ jsx(Input, { id: "new_parent_password", name: "parent_password", type: "password", placeholder: "Default password if blank" })
          ] }),
          /* @__PURE__ */ jsx(DialogFooter, { className: "md:col-span-2 mt-4", children: /* @__PURE__ */ jsx(Button, { type: "submit", disabled: createMutation.isPending, children: createMutation.isPending ? "Creating..." : "Save student" }) })
        ] })
      ] })
    ] }) }) }),
    selectedIds.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-foreground shadow-sm animate-in fade-in slide-in-from-top-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white font-bold text-xs shadow-sm", children: selectedIds.length }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("span", { className: "text-sm font-bold text-foreground", children: [
            selectedIds.length,
            " of ",
            list.length,
            " students selected"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-xs text-muted-foreground mt-0.5", children: [
            selectedIds.length < filtered.length && /* @__PURE__ */ jsxs("button", { type: "button", onClick: selectAllFiltered, className: "font-medium text-primary hover:underline", children: [
              "Select all ",
              filtered.length,
              " matching students"
            ] }),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: clearSelection, className: "font-medium hover:underline text-muted-foreground hover:text-foreground", children: "Deselect all" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: clearSelection, children: "Cancel" }),
        /* @__PURE__ */ jsxs(Button, { variant: "destructive", size: "sm", className: "gap-2 shadow-sm font-semibold", onClick: () => setBulkDeleteOpen(true), children: [
          /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
          "Delete Selected (",
          selectedIds.length,
          ")"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative flex-1 max-w-sm", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsx(Input, { placeholder: "Search by name, ID, room, mobile...", value: q, onChange: (event) => {
            setQ(event.target.value);
            setPage(1);
          }, className: "pl-9" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsxs("select", { value: hostelFilter, onChange: (e) => {
            setHostelFilter(e.target.value);
            setPage(1);
          }, className: "h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-ring", children: [
            /* @__PURE__ */ jsx("option", { value: "ALL", children: "All Hostels" }),
            hostels.map((hostel) => /* @__PURE__ */ jsx("option", { value: hostel.id, children: hostel.hostel_name }, hostel.id))
          ] }),
          /* @__PURE__ */ jsxs("select", { value: yearFilter, onChange: (e) => {
            setYearFilter(e.target.value);
            setPage(1);
          }, className: "h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-ring", children: [
            /* @__PURE__ */ jsx("option", { value: "ALL", children: "All Years" }),
            /* @__PURE__ */ jsx("option", { value: "1st Year", children: "1st Year" }),
            /* @__PURE__ */ jsx("option", { value: "2nd Year", children: "2nd Year" }),
            /* @__PURE__ */ jsx("option", { value: "3rd Year", children: "3rd Year" }),
            /* @__PURE__ */ jsx("option", { value: "4th Year", children: "4th Year" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-lg border border-border/60 bg-card", children: /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableHead, { className: "w-12 text-center", children: /* @__PURE__ */ jsx("input", { type: "checkbox", className: "h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer align-middle", checked: isAllCurrentPageSelected, ref: (el) => {
            if (el) el.indeterminate = isSomeCurrentPageSelected;
          }, onChange: toggleSelectAllCurrentPage }) }),
          /* @__PURE__ */ jsx(TableHead, { children: "Student" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Hostel" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Room" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Parent" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Mobile" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Status" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: paginated.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 8, className: "text-center py-6 text-muted-foreground", children: "No student records found." }) }) : paginated.map((student) => {
          const isSelected = selectedIds.includes(student.id);
          return /* @__PURE__ */ jsxs(TableRow, { className: isSelected ? "bg-primary/5 hover:bg-primary/10" : void 0, children: [
            /* @__PURE__ */ jsx(TableCell, { className: "w-12 text-center", children: /* @__PURE__ */ jsx("input", { type: "checkbox", className: "h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer align-middle", checked: isSelected, onChange: () => toggleSelectStudent(student.id) }) }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxs(Avatar, { className: "h-9 w-9 border border-primary/20 shadow-sm", children: [
                student.profile_photo && /* @__PURE__ */ jsx(AvatarImage, { src: student.profile_photo, alt: student.name, className: "object-cover" }),
                /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-accent text-accent-foreground text-xs font-semibold", children: student.name.split(" ").map((part) => part[0]).slice(0, 2).join("") })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "font-semibold text-foreground", children: student.name }),
                /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
                  student.student_id,
                  " · ",
                  student.student_year || "N/A"
                ] })
              ] })
            ] }) }),
            /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: student.hostel_name || "N/A" }),
            /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: formatRoom(student.room_number) }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxs(Avatar, { className: "h-8 w-8 border border-muted shadow-sm", children: [
                student.parent_profile_photo && /* @__PURE__ */ jsx(AvatarImage, { src: student.parent_profile_photo, alt: "Parent", className: "object-cover" }),
                /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-secondary text-secondary-foreground text-xs font-semibold", children: "P" })
              ] }),
              /* @__PURE__ */ jsx("span", { className: "font-mono text-xs font-medium", children: student.parent_mobile })
            ] }) }),
            /* @__PURE__ */ jsx(TableCell, { className: "font-mono text-xs font-medium", children: student.mobile }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { className: student.status === "ACTIVE" ? "bg-success text-success-foreground hover:bg-success" : "bg-warning/20 text-warning-foreground dark:text-warning hover:bg-warning/20", children: student.status === "ACTIVE" ? "In Hostel" : "Disabled" }) }),
            /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-1", children: [
              /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", onClick: () => setView(student), title: "View profile", children: /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", title: "Edit student", onClick: () => {
                setEditingStudent(student);
                setSelectedHostel(student.hostel_id ?? "");
              }, children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", className: "text-rose-600 hover:text-rose-700 hover:bg-rose-50", title: "Delete student", onClick: () => {
                setSelectedIds([student.id]);
                setBulkDeleteOpen(true);
              }, children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
            ] }) })
          ] }, student.id);
        }) })
      ] }) }),
      totalPages > 1 && /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-between border-t border-border/40 pt-4", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Showing ",
          /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: (page - 1) * itemsPerPage + 1 }),
          " to",
          " ",
          /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: Math.min(page * itemsPerPage, filtered.length) }),
          " ",
          "of ",
          /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: filtered.length }),
          " students"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: () => setPage((p) => Math.max(p - 1, 1)), disabled: page === 1, className: "h-8 text-xs font-semibold", children: "Previous" }),
          Array.from({
            length: totalPages
          }).map((_, idx) => {
            const pNum = idx + 1;
            return /* @__PURE__ */ jsx(Button, { variant: page === pNum ? "default" : "outline", size: "sm", onClick: () => setPage(pNum), className: "h-8 w-8 text-xs font-semibold p-0", children: pNum }, pNum);
          }),
          /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: () => setPage((p) => Math.min(p + 1, totalPages)), disabled: page === totalPages, className: "h-8 text-xs font-semibold", children: "Next" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: bulkDeleteOpen, onOpenChange: setBulkDeleteOpen, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/15 text-rose-600", children: /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs(DialogTitle, { className: "text-lg font-bold text-rose-600", children: [
            "Delete ",
            selectedIds.length,
            " Student",
            selectedIds.length > 1 ? "s" : "",
            "?"
          ] }),
          /* @__PURE__ */ jsx(DialogDescription, { className: "text-xs", children: "This action is irreversible and permanently deletes records." })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 py-3 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxs("p", { children: [
          "You are about to permanently delete ",
          /* @__PURE__ */ jsxs("strong", { className: "text-foreground", children: [
            selectedIds.length,
            " selected student(s)"
          ] }),
          ":"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "max-h-40 overflow-y-auto rounded-lg border border-border/80 bg-muted/40 p-2.5 space-y-1.5", children: list.filter((s) => selectedIds.includes(s.id)).map((s) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs py-0.5 border-b border-border/40 last:border-0", children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: s.name }),
          /* @__PURE__ */ jsxs("span", { className: "font-mono text-muted-foreground", children: [
            s.student_id,
            " (",
            formatRoom(s.room_number),
            ")"
          ] })
        ] }, s.id)) }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-rose-500/10 p-3 text-[11px] text-rose-800 dark:text-rose-300 font-medium leading-relaxed border border-rose-500/20", children: [
          "⚠️ ",
          /* @__PURE__ */ jsx("strong", { children: "Warning:" }),
          " Deleting these students will automatically purge all of their leave requests, gate passes, GPS logs, and parent login credentials associated with these mobile numbers."
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { className: "gap-2", children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: () => setBulkDeleteOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxs(Button, { variant: "destructive", size: "sm", className: "gap-1.5", disabled: bulkDeleteMutation.isPending, onClick: () => bulkDeleteMutation.mutate(selectedIds), children: [
          /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
          bulkDeleteMutation.isPending ? "Deleting..." : `Yes, Permanently Delete (${selectedIds.length})`
        ] })
      ] })
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
          /* @__PURE__ */ jsxs(Avatar, { className: "h-16 w-16 border border-primary/20 shadow", children: [
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
          /* @__PURE__ */ jsx(Info, { k: "Room", v: formatRoom(view.room_number) }),
          /* @__PURE__ */ jsx(Info, { k: "Mobile", v: view.mobile }),
          /* @__PURE__ */ jsx(Info, { k: "Parent", v: view.parent_mobile }),
          /* @__PURE__ */ jsx(Info, { k: "Student Year", v: view.student_year || "N/A" }),
          /* @__PURE__ */ jsx(Info, { k: "Status", v: view.status })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 pt-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid gap-2 rounded-xl border border-border/60 p-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxs(Avatar, { className: "h-12 w-12 border border-primary/20", children: [
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
              /* @__PURE__ */ jsxs(Avatar, { className: "h-12 w-12 border border-muted", children: [
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
          /* @__PURE__ */ jsxs(Button, { type: "button", variant: "destructive", disabled: deleteMutation.isPending, onClick: () => {
            setSelectedIds([editingStudent.id]);
            setEditingStudent(null);
            setBulkDeleteOpen(true);
          }, children: [
            /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 mr-1.5" }),
            " Delete Student"
          ] }),
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
