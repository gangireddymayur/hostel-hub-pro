import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Upload, FileSpreadsheet, Download, CheckCircle2, AlertTriangle, XCircle, Search, HelpCircle } from "lucide-react";
import { PageHeader } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { importStudents, getHostelStudents, getHostels } from "@/lib/api";

export const Route = createFileRoute("/admin/students/import")({
  head: () => ({ meta: [{ title: "Import Students · Hostel GATEX" }] }),
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
  
  // Validation details
  status: "valid" | "warning" | "error";
  action: "insert" | "update" | "skip";
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
  const cleanText = String(text).replace(/^\uFEFF/, ""); // Strip UTF-8 Byte Order Mark (BOM)
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

function ImportPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<ParsedRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "valid" | "warning" | "error">("ALL");
  const [dragActive, setDragActive] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);

  const hostelsQuery = useQuery({ queryKey: ["active-hostels"], queryFn: getHostels });
  const studentsQuery = useQuery({ queryKey: ["hostel-students"], queryFn: getHostelStudents });

  const hostels = hostelsQuery.data?.data ?? [];
  const students = studentsQuery.data?.data ?? [];

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

      // Clean phone formats
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
        messages: []
      };

      // 1. Missing mandatory fields
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

      // 2. Duplicate Student ID within the file
      if (studentId) {
        if (seenIds.has(studentId.toLowerCase())) {
          item.status = "error";
          item.action = "skip";
          item.messages.push(`Duplicate Student ID found in this file`);
        } else {
          seenIds.add(studentId.toLowerCase());
        }
      }

      // 3. Duplicate Student Mobile within the file
      if (cleanMobile) {
        if (seenMobiles.has(cleanMobile)) {
          item.status = "error";
          item.action = "skip";
          item.messages.push(`Duplicate Student Mobile found in this file`);
        } else {
          seenMobiles.add(cleanMobile);
        }
      }

      // 4. Phone number format validation (Warning/Error check)
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

      // 5. Existing Student check (Update/Overwrite vs Insert)
      if (item.status !== "error" && studentId) {
        const matchingStudent = (existingStudents || []).find(
          (s) => s && s.student_id && String(s.student_id).toLowerCase() === studentId.toLowerCase()
        );
        if (matchingStudent) {
          item.status = "warning";
          item.action = "update";
          item.messages.push(`Matches existing student (${matchingStudent.name || 'Existing'}); details will be overwritten`);
        }
      }

      // 6. Student Mobile Duplicate Check against Database (Cross-student check)
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
              `Mobile is already registered to student '${studentWithSameMobile.name || 'Unknown'}' (ID: ${existingId})`
            );
          }
        }
      }

      // 7. Hostel check
      if (item.status !== "error" && hostelName) {
        const hostelMatches = (hostelsList || []).some((h) => {
          if (!h) return false;
          const nameMatch = h.hostel_name ? String(h.hostel_name).toLowerCase() === hostelName.toLowerCase() : false;
          const idMatch = h.id ? String(h.id) === hostelName : false;
          const emailMatch = h.email ? String(h.email).toLowerCase() === hostelName.toLowerCase() : false;
          return nameMatch || idMatch || emailMatch;
        });
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    if (selectedFile) handleFile(selectedFile);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
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
      "Parent Password"
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
      "Parent@12345"
    ];
    
    const csvRows = [
      headers.map(h => `"${h}"`).join(","),
      sampleRow.map(r => `"${r}"`).join(",")
    ];
    
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

  return (
    <>
      <PageHeader title="Import students" description="Bulk upload students from a CSV file with automatic preview check." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Upload file</CardTitle></CardHeader>
          <CardContent>
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition ${
                dragActive ? "border-primary bg-primary/10" : "border-border bg-muted/30 hover:border-primary/40 hover:bg-accent/30"
              }`}
            >
              <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">{file ? file.name : "Click to choose CSV file"}</p>
                <p className="mt-1 text-xs text-muted-foreground">or drag and drop here</p>
                <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
              </label>
            </div>

            <div className="mt-4 rounded-lg border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">
              <p className="mb-1 font-medium text-foreground">Expected columns</p>
              Student ID · Student Name · Room Number · Student Mobile · Parent Mobile · Student Year · Hostel Name · Student Password · Parent Password
            </div>

            <Button
              variant="outline"
              className="mt-3 w-full border-primary/20 hover:bg-primary/5 text-primary hover:text-primary"
              onClick={downloadTemplate}
            >
              <Download className="h-4 w-4 mr-2" /> Download CSV Template
            </Button>

            {file && (
              <Button
                className="mt-3 w-full"
                disabled={importMutation.isPending || stats.errors === stats.total}
                onClick={() => {
                  if (!file) return;
                  importMutation.mutate(file);
                }}
              >
                <Upload className="h-4 w-4" /> Import {stats.valid + stats.warnings} Valid Students
              </Button>
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
                    <p className="text-xs text-muted-foreground mt-0.5">Please review safety checks before finalizing import.</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="text-xs font-semibold px-2.5 py-1">
                      Total: {stats.total}
                    </Badge>
                    <Badge className="bg-success text-success-foreground font-semibold px-2.5 py-1">
                      Ready: {stats.valid}
                    </Badge>
                    <Badge className="bg-warning text-warning-foreground font-semibold px-2.5 py-1">
                      Overwrite: {stats.warnings}
                    </Badge>
                    {stats.errors > 0 && (
                      <Badge className="bg-destructive text-destructive-foreground font-semibold px-2.5 py-1">
                        Errors (Skip): {stats.errors}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search preview records…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring font-medium"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="h-9 w-36 rounded-md border border-input bg-background px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring font-medium"
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
                          <tr key={idx} className={`hover:bg-muted/10 transition ${row.status === "error" ? "bg-destructive/5" : ""}`}>
                            <td className="p-3 font-semibold text-foreground">{row.student_id || <span className="text-destructive font-medium italic">Empty</span>}</td>
                            <td className="p-3 font-medium">{row.name || <span className="text-destructive font-medium italic">Empty</span>}</td>
                            <td className="p-3">{row.room_number || <span className="text-destructive font-medium italic">Empty</span>}</td>
                            <td className="p-3">{row.mobile || <span className="text-destructive font-medium italic">Empty</span>}</td>
                            <td className="p-3">{row.parent_mobile || <span className="text-destructive font-medium italic">Empty</span>}</td>
                            <td className="p-3">{row.hostel_name || <span className="text-muted-foreground italic">Default</span>}</td>
                            <td className="p-3">
                              {row.action === "insert" && (
                                <Badge className="bg-success/15 hover:bg-success/15 text-success font-medium rounded px-1.5 py-0.5">Insert</Badge>
                              )}
                              {row.action === "update" && (
                                <Badge className="bg-warning/15 hover:bg-warning/15 text-warning-foreground font-medium rounded px-1.5 py-0.5">Overwrite</Badge>
                              )}
                              {row.action === "skip" && (
                                <Badge className="bg-destructive/15 hover:bg-destructive/15 text-destructive font-medium rounded px-1.5 py-0.5">Skip</Badge>
                              )}
                            </td>
                            <td className="p-3 max-w-[200px]">
                              {row.status === "valid" ? (
                                <div className="flex items-center gap-1.5 text-success font-medium">
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
                                        <XCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                                      ) : (
                                        <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
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
              <div className="p-4 border-t border-border/50 flex justify-end bg-muted/10 rounded-b-xl">
                <Button
                  disabled={importMutation.isPending || stats.errors === stats.total}
                  onClick={() => {
                    if (!file) return;
                    importMutation.mutate(file);
                  }}
                  className="w-full sm:w-auto"
                >
                  <Upload className="h-4 w-4 mr-2" /> Confirm & Import {stats.valid + stats.warnings} Students
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Import Notes & Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
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

      {/* Importing loading overlay */}
      {importMutation.isPending && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 bg-card border border-border p-8 rounded-xl shadow-lg max-w-sm w-full text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <h3 className="font-semibold text-lg">Importing Students</h3>
            <p className="text-sm text-muted-foreground">Uploading and creating student accounts. This may take a few moments...</p>
          </div>
        </div>
      )}

      {/* Success Dialog Modal */}
      {importedCount !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border p-6 rounded-xl shadow-lg max-w-md w-full text-center space-y-4">
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
    </>
  );
}
