import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Download,
  Printer,
  FileBarChart,
  Calendar,
  User,
  MapPin,
  Clock,
  ShieldCheck,
  Camera,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { getLeaveRequests, getHostelReports, getHostelStudents } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({ meta: [{ title: "Reports · Hostel GATEX" }] }),
  component: Reports,
});

type DatePreset = "today" | "yesterday" | "last7" | "thisMonth" | "last30" | "all" | "custom";
type StatusFilter = "ALL" | "APPROVED" | "PENDING" | "REJECTED" | "OUT" | "RETURNED";
type ScopeMode = "ALL" | "SINGLE";

function formatRoom(raw?: string) {
  if (!raw) return "—";
  const trimmed = raw.trim();
  if (/^room\s*/i.test(trimmed)) return trimmed;
  return `Room ${trimmed}`;
}

function Reports() {
  const reportsQuery = useQuery({ queryKey: ["hostel-reports"], queryFn: getHostelReports });
  const leavesQuery = useQuery({ queryKey: ["hostel-leaves"], queryFn: getLeaveRequests });
  const studentsQuery = useQuery({ queryKey: ["hostel-students"], queryFn: getHostelStudents });

  const leaves = leavesQuery.data?.data ?? [];
  const students = studentsQuery.data?.data ?? [];

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState("Comprehensive Permission & Audit Report");
  const [scopeMode, setScopeMode] = useState<ScopeMode>("ALL");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  
  // Date filters
  const [datePreset, setDatePreset] = useState<DatePreset>("thisMonth");
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  // Photo Zoom Modal
  const [zoomedPhoto, setZoomedPhoto] = useState<{ url: string; title: string } | null>(null);

  // Preset Date Handlers
  const handlePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    if (preset === "today") {
      setFromDate(todayStr);
      setToDate(todayStr);
    } else if (preset === "yesterday") {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().slice(0, 10);
      setFromDate(yStr);
      setToDate(yStr);
    } else if (preset === "last7") {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      setFromDate(d.toISOString().slice(0, 10));
      setToDate(todayStr);
    } else if (preset === "thisMonth") {
      const d = new Date();
      d.setDate(1);
      setFromDate(d.toISOString().slice(0, 10));
      setToDate(todayStr);
    } else if (preset === "last30") {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      setFromDate(d.toISOString().slice(0, 10));
      setToDate(todayStr);
    } else if (preset === "all") {
      setFromDate("2020-01-01");
      setToDate(todayStr);
    }
  };

  // Open modal with preconfigured report
  const openCustomReport = (type: "general" | "daily" | "monthly" | "outside" | "exits" | "returns" | "student", studentId?: string) => {
    if (type === "daily") {
      setReportTitle("Daily Permission & Movement Audit Report");
      setScopeMode("ALL");
      handlePresetChange("today");
      setStatusFilter("ALL");
    } else if (type === "monthly") {
      setReportTitle("Monthly Permission & Movement Audit Report");
      setScopeMode("ALL");
      handlePresetChange("thisMonth");
      setStatusFilter("ALL");
    } else if (type === "outside") {
      setReportTitle("Students Currently Outside Hostel - Movement Report");
      setScopeMode("ALL");
      handlePresetChange("all");
      setStatusFilter("OUT");
    } else if (type === "exits") {
      setReportTitle("Gate Security Exit Activity Report");
      setScopeMode("ALL");
      handlePresetChange("last30");
      setStatusFilter("ALL");
    } else if (type === "returns") {
      setReportTitle("Gate Security Return & Entry Log Report");
      setScopeMode("ALL");
      handlePresetChange("last30");
      setStatusFilter("RETURNED");
    } else if (type === "student") {
      setReportTitle("Individual Student Permission & Audit Dossier");
      setScopeMode("SINGLE");
      if (studentId) {
        setSelectedStudentId(studentId);
      } else if (students[0]) {
        setSelectedStudentId(students[0].student_id || students[0].id);
      }
      handlePresetChange("all");
      setStatusFilter("ALL");
    } else {
      setReportTitle("Comprehensive Permission & Movement Audit Report");
      setScopeMode("ALL");
      handlePresetChange("thisMonth");
      setStatusFilter("ALL");
    }
    setModalOpen(true);
  };

  // Filtered Students for the Search Picker
  const filteredStudentsList = useMemo(() => {
    if (!studentSearchTerm.trim()) return students;
    const term = studentSearchTerm.toLowerCase();
    return students.filter(
      (s) =>
        (s.name && s.name.toLowerCase().includes(term)) ||
        (s.student_id && s.student_id.toLowerCase().includes(term)) ||
        (s.room_number && s.room_number.toLowerCase().includes(term)) ||
        (s.mobile && s.mobile.includes(term))
    );
  }, [students, studentSearchTerm]);

  const selectedStudentObj = useMemo(() => {
    if (!selectedStudentId) return null;
    return students.find((s) => s.id === selectedStudentId || (s.student_id && s.student_id.toLowerCase() === selectedStudentId.toLowerCase())) ?? null;
  }, [students, selectedStudentId]);

  // Filtered Leave Records
  const filteredLeaves = useMemo(() => {
    return leaves.filter((leave) => {
      // Single Student Filter
      if (scopeMode === "SINGLE") {
        if (selectedStudentId) {
          const matchId =
            leave.student?.id === selectedStudentId ||
            (leave.student?.student_id && leave.student.student_id.toLowerCase() === selectedStudentId.toLowerCase()) ||
            (leave.student_id && leave.student_id.toLowerCase() === selectedStudentId.toLowerCase());
          if (!matchId) return false;
        }
      }

      // Date Range Filter (based on created_at or from_date)
      const leaveDate = (leave.created_at || leave.from_date || "").slice(0, 10);
      if (fromDate && leaveDate && leaveDate < fromDate) return false;
      if (toDate && leaveDate && leaveDate > toDate) return false;

      // Status Filter
      if (statusFilter === "APPROVED" && leave.final_status !== "APPROVED" && leave.hostel_status !== "APPROVED" && !leave.gatePass) return false;
      if (statusFilter === "PENDING" && leave.final_status !== "PENDING") return false;
      if (statusFilter === "REJECTED" && leave.final_status !== "REJECTED" && leave.hostel_status !== "REJECTED" && leave.parent_status !== "REJECTED") return false;
      if (statusFilter === "OUT") {
        const isOut = leave.gatePass?.status === "OUT" || (leave.gatePass?.out_time_actual && !leave.gatePass?.in_time_actual);
        if (!isOut) return false;
      }
      if (statusFilter === "RETURNED") {
        const isReturned = Boolean(leave.gatePass?.in_time_actual || leave.gatePass?.status === "RETURNED" || leave.final_status === "RETURNED");
        if (!isReturned) return false;
      }

      return true;
    });
  }, [leaves, scopeMode, selectedStudentId, fromDate, toDate, statusFilter]);

  // Calculated Status Counters
  const counts = useMemo(() => {
    let approved = 0;
    let out = 0;
    let returned = 0;
    let rejected = 0;
    let pending = 0;

    for (const l of filteredLeaves) {
      const isOut = l.gatePass?.status === "OUT" || (l.gatePass?.out_time_actual && !l.gatePass?.in_time_actual);
      const isRet = Boolean(l.gatePass?.in_time_actual || l.gatePass?.status === "RETURNED" || l.final_status === "RETURNED");
      const isRej = l.final_status === "REJECTED" || l.hostel_status === "REJECTED" || l.parent_status === "REJECTED";
      const isApp = l.final_status === "APPROVED" || l.hostel_status === "APPROVED" || Boolean(l.gatePass);

      if (isRet) returned++;
      else if (isOut) out++;
      else if (isRej) rejected++;
      else if (isApp) approved++;
      else pending++;
    }

    return { approved, out, returned, rejected, pending, total: filteredLeaves.length };
  }, [filteredLeaves]);

  // Chart data
  const chartData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, index) => {
      const dayIndex = (index + 1) % 7;
      const dayLeaves = leaves.filter((leave) => new Date(leave.created_at).getDay() === dayIndex);
      return {
        day,
        approved: dayLeaves.filter((leave) => leave.final_status === "APPROVED" || leave.gatePass != null).length,
      };
    });
  }, [leaves]);

  // CSV Exporter
  const handleExportCsv = () => {
    if (filteredLeaves.length === 0) {
      toast.error("No records match the current filters to export.");
      return;
    }

    const headers = [
      "Student ID",
      "Student Name",
      "Room Number",
      "Student Mobile",
      "Parent Mobile",
      "Hostel Name",
      "Request Type",
      "Reason",
      "From Date",
      "To Date",
      "Created At",
      "Student Lat",
      "Student Lng",
      "Parent Status",
      "Parent Reject Reason",
      "Parent Lat",
      "Parent Lng",
      "Parent Live Photo Attached",
      "Hostel Status",
      "Hostel Note",
      "Hostel Lat",
      "Hostel Lng",
      "Final Status",
      "Pass Number",
      "Out Time Actual",
      "In Time Actual",
      "Out Guard Lat",
      "Out Guard Lng",
      "In Guard Lat",
      "In Guard Lng",
    ];

    const dataRows = filteredLeaves.map((l) => [
      l.student?.student_id ?? l.student_id ?? "",
      l.student?.name ?? "",
      l.student?.room_number ?? "",
      l.student?.mobile ?? "",
      l.student?.parent_mobile ?? "",
      l.student?.hostel_name ?? "",
      l.request_type ?? "LEAVE",
      l.reason ?? "",
      l.from_date ?? "",
      l.to_date ?? "",
      l.created_at ?? "",
      String((l as any).student_lat ?? ""),
      String((l as any).student_lng ?? ""),
      l.parent_status ?? "",
      (l as any).parent_reject_reason ?? "",
      String((l as any).parent_lat ?? ""),
      String((l as any).parent_lng ?? ""),
      (l as any).parent_approval_photo ? "YES" : "NO",
      l.hostel_status ?? "",
      (l as any).note ?? (l as any).hostel_reject_reason ?? "",
      String((l as any).hostel_lat ?? ""),
      String((l as any).hostel_lng ?? ""),
      l.final_status ?? "",
      l.gatePass?.pass_number ?? "",
      l.gatePass?.out_time_actual ?? "",
      l.gatePass?.in_time_actual ?? "",
      String((l as any).gatePass?.out_guard_lat ?? ""),
      String((l as any).gatePass?.out_guard_lng ?? ""),
      String((l as any).gatePass?.in_guard_lat ?? ""),
      String((l as any).gatePass?.in_guard_lng ?? ""),
    ]);

    const content = [
      headers.join(","),
      ...dataRows.map((row) =>
        row
          .map((val) => {
            const strVal = String(val ?? "");
            return `"${strVal.replaceAll('"', '""')}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const filename = `hostel_gatex_audit_report_${fromDate}_to_${toDate}.csv`;
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredLeaves.length} records to CSV`);
  };

  // Printable PDF Handler (Directly prints the exact visual cards displayed on screen)
  const handlePrintPdf = () => {
    const printElem = document.getElementById("dialog-print-cards");
    if (!printElem) {
      window.print();
      return;
    }

    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    // Capture all stylesheets and fonts from main application
    const styleSheets = Array.from(document.querySelectorAll("link[rel='stylesheet'], style"))
      .map((node) => node.outerHTML)
      .join("\n");

    const headerHtml = `
      <div style="border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="/gatex-logo.jpg" alt="Logo" style="width: 36px; height: 36px; border-radius: 6px; object-fit: cover; border: 1px solid #cbd5e1;" />
          <div>
            <h1 style="font-size: 16px; font-weight: 800; text-transform: uppercase; color: #0f172a; margin: 0; line-height: 1.2;">Hostel GATEX Management System</h1>
            <h2 style="font-size: 12px; font-weight: 600; color: #475569; margin: 0;">${reportTitle}</h2>
          </div>
        </div>
        <div style="text-align: right; font-size: 11px; color: #64748b; line-height: 1.3;">
          <p style="margin: 0;"><strong>Date Range:</strong> ${fromDate} to ${toDate}</p>
          <p style="margin: 0;"><strong>Total Requests:</strong> ${filteredLeaves.length}</p>
        </div>
      </div>
    `;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportTitle} - Hostel GATEX</title>
          ${styleSheets}
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm 10mm 8mm 10mm;
            }
            *, *::before, *::after {
              box-sizing: border-box !important;
            }
            html, body {
              background: #ffffff !important;
              color: #0f172a !important;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
              font-size: 11px !important;
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
            }
            /* Remove dialog max-height and scrollbars for printing */
            #dialog-print-cards {
              max-height: none !important;
              overflow: visible !important;
              padding: 0 !important;
              display: block !important;
            }
            /* Keep each request card intact without awkward page breaks */
            #dialog-print-cards > div {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
              margin-bottom: 14px !important;
              background: #ffffff !important;
              border: 1px solid #e2e8f0 !important;
              border-radius: 12px !important;
              padding: 14px !important;
              box-shadow: none !important;
            }
            /* Ensure images never explode in size */
            img.student-photo {
              width: 36px !important;
              height: 36px !important;
              border-radius: 9999px !important;
              object-fit: cover !important;
            }
            img.live-photo {
              width: 100% !important;
              height: 55px !important;
              max-height: 55px !important;
              border-radius: 6px !important;
              object-fit: cover !important;
            }
          </style>
        </head>
        <body style="padding: 10px;">
          ${headerHtml}
          <div id="dialog-print-cards">
            ${printElem.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
      setTimeout(() => {
        try {
          document.body.removeChild(printFrame);
        } catch (_) {}
      }, 2000);
    }, 400);
  };

  return (
    <>
      {/* GLOBAL PRINT STYLES: Hides the modal UI and prints ONLY the clean certified PDF document */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body, html {
            background: #ffffff !important;
            color: #000000 !important;
          }
          /* Hide app shell, sidebar, and radix modal portals */
          [data-radix-portal],
          [role="dialog"],
          .print\\:hidden {
            display: none !important;
          }
          /* Display only the dedicated printable container */
          #printable-audit-report {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 10px !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm 12mm 10mm 12mm;
          }
          .page-break-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      ` }} />

      <div className="print:hidden">
        <PageHeader
          title="Reports & Audit Logs"
          description="Generate comprehensive student dossiers, multi-point audit timelines, and high-resolution PDF reports."
        />

        {/* Hero Interactive Report Generator Card */}
        <Card className="mb-6 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10 shadow-sm">
          <CardContent className="flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary text-primary-foreground">NEW</Badge>
                <h3 className="text-lg font-bold tracking-tight text-foreground">
                  Comprehensive Student Audit & PDF Report Generator
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Filter by date range or individual student to generate an official PDF dossier with complete 5-step movement audit, parent live photos, and GPS geo-points.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                className="gap-2 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 px-5"
                onClick={() => openCustomReport("general")}
              >
                <Printer className="h-4 w-4" />
                Generate Audit PDF Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 7-Day Chart */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Permission Volume - Last 7 Days</CardTitle>
              <CardDescription>Daily approved student leave and outing permissions</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => openCustomReport("daily")}>
              View Daily Logs <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} opacity={0.3} />
                <XAxis
                  dataKey="day"
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={8}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  dx={-8}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15, 23, 42, 0.85)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: 12,
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
                  }}
                  itemStyle={{ color: "#f8fafc" }}
                  labelStyle={{ color: "#94a3b8", fontWeight: "bold" }}
                />
                <Area type="monotone" dataKey="approved" stroke="var(--color-success)" fill="url(#g2)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Report Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card
            className="cursor-pointer transition hover:border-primary/50 hover:shadow-md"
            onClick={() => openCustomReport("daily")}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <Badge variant="outline">Today</Badge>
              </div>
              <h3 className="mt-3 text-base font-semibold">Daily Permission Report</h3>
              <p className="mt-1 text-sm text-muted-foreground">Permissions created, approved, or rejected today.</p>
              <div className="mt-4 flex items-center justify-between pt-2">
                <span className="text-xs font-medium text-primary">Open &amp; Print PDF</span>
                <ArrowRight className="h-4 w-4 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer transition hover:border-primary/50 hover:shadow-md"
            onClick={() => openCustomReport("monthly")}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                  <FileBarChart className="h-5 w-5" />
                </div>
                <Badge variant="outline">Monthly</Badge>
              </div>
              <h3 className="mt-3 text-base font-semibold">Monthly Permission Report</h3>
              <p className="mt-1 text-sm text-muted-foreground">Aggregated permission & movement activity for the month.</p>
              <div className="mt-4 flex items-center justify-between pt-2">
                <span className="text-xs font-medium text-primary">Open &amp; Print PDF</span>
                <ArrowRight className="h-4 w-4 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer transition hover:border-primary/50 hover:shadow-md"
            onClick={() => openCustomReport("outside")}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                  <MapPin className="h-5 w-5" />
                </div>
                <Badge className="bg-amber-500/20 text-amber-700 hover:bg-amber-500/30">Active</Badge>
              </div>
              <h3 className="mt-3 text-base font-semibold">Students Outside Report</h3>
              <p className="mt-1 text-sm text-muted-foreground">Students currently scanned out with expected return times.</p>
              <div className="mt-4 flex items-center justify-between pt-2">
                <span className="text-xs font-medium text-primary">Open &amp; Print PDF</span>
                <ArrowRight className="h-4 w-4 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer transition hover:border-primary/50 hover:shadow-md"
            onClick={() => openCustomReport("exits")}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600">
                  <Clock className="h-5 w-5" />
                </div>
                <Badge variant="outline">Security Gate</Badge>
              </div>
              <h3 className="mt-3 text-base font-semibold">Student Exit History</h3>
              <p className="mt-1 text-sm text-muted-foreground">Historical gate exit events with guard geo-coordinates.</p>
              <div className="mt-4 flex items-center justify-between pt-2">
                <span className="text-xs font-medium text-primary">Open &amp; Print PDF</span>
                <ArrowRight className="h-4 w-4 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer transition hover:border-primary/50 hover:shadow-md"
            onClick={() => openCustomReport("returns")}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <Badge variant="outline">Security Gate</Badge>
              </div>
              <h3 className="mt-3 text-base font-semibold">Student Return History</h3>
              <p className="mt-1 text-sm text-muted-foreground">Historical gate return events with punctuality checks.</p>
              <div className="mt-4 flex items-center justify-between pt-2">
                <span className="text-xs font-medium text-primary">Open &amp; Print PDF</span>
                <ArrowRight className="h-4 w-4 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer transition hover:border-primary/50 hover:shadow-md"
            onClick={() => openCustomReport("student")}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600">
                  <User className="h-5 w-5" />
                </div>
                <Badge variant="secondary">Individual</Badge>
              </div>
              <h3 className="mt-3 text-base font-semibold">Individual Student Dossier</h3>
              <p className="mt-1 text-sm text-muted-foreground">Search any student to generate their complete historical dossier.</p>
              <div className="mt-4 flex items-center justify-between pt-2">
                <span className="text-xs font-medium text-primary">Select Student &amp; Print</span>
                <ArrowRight className="h-4 w-4 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Stat label="Total Requests" value={reportsQuery.data?.data.totalRequests ?? 0} />
          <Stat label="Approved" value={reportsQuery.data?.data.approved ?? 0} />
          <Stat label="Rejected" value={reportsQuery.data?.data.rejected ?? 0} />
          <Stat label="Returned" value={reportsQuery.data?.data.returned ?? 0} />
          <Stat label="Gate Passes" value={reportsQuery.data?.data.gatePasses ?? 0} />
        </div>
      </div>

      {/* COMPREHENSIVE INTERACTIVE REPORT & PDF DIALOG */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[92vh] max-w-5xl overflow-hidden p-0 sm:rounded-xl">
          {/* Header */}
          <DialogHeader className="border-b bg-muted/40 px-6 py-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <DialogTitle className="text-xl font-bold">{reportTitle}</DialogTitle>
                <DialogDescription className="text-xs">
                  Review timeline records, parent verification live photos, GPS logs, and export printable PDF.
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExportCsv}>
                  <Download className="h-4 w-4" /> CSV
                </Button>
                <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground" onClick={handlePrintPdf}>
                  <Printer className="h-4 w-4" /> Print / Save PDF
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Filters Bar */}
          <div className="border-b bg-card/60 p-4">
            <div className="grid gap-3 md:grid-cols-12">
              {/* Scope Selector */}
              <div className="space-y-1 md:col-span-3">
                <label className="text-xs font-semibold text-muted-foreground">Report Scope</label>
                <div className="flex rounded-md bg-muted p-1">
                  <button
                    type="button"
                    className={`flex-1 rounded-sm py-1 text-xs font-medium transition ${
                      scopeMode === "ALL" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => {
                      setScopeMode("ALL");
                      setSelectedStudentId("");
                    }}
                  >
                    All Students
                  </button>
                  <button
                    type="button"
                    className={`flex-1 rounded-sm py-1 text-xs font-medium transition ${
                      scopeMode === "SINGLE" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => {
                      setScopeMode("SINGLE");
                      if (!selectedStudentId && students[0]) setSelectedStudentId(students[0].student_id || students[0].id);
                    }}
                  >
                    Single Student
                  </button>
                </div>
              </div>

              {/* Date Presets */}
              <div className="space-y-1 md:col-span-5">
                <label className="text-xs font-semibold text-muted-foreground">Date Range</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      setDatePreset("custom");
                    }}
                    className="h-8 text-xs"
                  />
                  <span className="text-xs text-muted-foreground">to</span>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => {
                      setToDate(e.target.value);
                      setDatePreset("custom");
                    }}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-1 md:col-span-4">
                <label className="text-xs font-semibold text-muted-foreground">Movement Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="ALL">All Statuses ({filteredLeaves.length})</option>
                  <option value="APPROVED">Approved / Out / Returned</option>
                  <option value="PENDING">Pending Only</option>
                  <option value="REJECTED">Rejected Only</option>
                  <option value="OUT">Currently Outside (OUT)</option>
                  <option value="RETURNED">Returned to Hostel</option>
                </select>
              </div>
            </div>

            {/* Quick Date Chips */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-muted-foreground">Quick Presets:</span>
              {[
                { label: "Today", value: "today" },
                { label: "Yesterday", value: "yesterday" },
                { label: "Last 7 Days", value: "last7" },
                { label: "This Month", value: "thisMonth" },
                { label: "Last 30 Days", value: "last30" },
                { label: "All Time", value: "all" },
              ].map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handlePresetChange(preset.value as DatePreset)}
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition ${
                    datePreset === preset.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Student Search & Selector (when in SINGLE scope mode) */}
            {scopeMode === "SINGLE" && (
              <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search student by Name, Roll No (e.g. 21N81A66G8), or Room..."
                      value={studentSearchTerm}
                      onChange={(e) => setStudentSearchTerm(e.target.value)}
                      className="h-8 pl-8 text-xs"
                    />
                  </div>
                  <div className="flex-1">
                    <select
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      {filteredStudentsList.length === 0 ? (
                        <option value="">No matching students found</option>
                      ) : (
                        filteredStudentsList.map((s) => (
                          <option key={s.id} value={s.student_id || s.id}>
                            {s.student_id} - {s.name} ({formatRoom(s.room_number)})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                {selectedStudentObj && (
                  <div className="mt-2 flex items-center gap-3 rounded-md bg-background/80 px-3 py-2 text-xs shadow-sm">
                    {selectedStudentObj.profile_photo ? (
                      <img
                        src={selectedStudentObj.profile_photo as string}
                        alt=""
                        className="h-9 w-9 rounded-full object-cover border border-primary/30"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                        {selectedStudentObj.name?.slice(0, 2).toUpperCase() || "ST"}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{selectedStudentObj.name}</span>
                        <Badge variant="outline" className="text-[10px]">{selectedStudentObj.student_id}</Badge>
                        <Badge variant="secondary" className="text-[10px]">{formatRoom(selectedStudentObj.room_number)}</Badge>
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Phone: {selectedStudentObj.mobile} | Parent: {selectedStudentObj.parent_mobile}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between border-b bg-muted/20 px-6 py-2 text-xs font-medium text-muted-foreground">
            <span>
              Showing <strong className="text-foreground">{filteredLeaves.length}</strong> matching records from{" "}
              <strong className="text-foreground">{fromDate}</strong> to <strong className="text-foreground">{toDate}</strong>
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" /> Returned / Approved: {counts.returned + counts.approved}
              </span>
              <span className="flex items-center gap-1 text-amber-600">
                <Clock className="h-3.5 w-3.5" /> Outside: {counts.out}
              </span>
              <span className="flex items-center gap-1 text-rose-600">
                <XCircle className="h-3.5 w-3.5" /> Rejected: {counts.rejected}
              </span>
            </div>
          </div>

          {/* Scrollable Records & Timeline List (Printed directly in PDF with identical styling) */}
          <div id="dialog-print-cards" className="max-h-[55vh] space-y-4 overflow-y-auto p-6">
            {filteredLeaves.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <FileText className="h-10 w-10 text-muted-foreground/40" />
                <h4 className="mt-3 font-semibold text-foreground">No Records Found</h4>
                <p className="mt-1 text-xs">Try adjusting your date range or status filters above.</p>
              </div>
            ) : (
              filteredLeaves.map((leave, idx) => {
                const isOut = leave.gatePass?.status === "OUT" || (leave.gatePass?.out_time_actual && !leave.gatePass?.in_time_actual);
                const isReturned = Boolean(leave.gatePass?.in_time_actual || leave.gatePass?.status === "RETURNED" || leave.final_status === "RETURNED");
                const parentPhoto = (leave as any).parent_approval_photo || (leave as any).parent_profile_photo;
                const studentPhoto = leave.student?.profile_photo;

                return (
                  <div
                    key={leave.id || idx}
                    className="rounded-xl border border-border/80 bg-card p-4 shadow-sm transition hover:border-primary/40"
                  >
                    {/* Record Top Bar */}
                    <div className="flex flex-col gap-2 border-b border-border/60 pb-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        {studentPhoto ? (
                          <img
                            src={studentPhoto}
                            alt=""
                            className="student-photo h-10 w-10 rounded-full border border-primary/20 object-cover shadow-sm"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                            {leave.student?.name?.slice(0, 2).toUpperCase() || "ST"}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">{leave.student?.name || "Student"}</span>
                            <Badge variant="outline" className="font-mono text-[10px]">
                              {leave.student?.student_id || leave.student_id}
                            </Badge>
                            <Badge variant="secondary" className="text-[10px]">
                              {formatRoom(leave.student?.room_number)}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] bg-muted/60">
                              Request #{idx + 1}
                            </Badge>
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            Hostel: {leave.student?.hostel_name || "Primary"} | Mobile: {leave.student?.mobile || "—"} | Parent: {leave.student?.parent_mobile || "—"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isReturned ? (
                          <Badge className="bg-teal-600 text-white font-semibold">RETURNED</Badge>
                        ) : isOut ? (
                          <Badge className="bg-blue-600 text-white font-semibold animate-pulse">CURRENTLY OUT</Badge>
                        ) : (
                          <Badge
                            className={
                              leave.final_status === "APPROVED"
                                ? "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20"
                                : leave.final_status === "REJECTED"
                                ? "bg-rose-500/15 text-rose-700 hover:bg-rose-500/20"
                                : "bg-amber-500/15 text-amber-700 hover:bg-amber-500/20"
                            }
                          >
                            {leave.final_status}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Reason and Scheduled Times */}
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      <div className="rounded-lg bg-muted/40 p-2.5 sm:col-span-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Reason / Destination
                        </span>
                        <p className="mt-0.5 text-xs font-medium text-foreground">
                          {leave.reason || "No reason specified"}
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-2.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Scheduled Window
                        </span>
                        <p className="mt-0.5 text-xs font-medium text-foreground">
                          {leave.from_date?.slice(0, 10)} ➔ {leave.to_date?.slice(0, 10)}
                        </p>
                      </div>
                    </div>

                    {/* 5-Step Visual Timeline Audit */}
                    <div className="mt-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Movement &amp; Verification Audit Trail
                      </span>
                      <div className="mt-2 grid gap-2 grid-cols-5">
                        {/* Step 1: Student Request */}
                        <div className="rounded-lg border border-border/80 bg-muted/20 p-2.5">
                          <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground">1</span>
                            Student Request
                          </div>
                          <div className="mt-1.5 space-y-1 text-[11px] text-muted-foreground">
                            <div>Submitted: {leave.created_at ? new Date(leave.created_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" }) : "—"}</div>
                            {(leave as any).student_lat != null && (leave as any).student_lng != null ? (
                              <a
                                href={`https://maps.google.com/?q=${(leave as any).student_lat},${(leave as any).student_lng}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-[10px] text-primary hover:underline"
                              >
                                <MapPin className="h-3 w-3" />
                                Lat: {Number((leave as any).student_lat).toFixed(4)}, Lng: {Number((leave as any).student_lng).toFixed(4)}
                              </a>
                            ) : (
                              <span className="text-[10px] text-muted-foreground/70">No GPS recorded</span>
                            )}
                          </div>
                        </div>

                        {/* Step 2: Parent Verification */}
                        <div className={`rounded-lg border p-2.5 ${
                          leave.parent_status === "APPROVED"
                            ? "border-emerald-500/30 bg-emerald-50/50"
                            : leave.parent_status === "REJECTED"
                            ? "border-rose-500/30 bg-rose-50/50"
                            : "border-amber-500/30 bg-amber-50/50"
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground">2</span>
                              Parent Verification
                            </div>
                            <span className={`text-[10px] font-bold ${
                              leave.parent_status === "APPROVED" ? "text-emerald-600" : leave.parent_status === "REJECTED" ? "text-rose-600" : "text-amber-600"
                            }`}>
                              {leave.parent_status || "PENDING"}
                            </span>
                          </div>
                          <div className="mt-1.5 space-y-1 text-[11px] text-muted-foreground">
                            {(leave as any).parent_lat != null && (leave as any).parent_lng != null && (
                              <a
                                href={`https://maps.google.com/?q=${(leave as any).parent_lat},${(leave as any).parent_lng}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-[10px] text-primary hover:underline"
                              >
                                <MapPin className="h-3 w-3" />
                                Parent GPS
                              </a>
                            )}
                            {/* Live Verification Photo */}
                            {parentPhoto ? (
                              <div className="pt-1">
                                <span className="text-[10px] font-semibold text-foreground flex items-center gap-1">
                                  <Camera className="h-3 w-3 text-primary" /> Live Photo:
                                </span>
                                <img
                                  src={parentPhoto}
                                  alt="Parent Live Verification"
                                  className="live-photo mt-1 h-14 w-full cursor-pointer rounded border border-border object-cover transition hover:opacity-90 shadow-sm"
                                  onClick={() => setZoomedPhoto({ url: parentPhoto, title: `Parent Verification Photo - ${leave.student?.name}` })}
                                />
                              </div>
                            ) : (
                              <span className="text-[10px] italic text-muted-foreground">No photo uploaded</span>
                            )}
                            {(leave as any).parent_reject_reason && (
                              <p className="text-[10px] text-rose-600">Reject: {(leave as any).parent_reject_reason}</p>
                            )}
                          </div>
                        </div>

                        {/* Step 3: Warden / Hostel Admin Approval */}
                        <div className={`rounded-lg border p-2.5 ${
                          leave.hostel_status === "APPROVED"
                            ? "border-emerald-500/30 bg-emerald-50/50"
                            : leave.hostel_status === "REJECTED"
                            ? "border-rose-500/30 bg-rose-50/50"
                            : "border-amber-500/30 bg-amber-50/50"
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground">3</span>
                              Warden Review
                            </div>
                            <span className={`text-[10px] font-bold ${
                              leave.hostel_status === "APPROVED" ? "text-emerald-600" : leave.hostel_status === "REJECTED" ? "text-rose-600" : "text-amber-600"
                            }`}>
                              {leave.hostel_status || "PENDING"}
                            </span>
                          </div>
                          <div className="mt-1.5 space-y-1 text-[11px] text-muted-foreground">
                            {(leave as any).hostel_lat != null && (
                              <a
                                href={`https://maps.google.com/?q=${(leave as any).hostel_lat},${(leave as any).hostel_lng}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-[10px] text-primary hover:underline"
                              >
                                <MapPin className="h-3 w-3" /> Warden GPS
                              </a>
                            )}
                            {(leave as any).note && <p className="text-[10px] text-foreground font-medium">Note: {(leave as any).note}</p>}
                            {(leave as any).hostel_reject_reason && (
                              <p className="text-[10px] text-rose-600 font-medium">Reject: {(leave as any).hostel_reject_reason}</p>
                            )}
                          </div>
                        </div>

                        {/* Step 4: Gate Security Exit */}
                        <div className="rounded-lg border border-border/80 bg-muted/20 p-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground">4</span>
                              Gate Exit
                            </div>
                            {leave.gatePass?.out_time_actual ? (
                              <Badge variant="outline" className="bg-emerald-500/10 text-[9px] text-emerald-700">SCANNED OUT</Badge>
                            ) : (
                              <span className="text-[10px] text-muted-foreground">Pending</span>
                            )}
                          </div>
                          <div className="mt-1.5 space-y-1 text-[11px] text-muted-foreground">
                            <div>Time: {leave.gatePass?.out_time_actual ? new Date(leave.gatePass.out_time_actual).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</div>
                            {(leave as any).gatePass?.out_guard_lat != null && (
                              <a
                                href={`https://maps.google.com/?q=${(leave as any).gatePass.out_guard_lat},${(leave as any).gatePass.out_guard_lng}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-[10px] text-primary hover:underline"
                              >
                                <MapPin className="h-3 w-3" /> Gate GPS
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Step 5: Gate Security Return */}
                        <div className="rounded-lg border border-border/80 bg-muted/20 p-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground">5</span>
                              Gate Return
                            </div>
                            {leave.gatePass?.in_time_actual ? (
                              <Badge variant="outline" className="bg-teal-500/10 text-[9px] text-teal-700">RETURNED</Badge>
                            ) : isOut ? (
                              <Badge variant="outline" className="bg-blue-500/10 text-[9px] text-blue-700">OUTSIDE</Badge>
                            ) : (
                              <span className="text-[10px] text-muted-foreground">Pending</span>
                            )}
                          </div>
                          <div className="mt-1.5 space-y-1 text-[11px] text-muted-foreground">
                            <div>Time: {leave.gatePass?.in_time_actual ? new Date(leave.gatePass.in_time_actual).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</div>
                            {(leave as any).gatePass?.in_guard_lat != null && (
                              <a
                                href={`https://maps.google.com/?q=${(leave as any).gatePass.in_guard_lat},${(leave as any).gatePass.in_guard_lng}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-[10px] text-primary hover:underline"
                              >
                                <MapPin className="h-3 w-3" /> Return GPS
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Dialog Footer */}
          <DialogFooter className="border-t bg-muted/30 px-6 py-3">
            <div className="flex w-full items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Hostel GATEX Automated Audit &amp; Movement Logging System
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                  Close
                </Button>
                <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground" onClick={handlePrintPdf}>
                  <Printer className="h-4 w-4" /> Print / Save as PDF
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PHOTO ZOOM MODAL */}
      {zoomedPhoto && (
        <Dialog open={Boolean(zoomedPhoto)} onOpenChange={() => setZoomedPhoto(null)}>
          <DialogContent className="max-w-md p-4">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold">{zoomedPhoto.title}</DialogTitle>
            </DialogHeader>
            <div className="mt-2 overflow-hidden rounded-lg border border-border">
              <img src={zoomedPhoto.url} alt="Enlarged preview" className="w-full object-contain" />
            </div>
            <DialogFooter className="mt-4">
              <Button size="sm" variant="outline" onClick={() => setZoomedPhoto(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

