import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState, useRef, useMemo } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { FileSpreadsheet, Camera, Download, Upload, X, Search, CheckCircle2, XCircle, AlertTriangle, Image, FolderUp, Trash2 } from "lucide-react";
import { P as PageHeader } from "./dashboard-shell-CcdhqBCX.mjs";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./card--WHMiqoo.mjs";
import { f as getHostels, o as getHostelStudents, C as importStudents, D as bulkUploadPhotos, B as Button } from "./api-MNZaOU0e.mjs";
import { B as Badge } from "./badge-ETOW0xln.mjs";
import { toast } from "sonner";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "./router-DhAOx7wo.mjs";
import "@radix-ui/react-avatar";
import "clsx";
import "tailwind-merge";
function parseCsvLine(line) {
  const values = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      i += 1;
      continue;
    }
    if (char === '"') {
      quoted = !quoted;
      continue;
    }
    if (char === "," && !quoted) {
      values.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  values.push(current.trim());
  return values;
}
function parseCsv(text) {
  const cleanText = String(text).replace(/^\uFEFF/, "");
  const lines = cleanText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length === 0) return [];
  const headers = parseCsvLine(lines[0]).map((header) => header.toLowerCase().replace(/["']/g, "").replace(/[\s\-_]+/g, "_").trim());
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });
    return row;
  });
}
function normalizeStudentYear(val) {
  if (!val) return "";
  const clean = val.trim().toLowerCase();
  if (!clean) return "";
  if (clean.includes("1") || clean.includes("first")) return "1st Year";
  if (clean.includes("2") || clean.includes("second")) return "2nd Year";
  if (clean.includes("3") || clean.includes("third")) return "3rd Year";
  if (clean.includes("4") || clean.includes("fourth")) return "4th Year";
  return val.trim();
}
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
function extractPhotoDetails(filename) {
  const lastDot = filename.lastIndexOf(".");
  const baseName = (lastDot > 0 ? filename.substring(0, lastDot) : filename).trim();
  if (/^(p_|p-|parent_|parent-)/i.test(baseName)) {
    const studentId = baseName.replace(/^(p_|p-|parent_|parent-)/i, "").trim();
    return {
      student_id: studentId,
      type: "PARENT"
    };
  }
  return {
    student_id: baseName,
    type: "STUDENT"
  };
}
function ImportPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("csv");
  const [file, setFile] = useState(null);
  const [previewRows, setPreviewRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dragActive, setDragActive] = useState(false);
  const [importedCount, setImportedCount] = useState(null);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoSearchQuery, setPhotoSearchQuery] = useState("");
  const [photoStatusFilter, setPhotoStatusFilter] = useState("ALL");
  const [photoTypeFilter, setPhotoTypeFilter] = useState("ALL");
  const [photosDragActive, setPhotosDragActive] = useState(false);
  const [photosImportedResult, setPhotosImportedResult] = useState(null);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const hostelsQuery = useQuery({
    queryKey: ["active-hostels"],
    queryFn: getHostels
  });
  const studentsQuery = useQuery({
    queryKey: ["hostel-students"],
    queryFn: getHostelStudents
  });
  const hostels = hostelsQuery.data?.data ?? [];
  const students = studentsQuery.data?.data ?? [];
  const importMutation = useMutation({
    mutationFn: importStudents,
    onSuccess: async (data) => {
      setImportedCount(data.data.imported);
      setFile(null);
      setPreviewRows([]);
      await queryClient.invalidateQueries({
        queryKey: ["hostel-students"]
      });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Import failed")
  });
  const bulkPhotoMutation = useMutation({
    mutationFn: bulkUploadPhotos,
    onSuccess: async (res) => {
      setPhotosImportedResult(res.data);
      photoFiles.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      setPhotoFiles([]);
      await queryClient.invalidateQueries({
        queryKey: ["hostel-students"]
      });
      toast.success(`Successfully updated ${res.data.updated} photos!`);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Photo upload failed")
  });
  const validateRows = (rows, existingStudents = [], hostelsList = []) => {
    const validated = [];
    const seenIds = /* @__PURE__ */ new Set();
    const seenMobiles = /* @__PURE__ */ new Set();
    rows.forEach((row) => {
      const studentId = String(row.student_id || row.studentid || row.id || row.student || row.admission_no || "").trim();
      const name = String(row.student_name || row.name || "").trim();
      const roomNumber = String(row.room_number || row.roomno || row.room || "").trim();
      const rawMobile = String(row.student_mobile || row.mobile || row.phone || "").trim();
      const rawParentMobile = String(row.parent_mobile || row.parentmobile || row.parent_phone || "").trim();
      const studentYear = String(row.student_year || row.studentyear || row.year || row.class || row.student_class || "").trim();
      const hostelName = String(row.hostel || row.hostel_name || row.hostel_id || "").trim();
      const password = String(row.student_password || row.password || "").trim();
      const parentPassword = String(row.parent_password || row.parentpassword || "").trim();
      const cleanMobile = rawMobile.replace(/\D/g, "");
      const cleanParentMobile = rawParentMobile.replace(/\D/g, "");
      const displayMobile = cleanMobile.length === 10 ? cleanMobile : rawMobile;
      const displayParentMobile = cleanParentMobile.length === 10 ? cleanParentMobile : rawParentMobile;
      const item = {
        student_id: studentId,
        name,
        room_number: roomNumber,
        mobile: displayMobile,
        parent_mobile: displayParentMobile,
        student_year: normalizeStudentYear(studentYear),
        hostel_name: hostelName,
        password,
        parent_password: parentPassword,
        status: "valid",
        action: "insert",
        messages: []
      };
      const missing = [];
      if (!studentId) missing.push("Student ID");
      if (!name) missing.push("Name");
      if (!roomNumber) missing.push("Room Number");
      if (!rawMobile) missing.push("Student Mobile");
      if (!rawParentMobile) missing.push("Parent Mobile");
      if (missing.length > 0) {
        item.status = "error";
        item.action = "skip";
        item.messages.push(`Missing mandatory fields: ${missing.join(", ")}`);
      }
      if (studentId) {
        if (seenIds.has(studentId.toLowerCase())) {
          item.status = "error";
          item.action = "skip";
          item.messages.push(`Duplicate Student ID found in this file`);
        } else {
          seenIds.add(studentId.toLowerCase());
        }
      }
      if (cleanMobile) {
        if (seenMobiles.has(cleanMobile)) {
          item.status = "error";
          item.action = "skip";
          item.messages.push(`Duplicate Student Mobile found in this file`);
        } else {
          seenMobiles.add(cleanMobile);
        }
      }
      if (rawMobile && cleanMobile.length !== 10) {
        if (item.status === "valid") item.status = "warning";
        item.messages.push(`Student mobile should be 10 digits (got ${cleanMobile.length})`);
      }
      if (rawParentMobile && cleanParentMobile.length !== 10) {
        if (item.status === "valid") item.status = "warning";
        item.messages.push(`Parent mobile should be 10 digits (got ${cleanParentMobile.length})`);
      }
      if (item.status !== "error" && studentId) {
        const matchingStudent = (existingStudents || []).find((s) => s && s.student_id && String(s.student_id).toLowerCase() === studentId.toLowerCase());
        if (matchingStudent) {
          item.status = "warning";
          item.action = "update";
          item.messages.push(`Matches existing student (${matchingStudent.name || "Existing"}); details will be overwritten`);
        }
      }
      if (item.status !== "error" && cleanMobile) {
        const studentWithSameMobile = (existingStudents || []).find((s) => s && s.mobile && String(s.mobile) === cleanMobile);
        if (studentWithSameMobile) {
          const existingId = String(studentWithSameMobile.student_id || "");
          if (existingId.toLowerCase() !== studentId.toLowerCase()) {
            item.status = "error";
            item.action = "skip";
            item.messages.push(`Mobile is already registered to student '${studentWithSameMobile.name || "Unknown"}' (ID: ${existingId})`);
          }
        }
      }
      if (item.status !== "error" && hostelName) {
        const hostelMatches = (hostelsList || []).some((h) => {
          if (!h) return false;
          const nameMatch = h.hostel_name ? String(h.hostel_name).toLowerCase() === hostelName.toLowerCase() : false;
          const idMatch = h.id ? String(h.id) === hostelName : false;
          const emailMatch = h.email ? String(h.email).toLowerCase() === hostelName.toLowerCase() : false;
          return nameMatch || idMatch || emailMatch;
        });
        if (!hostelMatches) {
          if (item.status === "valid") item.status = "warning";
          item.messages.push(`Hostel '${hostelName}' not found; will default to primary hostel`);
        }
      }
      validated.push(item);
    });
    return validated;
  };
  const handleFile = (selectedFile) => {
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = String(event.target?.result ?? "");
        const rawRows = parseCsv(text);
        if (rawRows.length === 0) {
          toast.error("CSV file is empty or has no data rows.");
          setPreviewRows([]);
          return;
        }
        const validated = validateRows(rawRows, students, hostels);
        setPreviewRows(validated);
        toast.info(`Successfully parsed ${validated.length} rows. Please review below.`);
      } catch (err) {
        console.error("CSV Parse / Validation Error:", err);
        const errMsg = err instanceof Error ? err.message : "Failed to parse file. Please upload a valid CSV.";
        toast.error(errMsg);
        setPreviewRows([]);
      }
    };
    reader.readAsText(selectedFile);
  };
  const clearCsv = () => {
    setFile(null);
    setPreviewRows([]);
    setSearchQuery("");
  };
  const processImageFiles = (files) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|bmp)$/i.test(f.name));
    if (fileArray.length === 0) {
      toast.error("No valid image files found (.jpg, .jpeg, .png, .webp).");
      return;
    }
    const newItems = fileArray.map((f) => {
      const {
        student_id,
        type
      } = extractPhotoDetails(f.name);
      const matchingStudent = (students || []).find((s) => s && s.student_id && String(s.student_id).toLowerCase() === student_id.toLowerCase());
      const status = !student_id ? "invalid" : matchingStudent ? "matched" : "unmatched";
      const messages = [];
      if (!student_id) {
        messages.push("Unable to extract student Roll Number from filename");
      } else if (!matchingStudent) {
        messages.push(`No student with Roll Number '${student_id}' found in your hostel`);
      }
      return {
        id: `${f.name}-${f.size}-${Date.now()}-${Math.random()}`,
        file: f,
        filename: f.name,
        previewUrl: URL.createObjectURL(f),
        student_id,
        type,
        status,
        matchedStudent: matchingStudent ? {
          id: matchingStudent.id,
          student_id: matchingStudent.student_id,
          name: matchingStudent.name,
          room_number: matchingStudent.room_number,
          hostel_id: matchingStudent.hostel_id
        } : void 0,
        messages
      };
    });
    setPhotoFiles((prev) => [...prev, ...newItems]);
    const matchedCount = newItems.filter((i) => i.status === "matched").length;
    toast.info(`Added ${newItems.length} photos (${matchedCount} matched with existing students).`);
  };
  const handlePhotosDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setPhotosDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFiles(e.dataTransfer.files);
    }
  };
  const removePhotoItem = (id) => {
    setPhotoFiles((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  };
  const clearAllPhotos = () => {
    photoFiles.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setPhotoFiles([]);
    setPhotoSearchQuery("");
  };
  const handleUploadMatchedPhotos = async () => {
    const matchedPhotos = photoFiles.filter((p) => p.status === "matched");
    if (matchedPhotos.length === 0) {
      toast.error("No matched photos to upload. Ensure filenames match student roll numbers.");
      return;
    }
    try {
      const payload = [];
      for (const p of matchedPhotos) {
        const base64 = await fileToBase64(p.file);
        payload.push({
          student_id: p.student_id,
          type: p.type,
          photo_base64: base64,
          filename: p.filename
        });
      }
      bulkPhotoMutation.mutate(payload);
    } catch (err) {
      toast.error("Failed to prepare images for upload.");
    }
  };
  const downloadTemplate = () => {
    const headers = ["Student ID", "Student Name", "Room Number", "Student Mobile", "Parent Mobile", "Student Year", "Hostel Name", "Student Password", "Parent Password"];
    const sampleRow = ["21N81A66G4", "Mayur", "Room 12", "6281192139", "9908006588", "1st Year", "hosteltest", "Student@12345", "Parent@12345"];
    const csvRows = [headers.map((h) => `"${h}"`).join(","), sampleRow.map((r) => `"${r}"`).join(",")];
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const stats = useMemo(() => {
    return {
      total: previewRows.length,
      errors: previewRows.filter((r) => r.status === "error").length,
      warnings: previewRows.filter((r) => r.status === "warning").length,
      valid: previewRows.filter((r) => r.status === "valid").length
    };
  }, [previewRows]);
  const filteredPreviewRows = useMemo(() => {
    return previewRows.filter((row) => {
      const matchesSearch = row.student_id.toLowerCase().includes(searchQuery.toLowerCase()) || row.name.toLowerCase().includes(searchQuery.toLowerCase()) || row.hostel_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || row.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [previewRows, searchQuery, statusFilter]);
  const photoStats = useMemo(() => {
    const matched = photoFiles.filter((p) => p.status === "matched");
    return {
      total: photoFiles.length,
      matched: matched.length,
      studentPhotos: matched.filter((p) => p.type === "STUDENT").length,
      parentPhotos: matched.filter((p) => p.type === "PARENT").length,
      unmatched: photoFiles.filter((p) => p.status !== "matched").length
    };
  }, [photoFiles]);
  const filteredPhotoFiles = useMemo(() => {
    return photoFiles.filter((item) => {
      const query = photoSearchQuery.toLowerCase();
      const matchesSearch = item.filename.toLowerCase().includes(query) || item.student_id.toLowerCase().includes(query) || item.matchedStudent && item.matchedStudent.name.toLowerCase().includes(query);
      const matchesStatus = photoStatusFilter === "ALL" || photoStatusFilter === "matched" && item.status === "matched" || photoStatusFilter === "unmatched" && item.status !== "matched";
      const matchesType = photoTypeFilter === "ALL" || item.type === photoTypeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [photoFiles, photoSearchQuery, photoStatusFilter, photoTypeFilter]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Student Data & Photos Import", description: "Bulk onboard students via CSV and bulk upload student & parent photos automatically linked by roll number." }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 flex border-b border-border/60", children: [
      /* @__PURE__ */ jsxs("button", { onClick: () => setActiveTab("csv"), className: `flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${activeTab === "csv" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`, children: [
        /* @__PURE__ */ jsx(FileSpreadsheet, { className: "h-4 w-4" }),
        "Import Students (CSV)",
        previewRows.length > 0 && /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "ml-1 px-1.5 py-0 text-[10px]", children: previewRows.length })
      ] }),
      /* @__PURE__ */ jsxs("button", { onClick: () => setActiveTab("photos"), className: `flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${activeTab === "photos" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`, children: [
        /* @__PURE__ */ jsx(Camera, { className: "h-4 w-4" }),
        "Bulk Upload Photos (Roll No.)",
        photoFiles.length > 0 && /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "ml-1 px-1.5 py-0 text-[10px]", children: photoFiles.length })
      ] })
    ] }),
    activeTab === "csv" && /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxs(Card, { className: "lg:col-span-1", children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Upload CSV File" }) }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsx("div", { onDragEnter: (e) => {
            e.preventDefault();
            setDragActive(true);
          }, onDragOver: (e) => {
            e.preventDefault();
            setDragActive(true);
          }, onDragLeave: (e) => {
            e.preventDefault();
            setDragActive(false);
          }, onDrop: (e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFile(e.dataTransfer.files[0]);
            }
          }, className: `flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition ${dragActive ? "border-primary bg-primary/10" : "border-border bg-muted/30 hover:border-primary/40 hover:bg-accent/30"}`, children: /* @__PURE__ */ jsxs("label", { className: "flex h-full w-full cursor-pointer flex-col items-center justify-center", children: [
            /* @__PURE__ */ jsx(FileSpreadsheet, { className: "h-10 w-10 text-muted-foreground" }),
            /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm font-medium", children: file ? file.name : "Click to choose CSV file" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "or drag and drop here" }),
            /* @__PURE__ */ jsx("input", { type: "file", accept: ".csv,text/csv", className: "hidden", onChange: (e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            } })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 rounded-lg border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsx("p", { className: "mb-1 font-medium text-foreground", children: "Expected columns" }),
            "Student ID · Student Name · Room Number · Student Mobile · Parent Mobile · Student Year · Hostel Name · Student Password · Parent Password"
          ] }),
          /* @__PURE__ */ jsxs(Button, { variant: "outline", className: "mt-3 w-full border-primary/20 text-primary hover:bg-primary/5 hover:text-primary", onClick: downloadTemplate, children: [
            /* @__PURE__ */ jsx(Download, { className: "mr-2 h-4 w-4" }),
            " Download CSV Template"
          ] }),
          file && /* @__PURE__ */ jsxs("div", { className: "mt-3 flex flex-col gap-2", children: [
            /* @__PURE__ */ jsxs(Button, { className: "w-full", disabled: importMutation.isPending || stats.errors === stats.total, onClick: () => {
              if (!file) return;
              importMutation.mutate(file);
            }, children: [
              /* @__PURE__ */ jsx(Upload, { className: "mr-2 h-4 w-4" }),
              " Import ",
              stats.valid + stats.warnings,
              " Valid Students"
            ] }),
            /* @__PURE__ */ jsxs(Button, { variant: "ghost", className: "w-full text-destructive hover:bg-destructive/10", onClick: clearCsv, children: [
              /* @__PURE__ */ jsx(X, { className: "mr-2 h-4 w-4" }),
              " Cancel / Clear File"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-2", children: previewRows.length > 0 ? /* @__PURE__ */ jsxs(Card, { className: "w-full", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "border-b border-border/50", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(CardTitle, { className: "text-base font-semibold", children: "Verification & Preview" }),
              /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-xs text-muted-foreground", children: "Please review safety checks before finalizing import." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-1.5", children: [
              /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "px-2.5 py-1 text-xs font-semibold", children: [
                "Total: ",
                stats.total
              ] }),
              /* @__PURE__ */ jsxs(Badge, { className: "bg-success px-2.5 py-1 font-semibold text-success-foreground", children: [
                "Ready: ",
                stats.valid
              ] }),
              /* @__PURE__ */ jsxs(Badge, { className: "bg-warning px-2.5 py-1 font-semibold text-warning-foreground", children: [
                "Overwrite: ",
                stats.warnings
              ] }),
              stats.errors > 0 && /* @__PURE__ */ jsxs(Badge, { className: "bg-destructive px-2.5 py-1 font-semibold text-destructive-foreground", children: [
                "Errors (Skip): ",
                stats.errors
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "relative flex-1", children: [
              /* @__PURE__ */ jsx(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsx("input", { type: "text", placeholder: "Search preview records…", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring" })
            ] }),
            /* @__PURE__ */ jsxs("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), className: "h-9 w-36 rounded-md border border-input bg-background px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring", children: [
              /* @__PURE__ */ jsx("option", { value: "ALL", children: "All Statuses" }),
              /* @__PURE__ */ jsx("option", { value: "valid", children: "Ready (Valid)" }),
              /* @__PURE__ */ jsx("option", { value: "warning", children: "Overwrites/Warnings" }),
              /* @__PURE__ */ jsx("option", { value: "error", children: "Errors Only" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsx("div", { className: "max-h-[480px] overflow-y-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full border-collapse text-left text-xs", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border bg-muted/30 font-semibold text-muted-foreground", children: [
            /* @__PURE__ */ jsx("th", { className: "p-3", children: "Student ID" }),
            /* @__PURE__ */ jsx("th", { className: "p-3", children: "Name" }),
            /* @__PURE__ */ jsx("th", { className: "p-3", children: "Room" }),
            /* @__PURE__ */ jsx("th", { className: "p-3", children: "Mobile" }),
            /* @__PURE__ */ jsx("th", { className: "p-3", children: "Parent Mobile" }),
            /* @__PURE__ */ jsx("th", { className: "p-3", children: "Hostel" }),
            /* @__PURE__ */ jsx("th", { className: "p-3", children: "Action" }),
            /* @__PURE__ */ jsx("th", { className: "p-3", children: "Status Check" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/60", children: filteredPreviewRows.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 8, className: "p-6 text-center text-muted-foreground", children: "No matching preview records found." }) }) : filteredPreviewRows.map((row, idx) => /* @__PURE__ */ jsxs("tr", { className: `transition hover:bg-muted/10 ${row.status === "error" ? "bg-destructive/5" : ""}`, children: [
            /* @__PURE__ */ jsx("td", { className: "p-3 font-semibold text-foreground", children: row.student_id || /* @__PURE__ */ jsx("span", { className: "font-medium italic text-destructive", children: "Empty" }) }),
            /* @__PURE__ */ jsx("td", { className: "p-3 font-medium", children: row.name || /* @__PURE__ */ jsx("span", { className: "font-medium italic text-destructive", children: "Empty" }) }),
            /* @__PURE__ */ jsx("td", { className: "p-3", children: row.room_number || /* @__PURE__ */ jsx("span", { className: "font-medium italic text-destructive", children: "Empty" }) }),
            /* @__PURE__ */ jsx("td", { className: "p-3", children: row.mobile || /* @__PURE__ */ jsx("span", { className: "font-medium italic text-destructive", children: "Empty" }) }),
            /* @__PURE__ */ jsx("td", { className: "p-3", children: row.parent_mobile || /* @__PURE__ */ jsx("span", { className: "font-medium italic text-destructive", children: "Empty" }) }),
            /* @__PURE__ */ jsx("td", { className: "p-3", children: row.hostel_name || /* @__PURE__ */ jsx("span", { className: "italic text-muted-foreground", children: "Default" }) }),
            /* @__PURE__ */ jsxs("td", { className: "p-3", children: [
              row.action === "insert" && /* @__PURE__ */ jsx(Badge, { className: "rounded bg-success/15 px-1.5 py-0.5 font-medium text-success hover:bg-success/15", children: "Insert" }),
              row.action === "update" && /* @__PURE__ */ jsx(Badge, { className: "rounded bg-warning/15 px-1.5 py-0.5 font-medium text-warning-foreground hover:bg-warning/15", children: "Overwrite" }),
              row.action === "skip" && /* @__PURE__ */ jsx(Badge, { className: "rounded bg-destructive/15 px-1.5 py-0.5 font-medium text-destructive hover:bg-destructive/15", children: "Skip" })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "max-w-[200px] p-3", children: row.status === "valid" ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 font-medium text-success", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4.5 w-4.5 shrink-0" }),
              /* @__PURE__ */ jsx("span", { children: "Ready to import" })
            ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-1", children: row.messages.map((msg, midx) => /* @__PURE__ */ jsxs("div", { className: `flex items-start gap-1.5 font-medium ${row.status === "error" ? "text-destructive" : "text-warning-foreground"}`, children: [
              row.status === "error" ? /* @__PURE__ */ jsx(XCircle, { className: "mt-0.5 h-4.5 w-4.5 shrink-0" }) : /* @__PURE__ */ jsx(AlertTriangle, { className: "mt-0.5 h-4.5 w-4.5 shrink-0" }),
              /* @__PURE__ */ jsx("span", { children: msg })
            ] }, midx)) }) })
          ] }, idx)) })
        ] }) }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 rounded-b-xl border-t border-border/50 bg-muted/10 p-4 sm:flex-row sm:justify-end", children: [
          /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: clearCsv, children: [
            /* @__PURE__ */ jsx(X, { className: "mr-1.5 h-4 w-4" }),
            " Cancel / Clear"
          ] }),
          /* @__PURE__ */ jsxs(Button, { disabled: importMutation.isPending || stats.errors === stats.total, onClick: () => {
            if (!file) return;
            importMutation.mutate(file);
          }, children: [
            /* @__PURE__ */ jsx(Upload, { className: "mr-2 h-4 w-4" }),
            " Confirm & Import ",
            stats.valid + stats.warnings,
            " Students"
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsxs(Card, { className: "w-full", children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Import Notes & Guidelines" }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4 text-sm leading-relaxed text-muted-foreground", children: [
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Branch Routing (Hostel Name):" }),
            " You can specify which hostel branch each student belongs to by entering the hostel's name (e.g. ",
            /* @__PURE__ */ jsx("em", { children: "hosteltest" }),
            ") in the ",
            /* @__PURE__ */ jsx("em", { children: "Hostel Name" }),
            " column. If left blank, students will default to your primary hostel branch."
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Mandatory Columns:" }),
            " ",
            /* @__PURE__ */ jsx("em", { children: "Student ID" }),
            ", ",
            /* @__PURE__ */ jsx("em", { children: "Student Name" }),
            ", ",
            /* @__PURE__ */ jsx("em", { children: "Room Number" }),
            ", ",
            /* @__PURE__ */ jsx("em", { children: "Student Mobile" }),
            ", and ",
            /* @__PURE__ */ jsx("em", { children: "Parent Mobile" }),
            " are strictly required for every student row. Rows missing any of these values will be automatically skipped."
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("strong", { children: "User Account Passwords:" }),
            " You can optionally supply custom passwords for the student and parent in the ",
            /* @__PURE__ */ jsx("em", { children: "Student Password" }),
            " and ",
            /* @__PURE__ */ jsx("em", { children: "Parent Password" }),
            " columns. If left empty, they default to ",
            /* @__PURE__ */ jsx("em", { children: "Student@12345" }),
            " and ",
            /* @__PURE__ */ jsx("em", { children: "Parent@12345" }),
            " respectively."
          ] }),
          /* @__PURE__ */ jsx("p", { children: "The import system automatically detects duplicates and updates existing student records using the unique combination of hostel and student ID." }),
          /* @__PURE__ */ jsxs("p", { className: "font-medium text-foreground/80", children: [
            "💡 Tip: Click the ",
            /* @__PURE__ */ jsx("strong", { children: "Download CSV Template" }),
            " button on the left to get a pre-formatted spreadsheet you can open directly in Excel!"
          ] })
        ] })
      ] }) })
    ] }),
    activeTab === "photos" && /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxs(Card, { className: "lg:col-span-1", children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Select Photos / Folder" }) }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxs("div", { onDragEnter: (e) => {
            e.preventDefault();
            setPhotosDragActive(true);
          }, onDragOver: (e) => {
            e.preventDefault();
            setPhotosDragActive(true);
          }, onDragLeave: (e) => {
            e.preventDefault();
            setPhotosDragActive(false);
          }, onDrop: handlePhotosDrop, className: `flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-7 text-center transition ${photosDragActive ? "border-primary bg-primary/10" : "border-border bg-muted/30 hover:border-primary/40 hover:bg-accent/30"}`, children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(Camera, { className: "h-6 w-6" }) }),
            /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm font-semibold", children: "Drop Student & Parent Photos" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "JPG, PNG, or WEBP images" }),
            /* @__PURE__ */ jsx("input", { ref: fileInputRef, type: "file", accept: "image/*", multiple: true, className: "hidden", onChange: (e) => {
              if (e.target.files && e.target.files.length > 0) {
                processImageFiles(e.target.files);
              }
            } }),
            /* @__PURE__ */ jsx(
              "input",
              {
                ref: folderInputRef,
                type: "file",
                accept: "image/*",
                webkitdirectory: "",
                directory: "",
                multiple: true,
                className: "hidden",
                onChange: (e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    processImageFiles(e.target.files);
                  }
                }
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-col gap-2 w-full", children: [
              /* @__PURE__ */ jsxs(Button, { type: "button", size: "sm", variant: "outline", className: "w-full text-xs", onClick: () => fileInputRef.current?.click(), children: [
                /* @__PURE__ */ jsx(Image, { className: "mr-1.5 h-3.5 w-3.5" }),
                " Choose Photos (1 or more)"
              ] }),
              /* @__PURE__ */ jsxs(Button, { type: "button", size: "sm", variant: "outline", className: "w-full text-xs", onClick: () => folderInputRef.current?.click(), children: [
                /* @__PURE__ */ jsx(FolderUp, { className: "mr-1.5 h-3.5 w-3.5" }),
                " Choose Entire Folder"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-2 rounded-lg border border-border/60 bg-muted/20 p-3 text-xs", children: [
            /* @__PURE__ */ jsx("p", { className: "font-semibold text-foreground", children: "File Naming Rules" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1.5 text-muted-foreground", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-1.5", children: [
                /* @__PURE__ */ jsx("span", { className: "font-semibold text-primary", children: "Student Photo:" }),
                /* @__PURE__ */ jsxs("span", { children: [
                  "Name with Roll Number (e.g. ",
                  /* @__PURE__ */ jsx("code", { className: "rounded bg-muted px-1 py-0.5 font-mono text-[11px] text-foreground", children: "21N81A0001.jpg" }),
                  ")"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-1.5", children: [
                /* @__PURE__ */ jsx("span", { className: "font-semibold text-info", children: "Parent Photo:" }),
                /* @__PURE__ */ jsxs("span", { children: [
                  "Prefix with ",
                  /* @__PURE__ */ jsx("code", { className: "rounded bg-muted px-1 py-0.5 font-mono text-[11px] text-foreground", children: "p_" }),
                  " (e.g. ",
                  /* @__PURE__ */ jsx("code", { className: "rounded bg-muted px-1 py-0.5 font-mono text-[11px] text-foreground", children: "p_21N81A0001.jpg" }),
                  ")"
                ] })
              ] })
            ] })
          ] }),
          photoFiles.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-col gap-2", children: [
            /* @__PURE__ */ jsxs(Button, { className: "w-full", disabled: bulkPhotoMutation.isPending || photoStats.matched === 0, onClick: handleUploadMatchedPhotos, children: [
              /* @__PURE__ */ jsx(Upload, { className: "mr-2 h-4 w-4" }),
              " Upload ",
              photoStats.matched,
              " Matched Photos"
            ] }),
            /* @__PURE__ */ jsxs(Button, { variant: "ghost", className: "w-full text-destructive hover:bg-destructive/10", onClick: clearAllPhotos, children: [
              /* @__PURE__ */ jsx(Trash2, { className: "mr-2 h-4 w-4" }),
              " Clear All Photos (",
              photoFiles.length,
              ")"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-2", children: photoFiles.length > 0 ? /* @__PURE__ */ jsxs(Card, { className: "w-full", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "border-b border-border/50 pb-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(CardTitle, { className: "text-base font-semibold", children: "Photos Preview & Match Check" }),
              /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-xs text-muted-foreground", children: "Roll numbers are automatically extracted from filenames and verified." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-1.5", children: [
              /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "px-2.5 py-1 text-xs font-semibold", children: [
                "Total: ",
                photoStats.total
              ] }),
              /* @__PURE__ */ jsxs(Badge, { className: "bg-success px-2.5 py-1 font-semibold text-success-foreground", children: [
                "Matched: ",
                photoStats.matched
              ] }),
              /* @__PURE__ */ jsxs(Badge, { className: "bg-primary/20 text-primary border-primary/30 px-2 py-0.5 text-xs font-medium", children: [
                "Student: ",
                photoStats.studentPhotos
              ] }),
              /* @__PURE__ */ jsxs(Badge, { className: "bg-info/20 text-info border-info/30 px-2 py-0.5 text-xs font-medium", children: [
                "Parent: ",
                photoStats.parentPhotos
              ] }),
              photoStats.unmatched > 0 && /* @__PURE__ */ jsxs(Badge, { className: "bg-destructive px-2.5 py-1 font-semibold text-destructive-foreground", children: [
                "Unmatched: ",
                photoStats.unmatched
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 grid gap-2 sm:grid-cols-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "relative sm:col-span-1", children: [
              /* @__PURE__ */ jsx(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsx("input", { type: "text", placeholder: "Search roll no, student…", value: photoSearchQuery, onChange: (e) => setPhotoSearchQuery(e.target.value), className: "h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring" })
            ] }),
            /* @__PURE__ */ jsxs("select", { value: photoTypeFilter, onChange: (e) => setPhotoTypeFilter(e.target.value), className: "h-9 rounded-md border border-input bg-background px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring", children: [
              /* @__PURE__ */ jsx("option", { value: "ALL", children: "All Types (Student & Parent)" }),
              /* @__PURE__ */ jsx("option", { value: "STUDENT", children: "Student Photos Only" }),
              /* @__PURE__ */ jsx("option", { value: "PARENT", children: "Parent Photos Only" })
            ] }),
            /* @__PURE__ */ jsxs("select", { value: photoStatusFilter, onChange: (e) => setPhotoStatusFilter(e.target.value), className: "h-9 rounded-md border border-input bg-background px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring", children: [
              /* @__PURE__ */ jsx("option", { value: "ALL", children: "All Match Statuses" }),
              /* @__PURE__ */ jsx("option", { value: "matched", children: "Matched Students Only" }),
              /* @__PURE__ */ jsx("option", { value: "unmatched", children: "Unmatched / Errors" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsx("div", { className: "max-h-[500px] overflow-y-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full border-collapse text-left text-xs", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border bg-muted/30 font-semibold text-muted-foreground", children: [
            /* @__PURE__ */ jsx("th", { className: "p-3", children: "Preview" }),
            /* @__PURE__ */ jsx("th", { className: "p-3", children: "File Name" }),
            /* @__PURE__ */ jsx("th", { className: "p-3", children: "Extracted Roll No" }),
            /* @__PURE__ */ jsx("th", { className: "p-3", children: "Target" }),
            /* @__PURE__ */ jsx("th", { className: "p-3", children: "Matched Student" }),
            /* @__PURE__ */ jsx("th", { className: "p-3", children: "Status" }),
            /* @__PURE__ */ jsx("th", { className: "p-3 text-right", children: "Action" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/60", children: filteredPhotoFiles.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 7, className: "p-8 text-center text-muted-foreground", children: "No matching photos found." }) }) : filteredPhotoFiles.map((item) => /* @__PURE__ */ jsxs("tr", { className: `transition hover:bg-muted/10 ${item.status !== "matched" ? "bg-destructive/5" : ""}`, children: [
            /* @__PURE__ */ jsx("td", { className: "p-3", children: /* @__PURE__ */ jsx("img", { src: item.previewUrl, alt: item.filename, className: "h-10 w-10 rounded-lg object-cover border border-border/80 shadow-sm" }) }),
            /* @__PURE__ */ jsx("td", { className: "p-3 font-mono font-medium text-foreground max-w-[140px] truncate", title: item.filename, children: item.filename }),
            /* @__PURE__ */ jsx("td", { className: "p-3 font-semibold text-foreground", children: item.student_id ? /* @__PURE__ */ jsx("code", { className: "rounded bg-muted px-1.5 py-0.5 font-mono text-xs", children: item.student_id }) : /* @__PURE__ */ jsx("span", { className: "text-destructive italic", children: "Unknown" }) }),
            /* @__PURE__ */ jsx("td", { className: "p-3", children: item.type === "STUDENT" ? /* @__PURE__ */ jsx(Badge, { className: "bg-primary/15 text-primary hover:bg-primary/15 font-medium rounded px-2 py-0.5", children: "Student" }) : /* @__PURE__ */ jsx(Badge, { className: "bg-info/15 text-info hover:bg-info/15 font-medium rounded px-2 py-0.5", children: "Parent (p_)" }) }),
            /* @__PURE__ */ jsx("td", { className: "p-3", children: item.matchedStudent ? /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-semibold text-foreground", children: item.matchedStudent.name }),
              /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
                "Room ",
                item.matchedStudent.room_number || "N/A"
              ] })
            ] }) : /* @__PURE__ */ jsx("span", { className: "text-destructive font-medium text-xs", children: "Student Not Found" }) }),
            /* @__PURE__ */ jsx("td", { className: "p-3", children: item.status === "matched" ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 font-medium text-success", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 shrink-0" }),
              /* @__PURE__ */ jsx("span", { children: "Ready" })
            ] }) : /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 font-medium text-destructive", children: [
              /* @__PURE__ */ jsx(XCircle, { className: "h-4 w-4 shrink-0" }),
              /* @__PURE__ */ jsx("span", { children: item.messages[0] || "Unmatched" })
            ] }) }),
            /* @__PURE__ */ jsx("td", { className: "p-3 text-right", children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8 text-muted-foreground hover:text-destructive", onClick: () => removePhotoItem(item.id), children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) }) })
          ] }, item.id)) })
        ] }) }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 rounded-b-xl border-t border-border/50 bg-muted/10 p-4 sm:flex-row sm:justify-end", children: [
          /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: clearAllPhotos, children: [
            /* @__PURE__ */ jsx(X, { className: "mr-1.5 h-4 w-4" }),
            " Cancel / Clear All"
          ] }),
          /* @__PURE__ */ jsxs(Button, { disabled: bulkPhotoMutation.isPending || photoStats.matched === 0, onClick: handleUploadMatchedPhotos, children: [
            /* @__PURE__ */ jsx(Upload, { className: "mr-2 h-4 w-4" }),
            " Confirm & Upload ",
            photoStats.matched,
            " Photos"
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsxs(Card, { className: "w-full", children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Bulk Photos Guidelines & Instructions" }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4 text-sm leading-relaxed text-muted-foreground", children: [
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Automatic Roll Number Matching:" }),
            " You don't need to manually assign photos one-by-one. Simply name your image files according to the student's Roll Number / Student ID."
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border bg-card p-4 space-y-3", children: [
            /* @__PURE__ */ jsx("h4", { className: "font-semibold text-foreground", children: "Example File Names:" }),
            /* @__PURE__ */ jsxs("div", { className: "grid gap-2 text-xs", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded bg-muted/50 p-2", children: [
                /* @__PURE__ */ jsx("span", { className: "font-mono font-medium", children: "21N81A0001.jpg" }),
                /* @__PURE__ */ jsx("span", { className: "text-primary font-medium", children: "Student Profile Photo for 21N81A0001" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded bg-muted/50 p-2", children: [
                /* @__PURE__ */ jsx("span", { className: "font-mono font-medium", children: "p_21N81A0001.jpg" }),
                /* @__PURE__ */ jsx("span", { className: "text-info font-medium", children: "Parent Profile Photo for 21N81A0001" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded bg-muted/50 p-2", children: [
                /* @__PURE__ */ jsx("span", { className: "font-mono font-medium", children: "P-21N81A0002.png" }),
                /* @__PURE__ */ jsx("span", { className: "text-info font-medium", children: "Parent Profile Photo for 21N81A0002" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Folder Upload:" }),
            " Click ",
            /* @__PURE__ */ jsx("em", { children: '"Choose Entire Folder"' }),
            " to select a whole folder on your computer containing hundreds of student and parent pictures. The system will scan, preview, and match them instantly."
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Instant Live Preview:" }),
            " Once selected, you will see a scrollable preview on this screen with the student's name, room number, and match status before anything is uploaded."
          ] })
        ] })
      ] }) })
    ] }),
    importMutation.isPending && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center shadow-lg max-w-sm w-full", children: [
      /* @__PURE__ */ jsx("div", { className: "h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary" }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: "Importing Students" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Uploading and creating student records. Please wait..." })
    ] }) }),
    bulkPhotoMutation.isPending && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center shadow-lg max-w-sm w-full", children: [
      /* @__PURE__ */ jsx("div", { className: "h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary" }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: "Uploading Photos" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Processing and saving profile pictures to the server..." })
    ] }) }),
    importedCount !== null && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md space-y-4 rounded-xl border border-border bg-card p-6 text-center shadow-lg", children: [
      /* @__PURE__ */ jsx("div", { className: "mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-6 w-6" }) }),
      /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold", children: "Import Completed!" }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Successfully created/updated ",
        /* @__PURE__ */ jsxs("strong", { className: "text-foreground", children: [
          importedCount,
          " student records"
        ] }),
        " and their corresponding parent accounts."
      ] }),
      /* @__PURE__ */ jsx("div", { className: "pt-2", children: /* @__PURE__ */ jsx(Button, { className: "w-full", onClick: () => {
        setImportedCount(null);
        navigate({
          to: "/admin/students"
        });
      }, children: "Go to Students List" }) })
    ] }) }),
    photosImportedResult !== null && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md space-y-4 rounded-xl border border-border bg-card p-6 text-center shadow-lg", children: [
      /* @__PURE__ */ jsx("div", { className: "mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-6 w-6" }) }),
      /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold", children: "Photos Uploaded Successfully!" }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Successfully updated ",
        /* @__PURE__ */ jsxs("strong", { className: "text-foreground", children: [
          photosImportedResult.updated,
          " profile photos"
        ] }),
        " for students & parents."
      ] }),
      photosImportedResult.errors && photosImportedResult.errors.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-2 max-h-32 overflow-y-auto rounded bg-destructive/10 p-2 text-left text-xs text-destructive", children: [
        /* @__PURE__ */ jsxs("p", { className: "font-semibold mb-1", children: [
          "Skipped / Unmatched (",
          photosImportedResult.errors.length,
          "):"
        ] }),
        photosImportedResult.errors.map((err, i) => /* @__PURE__ */ jsxs("p", { children: [
          "• ",
          err.filename,
          ": ",
          err.reason
        ] }, i))
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 pt-2", children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", className: "w-full", onClick: () => setPhotosImportedResult(null), children: "Upload More Photos" }),
        /* @__PURE__ */ jsx(Button, { className: "w-full", onClick: () => {
          setPhotosImportedResult(null);
          navigate({
            to: "/admin/students"
          });
        }, children: "Go to Students List" })
      ] })
    ] }) })
  ] });
}
export {
  ImportPage as component
};
