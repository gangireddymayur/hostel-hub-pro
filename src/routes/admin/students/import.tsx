import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useRef } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Image as ImageIcon,
  FolderUp,
  Trash2,
  Users,
  UserCheck,
  RefreshCw,
  Camera,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  importStudents,
  getHostelStudents,
  getHostels,
  bulkUploadPhotos,
  type BulkPhotoItem,
} from "@/lib/api";

export const Route = createFileRoute("/admin/students/import")({
  head: () => ({ meta: [{ title: "Import & Bulk Photos · Hostel GATEX" }] }),
  component: ImportPage,
});

interface ParsedRow {
  student_id: string;
  name: string;
  room_number: string;
  mobile: string;
  parent_mobile: string;
  student_year: string;
  hostel_name: string;
  password?: string;
  parent_password?: string;
  status: "valid" | "warning" | "error";
  action: "insert" | "update" | "skip";
  messages: string[];
}

interface PhotoItem {
  id: string;
  file: File;
  filename: string;
  previewUrl: string;
  student_id: string;
  type: "STUDENT" | "PARENT";
  status: "matched" | "unmatched" | "invalid";
  matchedStudent?: {
    id: string;
    student_id: string;
    name: string;
    room_number: string;
    hostel_id?: any;
  };
  messages: string[];
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
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

function parseCsv(text: string): Record<string, string>[] {
  const cleanText = String(text).replace(/^\uFEFF/, "");
  const lines = cleanText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  const headers = parseCsvLine(lines[0]).map((header) =>
    header.toLowerCase().replace(/["']/g, "").replace(/[\s\-_]+/g, "_").trim()
  );
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });
    return row;
  });
}

