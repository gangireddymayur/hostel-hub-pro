import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { FileSpreadsheet, Download, Upload, Search, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { P as PageHeader } from "./dashboard-shell-N5EM9cXY.mjs";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./card-BdELael-.mjs";
import { f as getHostels, t as getHostelStudents, A as importStudents, B as Button } from "./api-BQfmlz4g.mjs";
import { B as Badge } from "./badge-BIXbaEFs.mjs";
import { toast } from "sonner";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "./router-DB-aeRwC.mjs";
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
  const lines = String(text).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length === 0) return [];
  const headers = parseCsvLine(lines[0]).map((header) => header.toLowerCase().replace(/\s+/g, "_"));
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
function ImportPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [previewRows, setPreviewRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dragActive, setDragActive] = useState(false);
  const [importedCount, setImportedCount] = useState(null);
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
  const validateRows = (rows, existingStudents, hostelsList) => {
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
      if (rawMobile) {
        if (cleanMobile.length !== 10) {
          if (item.status === "valid") item.status = "warning";
          item.messages.push(`Student mobile should be exactly 10 digits (got ${cleanMobile.length})`);
        }
      }
      if (rawParentMobile) {
        if (cleanParentMobile.length !== 10) {
          if (item.status === "valid") item.status = "warning";
          item.messages.push(`Parent mobile should be exactly 10 digits (got ${cleanParentMobile.length})`);
        }
      }
      if (item.status !== "error" && studentId) {
        const matchingStudent = existingStudents.find((s) => s.student_id.toLowerCase() === studentId.toLowerCase());
        if (matchingStudent) {
          item.status = "warning";
          item.action = "update";
          item.messages.push(`Matches existing student (${matchingStudent.name}); details will be overwritten`);
        }
      }
      if (item.status !== "error" && cleanMobile) {
        const studentWithSameMobile = existingStudents.find((s) => s.mobile === cleanMobile);
        if (studentWithSameMobile) {
          if (studentWithSameMobile.student_id.toLowerCase() !== studentId.toLowerCase()) {
            item.status = "error";
            item.action = "skip";
            item.messages.push(`Mobile is already registered to student '${studentWithSameMobile.name}' (ID: ${studentWithSameMobile.student_id})`);
          }
        }
      }
      if (item.status !== "error" && hostelName) {
        const hostelMatches = hostelsList.some((h) => h.hostel_name.toLowerCase() === hostelName.toLowerCase() || h.id === hostelName || h.email.toLowerCase() === hostelName.toLowerCase());
        if (!hostelMatches) {
          if (item.status === "valid") {
            item.status = "warning";
          }
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
        const text = event.target?.result;
        const rawRows = parseCsv(text);
        const validated = validateRows(rawRows, students, hostels);
        setPreviewRows(validated);
        toast.info(`Successfully parsed ${validated.length} rows. Please review below.`);
      } catch (err) {
        toast.error("Failed to parse file. Please upload a valid CSV.");
        setPreviewRows([]);
      }
    };
    reader.readAsText(selectedFile);
  };
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0] ?? null;
    if (selectedFile) handleFile(selectedFile);
  };
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
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
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Import students", description: "Bulk upload students from a CSV file with automatic preview check." }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxs(Card, { className: "lg:col-span-1", children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Upload file" }) }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsx("div", { onDragEnter: handleDrag, onDragOver: handleDrag, onDragLeave: handleDrag, onDrop: handleDrop, className: `flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition ${dragActive ? "border-primary bg-primary/10" : "border-border bg-muted/30 hover:border-primary/40 hover:bg-accent/30"}`, children: /* @__PURE__ */ jsxs("label", { className: "w-full h-full flex flex-col items-center justify-center cursor-pointer", children: [
            /* @__PURE__ */ jsx(FileSpreadsheet, { className: "h-10 w-10 text-muted-foreground" }),
            /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm font-medium", children: file ? file.name : "Click to choose CSV file" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "or drag and drop here" }),
            /* @__PURE__ */ jsx("input", { type: "file", accept: ".csv", className: "hidden", onChange: handleFileChange })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 rounded-lg border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsx("p", { className: "mb-1 font-medium text-foreground", children: "Expected columns" }),
            "Student ID · Student Name · Room Number · Student Mobile · Parent Mobile · Student Year · Hostel Name · Student Password · Parent Password"
          ] }),
          /* @__PURE__ */ jsxs(Button, { variant: "outline", className: "mt-3 w-full border-primary/20 hover:bg-primary/5 text-primary hover:text-primary", onClick: downloadTemplate, children: [
            /* @__PURE__ */ jsx(Download, { className: "h-4 w-4 mr-2" }),
            " Download CSV Template"
          ] }),
          file && /* @__PURE__ */ jsxs(Button, { className: "mt-3 w-full", disabled: importMutation.isPending || stats.errors === stats.total, onClick: () => {
            if (!file) return;
            importMutation.mutate(file);
          }, children: [
            /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4" }),
            " Import ",
            stats.valid + stats.warnings,
            " Valid Students"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-2", children: previewRows.length > 0 ? /* @__PURE__ */ jsxs(Card, { className: "w-full", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "border-b border-border/50", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(CardTitle, { className: "text-base font-semibold", children: "Verification & Preview" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Please review safety checks before finalizing import." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-1.5", children: [
              /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "text-xs font-semibold px-2.5 py-1", children: [
                "Total: ",
                stats.total
              ] }),
              /* @__PURE__ */ jsxs(Badge, { className: "bg-success text-success-foreground font-semibold px-2.5 py-1", children: [
                "Ready: ",
                stats.valid
              ] }),
              /* @__PURE__ */ jsxs(Badge, { className: "bg-warning text-warning-foreground font-semibold px-2.5 py-1", children: [
                "Overwrite: ",
                stats.warnings
              ] }),
              stats.errors > 0 && /* @__PURE__ */ jsxs(Badge, { className: "bg-destructive text-destructive-foreground font-semibold px-2.5 py-1", children: [
                "Errors (Skip): ",
                stats.errors
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "relative flex-1", children: [
              /* @__PURE__ */ jsx(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsx("input", { type: "text", placeholder: "Search preview records…", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring font-medium" })
            ] }),
            /* @__PURE__ */ jsxs("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), className: "h-9 w-36 rounded-md border border-input bg-background px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring font-medium", children: [
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
          /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/60", children: filteredPreviewRows.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 8, className: "p-6 text-center text-muted-foreground", children: "No matching preview records found." }) }) : filteredPreviewRows.map((row, idx) => /* @__PURE__ */ jsxs("tr", { className: `hover:bg-muted/10 transition ${row.status === "error" ? "bg-destructive/5" : ""}`, children: [
            /* @__PURE__ */ jsx("td", { className: "p-3 font-semibold text-foreground", children: row.student_id || /* @__PURE__ */ jsx("span", { className: "text-destructive font-medium italic", children: "Empty" }) }),
            /* @__PURE__ */ jsx("td", { className: "p-3 font-medium", children: row.name || /* @__PURE__ */ jsx("span", { className: "text-destructive font-medium italic", children: "Empty" }) }),
            /* @__PURE__ */ jsx("td", { className: "p-3", children: row.room_number || /* @__PURE__ */ jsx("span", { className: "text-destructive font-medium italic", children: "Empty" }) }),
            /* @__PURE__ */ jsx("td", { className: "p-3", children: row.mobile || /* @__PURE__ */ jsx("span", { className: "text-destructive font-medium italic", children: "Empty" }) }),
            /* @__PURE__ */ jsx("td", { className: "p-3", children: row.parent_mobile || /* @__PURE__ */ jsx("span", { className: "text-destructive font-medium italic", children: "Empty" }) }),
            /* @__PURE__ */ jsx("td", { className: "p-3", children: row.hostel_name || /* @__PURE__ */ jsx("span", { className: "text-muted-foreground italic", children: "Default" }) }),
            /* @__PURE__ */ jsxs("td", { className: "p-3", children: [
              row.action === "insert" && /* @__PURE__ */ jsx(Badge, { className: "bg-success/15 hover:bg-success/15 text-success font-medium rounded px-1.5 py-0.5", children: "Insert" }),
              row.action === "update" && /* @__PURE__ */ jsx(Badge, { className: "bg-warning/15 hover:bg-warning/15 text-warning-foreground font-medium rounded px-1.5 py-0.5", children: "Overwrite" }),
              row.action === "skip" && /* @__PURE__ */ jsx(Badge, { className: "bg-destructive/15 hover:bg-destructive/15 text-destructive font-medium rounded px-1.5 py-0.5", children: "Skip" })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "p-3 max-w-[200px]", children: row.status === "valid" ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-success font-medium", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4.5 w-4.5 shrink-0" }),
              /* @__PURE__ */ jsx("span", { children: "Ready to import" })
            ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-1", children: row.messages.map((msg, midx) => /* @__PURE__ */ jsxs("div", { className: `flex items-start gap-1.5 font-medium ${row.status === "error" ? "text-destructive" : "text-warning-foreground"}`, children: [
              row.status === "error" ? /* @__PURE__ */ jsx(XCircle, { className: "h-4.5 w-4.5 shrink-0 mt-0.5" }) : /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4.5 w-4.5 shrink-0 mt-0.5" }),
              /* @__PURE__ */ jsx("span", { children: msg })
            ] }, midx)) }) })
          ] }, idx)) })
        ] }) }) }),
        /* @__PURE__ */ jsx("div", { className: "p-4 border-t border-border/50 flex justify-end bg-muted/10 rounded-b-xl", children: /* @__PURE__ */ jsxs(Button, { disabled: importMutation.isPending || stats.errors === stats.total, onClick: () => {
          if (!file) return;
          importMutation.mutate(file);
        }, className: "w-full sm:w-auto", children: [
          /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4 mr-2" }),
          " Confirm & Import ",
          stats.valid + stats.warnings,
          " Students"
        ] }) })
      ] }) : /* @__PURE__ */ jsxs(Card, { className: "w-full", children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Import Notes & Guidelines" }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4 text-sm text-muted-foreground leading-relaxed", children: [
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
    importMutation.isPending && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-4 bg-card border border-border p-8 rounded-xl shadow-lg max-w-sm w-full text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" }),
      /* @__PURE__ */ jsx("h3", { className: "font-semibold text-lg", children: "Importing Students" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Uploading and creating student accounts. This may take a few moments..." })
    ] }) }),
    importedCount !== null && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border p-6 rounded-xl shadow-lg max-w-md w-full text-center space-y-4", children: [
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
    ] }) })
  ] });
}
export {
  ImportPage as component
};