function normalizeStudentYear(val: string): string {
  if (!val) return "";
  const clean = val.trim().toLowerCase();
  if (!clean) return "";
  if (clean.includes("1") || clean.includes("first")) return "1st Year";
  if (clean.includes("2") || clean.includes("second")) return "2nd Year";
  if (clean.includes("3") || clean.includes("third")) return "3rd Year";
  if (clean.includes("4") || clean.includes("fourth")) return "4th Year";
  return val.trim();
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function extractPhotoDetails(filename: string): { student_id: string; type: "STUDENT" | "PARENT" } {
  const lastDot = filename.lastIndexOf(".");
  const baseName = (lastDot > 0 ? filename.substring(0, lastDot) : filename).trim();

  // Parent photo check (e.g. p_21N81A0001, P-21N81A0001, parent_21N81A0001)
  if (/^(p_|p-|parent_|parent-)/i.test(baseName)) {
    const studentId = baseName.replace(/^(p_|p-|parent_|parent-)/i, "").trim();
    return { student_id: studentId, type: "PARENT" };
  }

  return { student_id: baseName, type: "STUDENT" };
}

function ImportPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Active Tab: "csv" | "photos"
  const [activeTab, setActiveTab] = useState<"csv" | "photos">("csv");

  // CSV Import State
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<ParsedRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "valid" | "warning" | "error">("ALL");
  const [dragActive, setDragActive] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);

  // Photos Import State
  const [photoFiles, setPhotoFiles] = useState<PhotoItem[]>([]);
  const [photoSearchQuery, setPhotoSearchQuery] = useState("");
  const [photoStatusFilter, setPhotoStatusFilter] = useState<"ALL" | "matched" | "unmatched">("ALL");
  const [photoTypeFilter, setPhotoTypeFilter] = useState<"ALL" | "STUDENT" | "PARENT">("ALL");
  const [photosDragActive, setPhotosDragActive] = useState(false);
  const [photosImportedResult, setPhotosImportedResult] = useState<{ updated: number; total: number; errors: any[] } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const hostelsQuery = useQuery({ queryKey: ["active-hostels"], queryFn: getHostels });
  const studentsQuery = useQuery({ queryKey: ["hostel-students"], queryFn: getHostelStudents });

  const hostels = hostelsQuery.data?.data ?? [];
  const students = studentsQuery.data?.data ?? [];

  // Mutations
  const importMutation = useMutation({
    mutationFn: importStudents,
    onSuccess: async (data) => {
      setImportedCount(data.data.imported);
      setFile(null);
      setPreviewRows([]);
      await queryClient.invalidateQueries({ queryKey: ["hostel-students"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Import failed"),
  });

  const bulkPhotoMutation = useMutation({
    mutationFn: bulkUploadPhotos,
    onSuccess: async (res) => {
      setPhotosImportedResult(res.data);
      // Clean up object URLs
      photoFiles.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      setPhotoFiles([]);
      await queryClient.invalidateQueries({ queryKey: ["hostel-students"] });
      toast.success(`Successfully updated ${res.data.updated} photos!`);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Photo upload failed"),
  });

  // CSV Validation
  const validateRows = (rows: any[], existingStudents: any[] = [], hostelsList: any[] = []) => {
    const validated: ParsedRow[] = [];
    const seenIds = new Set<string>();
    const seenMobiles = new Set<string>();

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

      const item: ParsedRow = {
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
        messages: [],
      };

      const missing: string[] = [];
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
        const matchingStudent = (existingStudents || []).find(
          (s) => s && s.student_id && String(s.student_id).toLowerCase() === studentId.toLowerCase()
        );
        if (matchingStudent) {
          item.status = "warning";
          item.action = "update";
          item.messages.push(`Matches existing student (${matchingStudent.name || "Existing"}); details will be overwritten`);
        }
      }

      if (item.status !== "error" && cleanMobile) {
        const studentWithSameMobile = (existingStudents || []).find(
          (s) => s && s.mobile && String(s.mobile) === cleanMobile
        );
        if (studentWithSameMobile) {
          const existingId = String(studentWithSameMobile.student_id || "");
          if (existingId.toLowerCase() !== studentId.toLowerCase()) {
            item.status = "error";
            item.action = "skip";
            item.messages.push(
              `Mobile is already registered to student '${studentWithSameMobile.name || "Unknown"}' (ID: ${existingId})`
            );
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

  const handleFile = (selectedFile: File) => {
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

  // Photos Processing
  const processImageFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) =>
      f.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|bmp)$/i.test(f.name)
    );

    if (fileArray.length === 0) {
      toast.error("No valid image files found (.jpg, .jpeg, .png, .webp).");
      return;
    }

    const newItems: PhotoItem[] = fileArray.map((f) => {
      const { student_id, type } = extractPhotoDetails(f.name);
      const matchingStudent = (students || []).find(
        (s) => s && s.student_id && String(s.student_id).toLowerCase() === student_id.toLowerCase()
      );

      const status: PhotoItem["status"] = !student_id
        ? "invalid"
        : matchingStudent
          ? "matched"
          : "unmatched";

      const messages: string[] = [];
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
        matchedStudent: matchingStudent
          ? {
              id: matchingStudent.id,
              student_id: matchingStudent.student_id,
              name: matchingStudent.name,
              room_number: matchingStudent.room_number,
              hostel_id: matchingStudent.hostel_id,
            }
          : undefined,
        messages,
      };
    });

    setPhotoFiles((prev) => [...prev, ...newItems]);
    const matchedCount = newItems.filter((i) => i.status === "matched").length;
    toast.info(`Added ${newItems.length} photos (${matchedCount} matched with existing students).`);
  };

  const handlePhotosDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPhotosDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFiles(e.dataTransfer.files);
    }
  };

  const removePhotoItem = (id: string) => {
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
      const payload: BulkPhotoItem[] = [];
      for (const p of matchedPhotos) {
        const base64 = await fileToBase64(p.file);
        payload.push({
          student_id: p.student_id,
          type: p.type,
          photo_base64: base64,
          filename: p.filename,
        });
      }
      bulkPhotoMutation.mutate(payload);
    } catch (err) {
      toast.error("Failed to prepare images for upload.");
    }
  };

  const downloadTemplate = () => {
    const headers = [
      "Student ID",
      "Student Name",
      "Room Number",
      "Student Mobile",
      "Parent Mobile",
      "Student Year",
      "Hostel Name",
      "Student Password",
      "Parent Password",
    ];
    const sampleRow = [
      "21N81A66G4",
      "Mayur",
      "Room 12",
      "6281192139",
      "9908006588",
      "1st Year",
      "hosteltest",
      "Student@12345",
      "Parent@12345",
    ];

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

  // CSV Stats
  const stats = useMemo(() => {
    return {
      total: previewRows.length,
      errors: previewRows.filter((r) => r.status === "error").length,
      warnings: previewRows.filter((r) => r.status === "warning").length,
      valid: previewRows.filter((r) => r.status === "valid").length,
    };
  }, [previewRows]);

  const filteredPreviewRows = useMemo(() => {
    return previewRows.filter((row) => {
      const matchesSearch =
        row.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.hostel_name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || row.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [previewRows, searchQuery, statusFilter]);

  // Photos Stats
  const photoStats = useMemo(() => {
    const matched = photoFiles.filter((p) => p.status === "matched");
    return {
      total: photoFiles.length,
      matched: matched.length,
      studentPhotos: matched.filter((p) => p.type === "STUDENT").length,
      parentPhotos: matched.filter((p) => p.type === "PARENT").length,
      unmatched: photoFiles.filter((p) => p.status !== "matched").length,
    };
  }, [photoFiles]);

  const filteredPhotoFiles = useMemo(() => {
    return photoFiles.filter((item) => {
      const query = photoSearchQuery.toLowerCase();
      const matchesSearch =
        item.filename.toLowerCase().includes(query) ||
        item.student_id.toLowerCase().includes(query) ||
        (item.matchedStudent && item.matchedStudent.name.toLowerCase().includes(query));

      const matchesStatus =
        photoStatusFilter === "ALL" ||
        (photoStatusFilter === "matched" && item.status === "matched") ||
        (photoStatusFilter === "unmatched" && item.status !== "matched");

      const matchesType = photoTypeFilter === "ALL" || item.type === photoTypeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [photoFiles, photoSearchQuery, photoStatusFilter, photoTypeFilter]);

  return (
    <>
      <PageHeader
        title="Student Data & Photos Import"
        description="Bulk onboard students via CSV and bulk upload student & parent photos automatically linked by roll number."
      />

      {/* Tabs Navigation */}
      <div className="mb-6 flex border-b border-border/60">
        <button
          onClick={() => setActiveTab("csv")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
            activeTab === "csv"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" />
          Import Students (CSV)
          {previewRows.length > 0 && (
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
              {previewRows.length}
            </Badge>
          )}
        </button>

        <button
          onClick={() => setActiveTab("photos")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
            activeTab === "photos"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Camera className="h-4 w-4" />
          Bulk Upload Photos (Roll No.)
          {photoFiles.length > 0 && (
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
              {photoFiles.length}
            </Badge>
          )}
        </button>
      </div>

      {/* TAB 1: CSV IMPORT */}
      {activeTab === "csv" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Upload CSV File</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFile(e.dataTransfer.files[0]);
                  }
                }}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition ${
                  dragActive
                    ? "border-primary bg-primary/10"
                    : "border-border bg-muted/30 hover:border-primary/40 hover:bg-accent/30"
                }`}
              >
                <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center">
                  <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium">{file ? file.name : "Click to choose CSV file"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">or drag and drop here</p>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(f);
                    }}
                  />
                </label>
              </div>

              <div className="mt-4 rounded-lg border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">
                <p className="mb-1 font-medium text-foreground">Expected columns</p>
                Student ID · Student Name · Room Number · Student Mobile · Parent Mobile · Student Year · Hostel Name · Student Password · Parent Password
              </div>

              <Button
                variant="outline"
                className="mt-3 w-full border-primary/20 text-primary hover:bg-primary/5 hover:text-primary"
                onClick={downloadTemplate}
              >
                <Download className="mr-2 h-4 w-4" /> Download CSV Template
              </Button>

              {file && (
                <div className="mt-3 flex flex-col gap-2">
                  <Button
                    className="w-full"
                    disabled={importMutation.isPending || stats.errors === stats.total}
                    onClick={() => {
                      if (!file) return;
                      importMutation.mutate(file);
                    }}
                  >
                    <Upload className="mr-2 h-4 w-4" /> Import {stats.valid + stats.warnings} Valid Students
                  </Button>
                  <Button variant="ghost" className="w-full text-destructive hover:bg-destructive/10" onClick={clearCsv}>
                    <X className="mr-2 h-4 w-4" /> Cancel / Clear File
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
            {previewRows.length > 0 ? (
              <Card className="w-full">
                <CardHeader className="border-b border-border/50">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">Verification & Preview</CardTitle>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Please review safety checks before finalizing import.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="outline" className="px-2.5 py-1 text-xs font-semibold">
                        Total: {stats.total}
                      </Badge>
                      <Badge className="bg-success px-2.5 py-1 font-semibold text-success-foreground">
                        Ready: {stats.valid}
                      </Badge>
                      <Badge className="bg-warning px-2.5 py-1 font-semibold text-warning-foreground">
                        Overwrite: {stats.warnings}
                      </Badge>
                      {stats.errors > 0 && (
                        <Badge className="bg-destructive px-2.5 py-1 font-semibold text-destructive-foreground">
                          Errors (Skip): {stats.errors}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search preview records…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="h-9 w-36 rounded-md border border-input bg-background px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="valid">Ready (Valid)</option>
                      <option value="warning">Overwrites/Warnings</option>
                      <option value="error">Errors Only</option>
                    </select>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[480px] overflow-y-auto">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="border-b border-border bg-muted/30 font-semibold text-muted-foreground">
                          <th className="p-3">Student ID</th>
                          <th className="p-3">Name</th>
                          <th className="p-3">Room</th>
                          <th className="p-3">Mobile</th>
                          <th className="p-3">Parent Mobile</th>
                          <th className="p-3">Hostel</th>
                          <th className="p-3">Action</th>
                          <th className="p-3">Status Check</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {filteredPreviewRows.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-6 text-center text-muted-foreground">
                              No matching preview records found.
                            </td>
                          </tr>
                        ) : (
                          filteredPreviewRows.map((row, idx) => (
                            <tr
                              key={idx}
                              className={`transition hover:bg-muted/10 ${
                                row.status === "error" ? "bg-destructive/5" : ""
                              }`}
                            >
                              <td className="p-3 font-semibold text-foreground">
                                {row.student_id || <span className="font-medium italic text-destructive">Empty</span>}
                              </td>
                              <td className="p-3 font-medium">
                                {row.name || <span className="font-medium italic text-destructive">Empty</span>}
                              </td>
                              <td className="p-3">
                                {row.room_number || <span className="font-medium italic text-destructive">Empty</span>}
                              </td>
                              <td className="p-3">
                                {row.mobile || <span className="font-medium italic text-destructive">Empty</span>}
                              </td>
                              <td className="p-3">
                                {row.parent_mobile || <span className="font-medium italic text-destructive">Empty</span>}
                              </td>
                              <td className="p-3">
                                {row.hostel_name || <span className="italic text-muted-foreground">Default</span>}
                              </td>
                              <td className="p-3">
                                {row.action === "insert" && (
                                  <Badge className="rounded bg-success/15 px-1.5 py-0.5 font-medium text-success hover:bg-success/15">
                                    Insert
                                  </Badge>
                                )}
                                {row.action === "update" && (
                                  <Badge className="rounded bg-warning/15 px-1.5 py-0.5 font-medium text-warning-foreground hover:bg-warning/15">
                                    Overwrite
                                  </Badge>
                                )}
                                {row.action === "skip" && (
                                  <Badge className="rounded bg-destructive/15 px-1.5 py-0.5 font-medium text-destructive hover:bg-destructive/15">
                                    Skip
                                  </Badge>
                                )}
                              </td>
                              <td className="max-w-[200px] p-3">
                                {row.status === "valid" ? (
                                  <div className="flex items-center gap-1.5 font-medium text-success">
                                    <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                                    <span>Ready to import</span>
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    {row.messages.map((msg, midx) => (
                                      <div
                                        key={midx}
                                        className={`flex items-start gap-1.5 font-medium ${
                                          row.status === "error" ? "text-destructive" : "text-warning-foreground"
                                        }`}
                                      >
                                        {row.status === "error" ? (
                                          <XCircle className="mt-0.5 h-4.5 w-4.5 shrink-0" />
                                        ) : (
                                          <AlertTriangle className="mt-0.5 h-4.5 w-4.5 shrink-0" />
                                        )}
                                        <span>{msg}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
                <div className="flex flex-col gap-2 rounded-b-xl border-t border-border/50 bg-muted/10 p-4 sm:flex-row sm:justify-end">
                  <Button variant="outline" onClick={clearCsv}>
                    <X className="mr-1.5 h-4 w-4" /> Cancel / Clear
                  </Button>
                  <Button
                    disabled={importMutation.isPending || stats.errors === stats.total}
                    onClick={() => {
                      if (!file) return;
                      importMutation.mutate(file);
                    }}
                  >
                    <Upload className="mr-2 h-4 w-4" /> Confirm & Import {stats.valid + stats.warnings} Students
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Import Notes & Guidelines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                  <p>
                    <strong>Branch Routing (Hostel Name):</strong> You can specify which hostel branch each student belongs to by entering the hostel's name (e.g. <em>hosteltest</em>) in the <em>Hostel Name</em> column. If left blank, students will default to your primary hostel branch.
                  </p>
                  <p>
                    <strong>Mandatory Columns:</strong> <em>Student ID</em>, <em>Student Name</em>, <em>Room Number</em>, <em>Student Mobile</em>, and <em>Parent Mobile</em> are strictly required for every student row. Rows missing any of these values will be automatically skipped.
                  </p>
                  <p>
                    <strong>User Account Passwords:</strong> You can optionally supply custom passwords for the student and parent in the <em>Student Password</em> and <em>Parent Password</em> columns. If left empty, they default to <em>Student@12345</em> and <em>Parent@12345</em> respectively.
                  </p>
                  <p>
                    The import system automatically detects duplicates and updates existing student records using the unique combination of hostel and student ID.
                  </p>
                  <p className="font-medium text-foreground/80">
                    💡 Tip: Click the <strong>Download CSV Template</strong> button on the left to get a pre-formatted spreadsheet you can open directly in Excel!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: BULK PHOTO UPLOAD */}
      {activeTab === "photos" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Upload Control Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Select Photos / Folder</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                onDragEnter={(e) => {
                  e.preventDefault();
                  setPhotosDragActive(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setPhotosDragActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setPhotosDragActive(false);
                }}
                onDrop={handlePhotosDrop}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-7 text-center transition ${
                  photosDragActive
                    ? "border-primary bg-primary/10"
                    : "border-border bg-muted/30 hover:border-primary/40 hover:bg-accent/30"
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Camera className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm font-semibold">Drop Student & Parent Photos</p>
                <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, or WEBP images</p>

                {/* Multiple files input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      processImageFiles(e.target.files);
                    }
                  }}
                />

                {/* Folder input */}
                <input
                  ref={folderInputRef}
                  type="file"
                  accept="image/*"
                  // @ts-ignore
                  webkitdirectory=""
                  directory=""
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      processImageFiles(e.target.files);
                    }
                  }}
                />

                <div className="mt-4 flex flex-col gap-2 w-full">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="mr-1.5 h-3.5 w-3.5" /> Choose Photos (1 or more)
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => folderInputRef.current?.click()}
                  >
                    <FolderUp className="mr-1.5 h-3.5 w-3.5" /> Choose Entire Folder
                  </Button>
                </div>
              </div>

              {/* Naming Rules Guideline */}
              <div className="mt-4 space-y-2 rounded-lg border border-border/60 bg-muted/20 p-3 text-xs">
                <p className="font-semibold text-foreground">File Naming Rules</p>
                <div className="space-y-1.5 text-muted-foreground">
                  <div className="flex items-start gap-1.5">
                    <span className="font-semibold text-primary">Student Photo:</span>
                    <span>
                      Name with Roll Number (e.g. <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px] text-foreground">21N81A0001.jpg</code>)
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-semibold text-info">Parent Photo:</span>
                    <span>
                      Prefix with <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px] text-foreground">p_</code> (e.g. <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px] text-foreground">p_21N81A0001.jpg</code>)
                    </span>
                  </div>
                </div>
              </div>

              {photoFiles.length > 0 && (
                <div className="mt-4 flex flex-col gap-2">
                  <Button
                    className="w-full"
                    disabled={bulkPhotoMutation.isPending || photoStats.matched === 0}
                    onClick={handleUploadMatchedPhotos}
                  >
                    <Upload className="mr-2 h-4 w-4" /> Upload {photoStats.matched} Matched Photos
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-destructive hover:bg-destructive/10"
                    onClick={clearAllPhotos}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Clear All Photos ({photoFiles.length})
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Preview List Card */}
          <div className="lg:col-span-2">
            {photoFiles.length > 0 ? (
              <Card className="w-full">
                <CardHeader className="border-b border-border/50 pb-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">Photos Preview & Match Check</CardTitle>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Roll numbers are automatically extracted from filenames and verified.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="outline" className="px-2.5 py-1 text-xs font-semibold">
                        Total: {photoStats.total}
                      </Badge>
                      <Badge className="bg-success px-2.5 py-1 font-semibold text-success-foreground">
                        Matched: {photoStats.matched}
                      </Badge>
                      <Badge className="bg-primary/20 text-primary border-primary/30 px-2 py-0.5 text-xs font-medium">
                        Student: {photoStats.studentPhotos}
                      </Badge>
                      <Badge className="bg-info/20 text-info border-info/30 px-2 py-0.5 text-xs font-medium">
                        Parent: {photoStats.parentPhotos}
                      </Badge>
                      {photoStats.unmatched > 0 && (
                        <Badge className="bg-destructive px-2.5 py-1 font-semibold text-destructive-foreground">
                          Unmatched: {photoStats.unmatched}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Search and Filters */}
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    <div className="relative sm:col-span-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search roll no, student…"
                        value={photoSearchQuery}
                        onChange={(e) => setPhotoSearchQuery(e.target.value)}
                        className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    <select
                      value={photoTypeFilter}
                      onChange={(e) => setPhotoTypeFilter(e.target.value as any)}
                      className="h-9 rounded-md border border-input bg-background px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="ALL">All Types (Student & Parent)</option>
                      <option value="STUDENT">Student Photos Only</option>
                      <option value="PARENT">Parent Photos Only</option>
                    </select>
                    <select
                      value={photoStatusFilter}
                      onChange={(e) => setPhotoStatusFilter(e.target.value as any)}
                      className="h-9 rounded-md border border-input bg-background px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="ALL">All Match Statuses</option>
                      <option value="matched">Matched Students Only</option>
                      <option value="unmatched">Unmatched / Errors</option>
                    </select>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="max-h-[500px] overflow-y-auto">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="border-b border-border bg-muted/30 font-semibold text-muted-foreground">
                          <th className="p-3">Preview</th>
                          <th className="p-3">File Name</th>
                          <th className="p-3">Extracted Roll No</th>
                          <th className="p-3">Target</th>
                          <th className="p-3">Matched Student</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {filteredPhotoFiles.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-muted-foreground">
                              No matching photos found.
                            </td>
                          </tr>
                        ) : (
                          filteredPhotoFiles.map((item) => (
                            <tr
                              key={item.id}
                              className={`transition hover:bg-muted/10 ${
                                item.status !== "matched" ? "bg-destructive/5" : ""
                              }`}
                            >
                              <td className="p-3">
                                <img
                                  src={item.previewUrl}
                                  alt={item.filename}
                                  className="h-10 w-10 rounded-lg object-cover border border-border/80 shadow-sm"
                                />
                              </td>
                              <td className="p-3 font-mono font-medium text-foreground max-w-[140px] truncate" title={item.filename}>
                                {item.filename}
                              </td>
                              <td className="p-3 font-semibold text-foreground">
                                {item.student_id ? (
                                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                                    {item.student_id}
                                  </code>
                                ) : (
                                  <span className="text-destructive italic">Unknown</span>
                                )}
                              </td>
                              <td className="p-3">
                                {item.type === "STUDENT" ? (
                                  <Badge className="bg-primary/15 text-primary hover:bg-primary/15 font-medium rounded px-2 py-0.5">
                                    Student
                                  </Badge>
                                ) : (
                                  <Badge className="bg-info/15 text-info hover:bg-info/15 font-medium rounded px-2 py-0.5">
                                    Parent (p_)
                                  </Badge>
                                )}
                              </td>
                              <td className="p-3">
                                {item.matchedStudent ? (
                                  <div>
                                    <p className="font-semibold text-foreground">{item.matchedStudent.name}</p>
                                    <p className="text-[11px] text-muted-foreground">
                                      Room {item.matchedStudent.room_number || "N/A"}
                                    </p>
                                  </div>
                                ) : (
                                  <span className="text-destructive font-medium text-xs">Student Not Found</span>
                                )}
                              </td>
                              <td className="p-3">
                                {item.status === "matched" ? (
                                  <div className="flex items-center gap-1.5 font-medium text-success">
                                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                                    <span>Ready</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 font-medium text-destructive">
                                    <XCircle className="h-4 w-4 shrink-0" />
                                    <span>{item.messages[0] || "Unmatched"}</span>
                                  </div>
                                )}
                              </td>
                              <td className="p-3 text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  onClick={() => removePhotoItem(item.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>

                <div className="flex flex-col gap-2 rounded-b-xl border-t border-border/50 bg-muted/10 p-4 sm:flex-row sm:justify-end">
                  <Button variant="outline" onClick={clearAllPhotos}>
                    <X className="mr-1.5 h-4 w-4" /> Cancel / Clear All
                  </Button>
                  <Button
                    disabled={bulkPhotoMutation.isPending || photoStats.matched === 0}
                    onClick={handleUploadMatchedPhotos}
                  >
                    <Upload className="mr-2 h-4 w-4" /> Confirm & Upload {photoStats.matched} Photos
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Bulk Photos Guidelines & Instructions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                  <p>
                    <strong>Automatic Roll Number Matching:</strong> You don't need to manually assign photos one-by-one. Simply name your image files according to the student's Roll Number / Student ID.
                  </p>
                  
                  <div className="rounded-lg border border-border bg-card p-4 space-y-3">
                    <h4 className="font-semibold text-foreground">Example File Names:</h4>
                    <div className="grid gap-2 text-xs">
                      <div className="flex items-center justify-between rounded bg-muted/50 p-2">
                        <span className="font-mono font-medium">21N81A0001.jpg</span>
                        <span className="text-primary font-medium">Student Profile Photo for 21N81A0001</span>
                      </div>
                      <div className="flex items-center justify-between rounded bg-muted/50 p-2">
                        <span className="font-mono font-medium">p_21N81A0001.jpg</span>
                        <span className="text-info font-medium">Parent Profile Photo for 21N81A0001</span>
                      </div>
                      <div className="flex items-center justify-between rounded bg-muted/50 p-2">
                        <span className="font-mono font-medium">P-21N81A0002.png</span>
                        <span className="text-info font-medium">Parent Profile Photo for 21N81A0002</span>
                      </div>
                    </div>
                  </div>

                  <p>
                    <strong>Folder Upload:</strong> Click <em>"Choose Entire Folder"</em> to select a whole folder on your computer containing hundreds of student and parent pictures. The system will scan, preview, and match them instantly.
                  </p>
                  <p>
                    <strong>Instant Live Preview:</strong> Once selected, you will see a scrollable preview on this screen with the student's name, room number, and match status before anything is uploaded.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* CSV Importing loading overlay */}
      {importMutation.isPending && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center shadow-lg max-w-sm w-full">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
            <h3 className="text-lg font-semibold">Importing Students</h3>
            <p className="text-sm text-muted-foreground">Uploading and creating student records. Please wait...</p>
          </div>
        </div>
      )}

      {/* Photos Uploading loading overlay */}
      {bulkPhotoMutation.isPending && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center shadow-lg max-w-sm w-full">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
            <h3 className="text-lg font-semibold">Uploading Photos</h3>
            <p className="text-sm text-muted-foreground">Processing and saving profile pictures to the server...</p>
          </div>
        </div>
      )}

      {/* CSV Success Dialog Modal */}
      {importedCount !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-4 rounded-xl border border-border bg-card p-6 text-center shadow-lg">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Import Completed!</h3>
            <p className="text-sm text-muted-foreground">
              Successfully created/updated <strong className="text-foreground">{importedCount} student records</strong> and their corresponding parent accounts.
            </p>
            <div className="pt-2">
              <Button
                className="w-full"
                onClick={() => {
                  setImportedCount(null);
                  navigate({ to: "/admin/students" });
                }}
              >
                Go to Students List
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Photos Success Dialog Modal */}
      {photosImportedResult !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-4 rounded-xl border border-border bg-card p-6 text-center shadow-lg">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Photos Uploaded Successfully!</h3>
            <p className="text-sm text-muted-foreground">
              Successfully updated <strong className="text-foreground">{photosImportedResult.updated} profile photos</strong> for students & parents.
            </p>
            {photosImportedResult.errors && photosImportedResult.errors.length > 0 && (
              <div className="mt-2 max-h-32 overflow-y-auto rounded bg-destructive/10 p-2 text-left text-xs text-destructive">
                <p className="font-semibold mb-1">Skipped / Unmatched ({photosImportedResult.errors.length}):</p>
                {photosImportedResult.errors.map((err, i) => (
                  <p key={i}>• {err.filename}: {err.reason}</p>
                ))}
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="w-full" onClick={() => setPhotosImportedResult(null)}>
                Upload More Photos
              </Button>
              <Button className="w-full" onClick={() => {
                setPhotosImportedResult(null);
                navigate({ to: "/admin/students" });
              }}>
                Go to Students List
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
