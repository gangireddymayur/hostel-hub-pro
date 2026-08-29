import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Printer, ArrowRight, Calendar, FileBarChart, MapPin, Clock, ShieldCheck, User, Download, Search, CheckCircle2, XCircle, FileText, Camera } from "lucide-react";
import { P as PageHeader } from "./dashboard-shell-mrMXMb84.mjs";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle, d as CardDescription } from "./card-Dji2GI0L.mjs";
import { m as getHostelReports, n as getLeaveRequests, o as getHostelStudents, B as Button, I as Input } from "./api-1s68NJGb.mjs";
import { B as Badge } from "./badge-BX1jrLrW.mjs";
import { D as Dialog, b as DialogContent, c as DialogHeader, d as DialogTitle, e as DialogDescription, f as DialogFooter } from "./dialog-AcqKNbeP.mjs";
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area } from "recharts";
import { toast } from "sonner";
import "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "./router--ACQUFm8.mjs";
import "@radix-ui/react-avatar";
import "clsx";
import "tailwind-merge";
function formatRoom(raw) {
  if (!raw) return "—";
  const trimmed = raw.trim();
  if (/^room\s*/i.test(trimmed)) return trimmed;
  return `Room ${trimmed}`;
}
function Reports() {
  const reportsQuery = useQuery({
    queryKey: ["hostel-reports"],
    queryFn: getHostelReports
  });
  const leavesQuery = useQuery({
    queryKey: ["hostel-leaves"],
    queryFn: getLeaveRequests
  });
  const studentsQuery = useQuery({
    queryKey: ["hostel-students"],
    queryFn: getHostelStudents
  });
  const leaves = leavesQuery.data?.data ?? [];
  const students = studentsQuery.data?.data ?? [];
  const [modalOpen, setModalOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState("Comprehensive Permission & Audit Report");
  const [scopeMode, setScopeMode] = useState("ALL");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [datePreset, setDatePreset] = useState("thisMonth");
  const [fromDate, setFromDate] = useState(() => {
    const d = /* @__PURE__ */ new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = useState(() => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [zoomedPhoto, setZoomedPhoto] = useState(null);
  const handlePresetChange = (preset) => {
    setDatePreset(preset);
    const today = /* @__PURE__ */ new Date();
    const todayStr = today.toISOString().slice(0, 10);
    if (preset === "today") {
      setFromDate(todayStr);
      setToDate(todayStr);
    } else if (preset === "yesterday") {
      const y = /* @__PURE__ */ new Date();
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().slice(0, 10);
      setFromDate(yStr);
      setToDate(yStr);
    } else if (preset === "last7") {
      const d = /* @__PURE__ */ new Date();
      d.setDate(d.getDate() - 7);
      setFromDate(d.toISOString().slice(0, 10));
      setToDate(todayStr);
    } else if (preset === "thisMonth") {
      const d = /* @__PURE__ */ new Date();
      d.setDate(1);
      setFromDate(d.toISOString().slice(0, 10));
      setToDate(todayStr);
    } else if (preset === "last30") {
      const d = /* @__PURE__ */ new Date();
      d.setDate(d.getDate() - 30);
      setFromDate(d.toISOString().slice(0, 10));
      setToDate(todayStr);
    } else if (preset === "all") {
      setFromDate("2020-01-01");
      setToDate(todayStr);
    }
  };
  const openCustomReport = (type, studentId) => {
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
      if (students[0]) {
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
  const filteredStudentsList = useMemo(() => {
    if (!studentSearchTerm.trim()) return students;
    const term = studentSearchTerm.toLowerCase();
    return students.filter((s) => s.name && s.name.toLowerCase().includes(term) || s.student_id && s.student_id.toLowerCase().includes(term) || s.room_number && s.room_number.toLowerCase().includes(term) || s.mobile && s.mobile.includes(term));
  }, [students, studentSearchTerm]);
  const selectedStudentObj = useMemo(() => {
    if (!selectedStudentId) return null;
    return students.find((s) => s.id === selectedStudentId || s.student_id && s.student_id.toLowerCase() === selectedStudentId.toLowerCase()) ?? null;
  }, [students, selectedStudentId]);
  const filteredLeaves = useMemo(() => {
    return leaves.filter((leave) => {
      if (scopeMode === "SINGLE") {
        if (selectedStudentId) {
          const matchId = leave.student?.id === selectedStudentId || leave.student?.student_id && leave.student.student_id.toLowerCase() === selectedStudentId.toLowerCase() || leave.student_id && leave.student_id.toLowerCase() === selectedStudentId.toLowerCase();
          if (!matchId) return false;
        }
      }
      const leaveDate = (leave.created_at || leave.from_date || "").slice(0, 10);
      if (fromDate && leaveDate && leaveDate < fromDate) return false;
      if (toDate && leaveDate && leaveDate > toDate) return false;
      if (statusFilter === "APPROVED" && leave.final_status !== "APPROVED" && leave.hostel_status !== "APPROVED" && !leave.gatePass) return false;
      if (statusFilter === "PENDING" && leave.final_status !== "PENDING") return false;
      if (statusFilter === "REJECTED" && leave.final_status !== "REJECTED" && leave.hostel_status !== "REJECTED" && leave.parent_status !== "REJECTED") return false;
      if (statusFilter === "OUT") {
        const isOut = leave.gatePass?.status === "OUT" || leave.gatePass?.out_time_actual && !leave.gatePass?.in_time_actual;
        if (!isOut) return false;
      }
      if (statusFilter === "RETURNED") {
        const isReturned = Boolean(leave.gatePass?.in_time_actual || leave.gatePass?.status === "RETURNED" || leave.final_status === "RETURNED");
        if (!isReturned) return false;
      }
      return true;
    });
  }, [leaves, scopeMode, selectedStudentId, fromDate, toDate, statusFilter]);
  const counts = useMemo(() => {
    let approved = 0;
    let out = 0;
    let returned = 0;
    let rejected = 0;
    let pending = 0;
    for (const l of filteredLeaves) {
      const isOut = l.gatePass?.status === "OUT" || l.gatePass?.out_time_actual && !l.gatePass?.in_time_actual;
      const isRet = Boolean(l.gatePass?.in_time_actual || l.gatePass?.status === "RETURNED" || l.final_status === "RETURNED");
      const isRej = l.final_status === "REJECTED" || l.hostel_status === "REJECTED" || l.parent_status === "REJECTED";
      const isApp = l.final_status === "APPROVED" || l.hostel_status === "APPROVED" || Boolean(l.gatePass);
      if (isRet) returned++;
      else if (isOut) out++;
      else if (isRej) rejected++;
      else if (isApp) approved++;
      else pending++;
    }
    return {
      approved,
      out,
      returned,
      rejected,
      pending,
      total: filteredLeaves.length
    };
  }, [filteredLeaves]);
  const chartData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, index) => {
      const dayIndex = (index + 1) % 7;
      const dayLeaves = leaves.filter((leave) => new Date(leave.created_at).getDay() === dayIndex);
      return {
        day,
        approved: dayLeaves.filter((leave) => leave.final_status === "APPROVED" || leave.gatePass != null).length
      };
    });
  }, [leaves]);
  const handleExportCsv = () => {
    if (filteredLeaves.length === 0) {
      toast.error("No records match the current filters to export.");
      return;
    }
    const headers = ["Student ID", "Student Name", "Room Number", "Student Mobile", "Parent Mobile", "Hostel Name", "Request Type", "Reason", "From Date", "To Date", "Created At", "Student Lat", "Student Lng", "Parent Status", "Parent Reject Reason", "Parent Lat", "Parent Lng", "Parent Live Photo Attached", "Hostel Status", "Hostel Note", "Hostel Lat", "Hostel Lng", "Final Status", "Pass Number", "Out Time Actual", "In Time Actual", "Out Guard Lat", "Out Guard Lng", "In Guard Lat", "In Guard Lng"];
    const dataRows = filteredLeaves.map((l) => [l.student?.student_id ?? l.student_id ?? "", l.student?.name ?? "", l.student?.room_number ?? "", l.student?.mobile ?? "", l.student?.parent_mobile ?? "", l.student?.hostel_name ?? "", l.request_type ?? "LEAVE", l.reason ?? "", l.from_date ?? "", l.to_date ?? "", l.created_at ?? "", String(l.student_lat ?? ""), String(l.student_lng ?? ""), l.parent_status ?? "", l.parent_reject_reason ?? "", String(l.parent_lat ?? ""), String(l.parent_lng ?? ""), l.parent_approval_photo ? "YES" : "NO", l.hostel_status ?? "", l.note ?? l.hostel_reject_reason ?? "", String(l.hostel_lat ?? ""), String(l.hostel_lng ?? ""), l.final_status ?? "", l.gatePass?.pass_number ?? "", l.gatePass?.out_time_actual ?? "", l.gatePass?.in_time_actual ?? "", String(l.gatePass?.out_guard_lat ?? ""), String(l.gatePass?.out_guard_lng ?? ""), String(l.gatePass?.in_guard_lat ?? ""), String(l.gatePass?.in_guard_lng ?? "")]);
    const content = [headers.join(","), ...dataRows.map((row) => row.map((val) => {
      const strVal = String(val ?? "");
      return `"${strVal.replaceAll('"', '""')}"`;
    }).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + content], {
      type: "text/csv;charset=utf-8;"
    });
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
    const styleSheets = Array.from(document.querySelectorAll("link[rel='stylesheet'], style")).map((node) => node.outerHTML).join("\n");
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
        } catch (_) {
        }
      }, 2e3);
    }, 400);
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("style", { dangerouslySetInnerHTML: {
      __html: `
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
      `
    } }),
    /* @__PURE__ */ jsxs("div", { className: "print:hidden", children: [
      /* @__PURE__ */ jsx(PageHeader, { title: "Reports & Audit Logs", description: "Generate comprehensive student dossiers, multi-point audit timelines, and high-resolution PDF reports." }),
      /* @__PURE__ */ jsx(Card, { className: "mb-6 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10 shadow-sm", children: /* @__PURE__ */ jsxs(CardContent, { className: "flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Badge, { className: "bg-primary text-primary-foreground", children: "NEW" }),
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold tracking-tight text-foreground", children: "Comprehensive Student Audit & PDF Report Generator" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Filter by date range or individual student to generate an official PDF dossier with complete 5-step movement audit, parent live photos, and GPS geo-points." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxs(Button, { className: "gap-2 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 px-5", onClick: () => openCustomReport("general"), children: [
          /* @__PURE__ */ jsx(Printer, { className: "h-4 w-4" }),
          "Generate Audit PDF Report"
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsxs(Card, { className: "mb-6", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-base font-semibold", children: "Permission Volume - Last 7 Days" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Daily approved student leave and outing permissions" })
          ] }),
          /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", onClick: () => openCustomReport("daily"), children: [
            "View Daily Logs ",
            /* @__PURE__ */ jsx(ArrowRight, { className: "ml-1 h-3.5 w-3.5" })
          ] })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { className: "h-64", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(AreaChart, { data: chartData, margin: {
          top: 10,
          right: 10,
          left: -20,
          bottom: 0
        }, children: [
          /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "g2", x1: "0", y1: "0", x2: "0", y2: "1", children: [
            /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "var(--color-success)", stopOpacity: 0.45 }),
            /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "var(--color-success)", stopOpacity: 0.01 })
          ] }) }),
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--color-border)", vertical: false, opacity: 0.3 }),
          /* @__PURE__ */ jsx(XAxis, { dataKey: "day", stroke: "var(--color-muted-foreground)", fontSize: 12, tickLine: false, axisLine: false, dy: 8 }),
          /* @__PURE__ */ jsx(YAxis, { stroke: "var(--color-muted-foreground)", fontSize: 12, allowDecimals: false, tickLine: false, axisLine: false, dx: -8 }),
          /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
            background: "rgba(15, 23, 42, 0.85)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 12,
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)"
          }, itemStyle: {
            color: "#f8fafc"
          }, labelStyle: {
            color: "#94a3b8",
            fontWeight: "bold"
          } }),
          /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "approved", stroke: "var(--color-success)", fill: "url(#g2)", strokeWidth: 2 })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsx(Card, { className: "cursor-pointer transition hover:border-primary/50 hover:shadow-md", onClick: () => openCustomReport("daily"), children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600", children: /* @__PURE__ */ jsx(Calendar, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsx(Badge, { variant: "outline", children: "Today" })
          ] }),
          /* @__PURE__ */ jsx("h3", { className: "mt-3 text-base font-semibold", children: "Daily Permission Report" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Permissions created, approved, or rejected today." }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-between pt-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-primary", children: "Open & Print PDF" }),
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 text-primary" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { className: "cursor-pointer transition hover:border-primary/50 hover:shadow-md", onClick: () => openCustomReport("monthly"), children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600", children: /* @__PURE__ */ jsx(FileBarChart, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsx(Badge, { variant: "outline", children: "Monthly" })
          ] }),
          /* @__PURE__ */ jsx("h3", { className: "mt-3 text-base font-semibold", children: "Monthly Permission Report" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Aggregated permission & movement activity for the month." }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-between pt-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-primary", children: "Open & Print PDF" }),
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 text-primary" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { className: "cursor-pointer transition hover:border-primary/50 hover:shadow-md", onClick: () => openCustomReport("outside"), children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600", children: /* @__PURE__ */ jsx(MapPin, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsx(Badge, { className: "bg-amber-500/20 text-amber-700 hover:bg-amber-500/30", children: "Active" })
          ] }),
          /* @__PURE__ */ jsx("h3", { className: "mt-3 text-base font-semibold", children: "Students Outside Report" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Students currently scanned out with expected return times." }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-between pt-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-primary", children: "Open & Print PDF" }),
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 text-primary" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { className: "cursor-pointer transition hover:border-primary/50 hover:shadow-md", onClick: () => openCustomReport("exits"), children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600", children: /* @__PURE__ */ jsx(Clock, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsx(Badge, { variant: "outline", children: "Security Gate" })
          ] }),
          /* @__PURE__ */ jsx("h3", { className: "mt-3 text-base font-semibold", children: "Student Exit History" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Historical gate exit events with guard geo-coordinates." }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-between pt-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-primary", children: "Open & Print PDF" }),
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 text-primary" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { className: "cursor-pointer transition hover:border-primary/50 hover:shadow-md", onClick: () => openCustomReport("returns"), children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600", children: /* @__PURE__ */ jsx(ShieldCheck, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsx(Badge, { variant: "outline", children: "Security Gate" })
          ] }),
          /* @__PURE__ */ jsx("h3", { className: "mt-3 text-base font-semibold", children: "Student Return History" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Historical gate return events with punctuality checks." }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-between pt-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-primary", children: "Open & Print PDF" }),
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 text-primary" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { className: "cursor-pointer transition hover:border-primary/50 hover:shadow-md", onClick: () => openCustomReport("student"), children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600", children: /* @__PURE__ */ jsx(User, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: "Individual" })
          ] }),
          /* @__PURE__ */ jsx("h3", { className: "mt-3 text-base font-semibold", children: "Individual Student Dossier" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Search any student to generate their complete historical dossier." }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-between pt-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-primary", children: "Select Student & Print" }),
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 text-primary" })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5", children: [
        /* @__PURE__ */ jsx(Stat, { label: "Total Requests", value: reportsQuery.data?.data.totalRequests ?? 0 }),
        /* @__PURE__ */ jsx(Stat, { label: "Approved", value: reportsQuery.data?.data.approved ?? 0 }),
        /* @__PURE__ */ jsx(Stat, { label: "Rejected", value: reportsQuery.data?.data.rejected ?? 0 }),
        /* @__PURE__ */ jsx(Stat, { label: "Returned", value: reportsQuery.data?.data.returned ?? 0 }),
        /* @__PURE__ */ jsx(Stat, { label: "Gate Passes", value: reportsQuery.data?.data.gatePasses ?? 0 })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Dialog, { open: modalOpen, onOpenChange: setModalOpen, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-h-[92vh] max-w-5xl overflow-hidden p-0 sm:rounded-xl", children: [
      /* @__PURE__ */ jsx(DialogHeader, { className: "border-b bg-muted/40 px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(DialogTitle, { className: "text-xl font-bold", children: reportTitle }),
          /* @__PURE__ */ jsx(DialogDescription, { className: "text-xs", children: "Review timeline records, parent verification live photos, GPS logs, and export printable PDF." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "gap-1.5", onClick: handleExportCsv, children: [
            /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
            " CSV"
          ] }),
          /* @__PURE__ */ jsxs(Button, { size: "sm", className: "gap-1.5 bg-primary text-primary-foreground", onClick: handlePrintPdf, children: [
            /* @__PURE__ */ jsx(Printer, { className: "h-4 w-4" }),
            " Print / Save PDF"
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "border-b bg-card/60 p-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-3 md:grid-cols-12", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1 md:col-span-3", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Report Scope" }),
            /* @__PURE__ */ jsxs("div", { className: "flex rounded-md bg-muted p-1", children: [
              /* @__PURE__ */ jsx("button", { type: "button", className: `flex-1 rounded-sm py-1 text-xs font-medium transition ${scopeMode === "ALL" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`, onClick: () => {
                setScopeMode("ALL");
                setSelectedStudentId("");
              }, children: "All Students" }),
              /* @__PURE__ */ jsx("button", { type: "button", className: `flex-1 rounded-sm py-1 text-xs font-medium transition ${scopeMode === "SINGLE" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`, onClick: () => {
                setScopeMode("SINGLE");
                if (!selectedStudentId && students[0]) setSelectedStudentId(students[0].student_id || students[0].id);
              }, children: "Single Student" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1 md:col-span-5", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Date Range" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Input, { type: "date", value: fromDate, onChange: (e) => {
                setFromDate(e.target.value);
                setDatePreset("custom");
              }, className: "h-8 text-xs" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "to" }),
              /* @__PURE__ */ jsx(Input, { type: "date", value: toDate, onChange: (e) => {
                setToDate(e.target.value);
                setDatePreset("custom");
              }, className: "h-8 text-xs" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1 md:col-span-4", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Movement Status" }),
            /* @__PURE__ */ jsxs("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), className: "h-8 w-full rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring", children: [
              /* @__PURE__ */ jsxs("option", { value: "ALL", children: [
                "All Statuses (",
                filteredLeaves.length,
                ")"
              ] }),
              /* @__PURE__ */ jsx("option", { value: "APPROVED", children: "Approved / Out / Returned" }),
              /* @__PURE__ */ jsx("option", { value: "PENDING", children: "Pending Only" }),
              /* @__PURE__ */ jsx("option", { value: "REJECTED", children: "Rejected Only" }),
              /* @__PURE__ */ jsx("option", { value: "OUT", children: "Currently Outside (OUT)" }),
              /* @__PURE__ */ jsx("option", { value: "RETURNED", children: "Returned to Hostel" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2.5 flex flex-wrap items-center gap-1.5", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[11px] font-medium text-muted-foreground", children: "Quick Presets:" }),
          [{
            label: "Today",
            value: "today"
          }, {
            label: "Yesterday",
            value: "yesterday"
          }, {
            label: "Last 7 Days",
            value: "last7"
          }, {
            label: "This Month",
            value: "thisMonth"
          }, {
            label: "Last 30 Days",
            value: "last30"
          }, {
            label: "All Time",
            value: "all"
          }].map((preset) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => handlePresetChange(preset.value), className: `rounded-full px-2.5 py-0.5 text-[11px] font-medium transition ${datePreset === preset.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"}`, children: preset.label }, preset.value))
        ] }),
        scopeMode === "SINGLE" && /* @__PURE__ */ jsxs("div", { className: "mt-3 rounded-lg border border-primary/20 bg-primary/5 p-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-center", children: [
            /* @__PURE__ */ jsxs("div", { className: "relative flex-1", children: [
              /* @__PURE__ */ jsx(Search, { className: "absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" }),
              /* @__PURE__ */ jsx(Input, { placeholder: "Search student by Name, Roll No (e.g. 21N81A66G8), or Room...", value: studentSearchTerm, onChange: (e) => setStudentSearchTerm(e.target.value), className: "h-8 pl-8 text-xs" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsx("select", { value: selectedStudentId, onChange: (e) => setSelectedStudentId(e.target.value), className: "h-8 w-full rounded-md border border-input bg-background px-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring", children: filteredStudentsList.length === 0 ? /* @__PURE__ */ jsx("option", { value: "", children: "No matching students found" }) : filteredStudentsList.map((s) => /* @__PURE__ */ jsxs("option", { value: s.student_id || s.id, children: [
              s.student_id,
              " - ",
              s.name,
              " (",
              formatRoom(s.room_number),
              ")"
            ] }, s.id)) }) })
          ] }),
          selectedStudentObj && /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center gap-3 rounded-md bg-background/80 px-3 py-2 text-xs shadow-sm", children: [
            selectedStudentObj.profile_photo ? /* @__PURE__ */ jsx("img", { src: selectedStudentObj.profile_photo, alt: "", className: "h-9 w-9 rounded-full object-cover border border-primary/30" }) : /* @__PURE__ */ jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-bold text-primary", children: selectedStudentObj.name?.slice(0, 2).toUpperCase() || "ST" }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: selectedStudentObj.name }),
                /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-[10px]", children: selectedStudentObj.student_id }),
                /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "text-[10px]", children: formatRoom(selectedStudentObj.room_number) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
                "Phone: ",
                selectedStudentObj.mobile,
                " | Parent: ",
                selectedStudentObj.parent_mobile
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b bg-muted/20 px-6 py-2 text-xs font-medium text-muted-foreground", children: [
        /* @__PURE__ */ jsxs("span", { children: [
          "Showing ",
          /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: filteredLeaves.length }),
          " matching records from",
          " ",
          /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: fromDate }),
          " to ",
          /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: toDate })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-emerald-600", children: [
            /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5" }),
            " Returned / Approved: ",
            counts.returned + counts.approved
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-amber-600", children: [
            /* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5" }),
            " Outside: ",
            counts.out
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-rose-600", children: [
            /* @__PURE__ */ jsx(XCircle, { className: "h-3.5 w-3.5" }),
            " Rejected: ",
            counts.rejected
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { id: "dialog-print-cards", className: "max-h-[55vh] space-y-4 overflow-y-auto p-6", children: filteredLeaves.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-12 text-center text-muted-foreground", children: [
        /* @__PURE__ */ jsx(FileText, { className: "h-10 w-10 text-muted-foreground/40" }),
        /* @__PURE__ */ jsx("h4", { className: "mt-3 font-semibold text-foreground", children: "No Records Found" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs", children: "Try adjusting your date range or status filters above." })
      ] }) : filteredLeaves.map((leave, idx) => {
        const isOut = leave.gatePass?.status === "OUT" || leave.gatePass?.out_time_actual && !leave.gatePass?.in_time_actual;
        const isReturned = Boolean(leave.gatePass?.in_time_actual || leave.gatePass?.status === "RETURNED" || leave.final_status === "RETURNED");
        const parentPhoto = leave.parent_approval_photo || leave.parent_profile_photo;
        const studentPhoto = leave.student?.profile_photo;
        return /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/80 bg-card p-4 shadow-sm transition hover:border-primary/40", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 border-b border-border/60 pb-3 sm:flex-row sm:items-center sm:justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              studentPhoto ? /* @__PURE__ */ jsx("img", { src: studentPhoto, alt: "", className: "student-photo h-10 w-10 rounded-full border border-primary/20 object-cover shadow-sm" }) : /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary", children: leave.student?.name?.slice(0, 2).toUpperCase() || "ST" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "font-bold text-foreground", children: leave.student?.name || "Student" }),
                  /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "font-mono text-[10px]", children: leave.student?.student_id || leave.student_id }),
                  /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "text-[10px]", children: formatRoom(leave.student?.room_number) }),
                  /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "text-[10px] bg-muted/60", children: [
                    "Request #",
                    idx + 1
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
                  "Hostel: ",
                  leave.student?.hostel_name || "Primary",
                  " | Mobile: ",
                  leave.student?.mobile || "—",
                  " | Parent: ",
                  leave.student?.parent_mobile || "—"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: isReturned ? /* @__PURE__ */ jsx(Badge, { className: "bg-teal-600 text-white font-semibold", children: "RETURNED" }) : isOut ? /* @__PURE__ */ jsx(Badge, { className: "bg-blue-600 text-white font-semibold animate-pulse", children: "CURRENTLY OUT" }) : /* @__PURE__ */ jsx(Badge, { className: leave.final_status === "APPROVED" ? "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20" : leave.final_status === "REJECTED" ? "bg-rose-500/15 text-rose-700 hover:bg-rose-500/20" : "bg-amber-500/15 text-amber-700 hover:bg-amber-500/20", children: leave.final_status }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-3 grid gap-2 sm:grid-cols-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-muted/40 p-2.5 sm:col-span-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Reason / Destination" }),
              /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-xs font-medium text-foreground", children: leave.reason || "No reason specified" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-muted/40 p-2.5", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Scheduled Window" }),
              /* @__PURE__ */ jsxs("p", { className: "mt-0.5 text-xs font-medium text-foreground", children: [
                leave.from_date?.slice(0, 10),
                " ➔ ",
                leave.to_date?.slice(0, 10)
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground", children: "Movement & Verification Audit Trail" }),
            /* @__PURE__ */ jsxs("div", { className: "mt-2 grid gap-2 grid-cols-5", children: [
              /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border/80 bg-muted/20 p-2.5", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 font-semibold text-xs text-foreground", children: [
                  /* @__PURE__ */ jsx("span", { className: "flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground", children: "1" }),
                  "Student Request"
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "mt-1.5 space-y-1 text-[11px] text-muted-foreground", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    "Submitted: ",
                    leave.created_at ? new Date(leave.created_at).toLocaleString([], {
                      dateStyle: "short",
                      timeStyle: "short"
                    }) : "—"
                  ] }),
                  leave.student_lat != null && leave.student_lng != null ? /* @__PURE__ */ jsxs("a", { href: `https://maps.google.com/?q=${leave.student_lat},${leave.student_lng}`, target: "_blank", rel: "noreferrer", className: "flex items-center gap-1 text-[10px] text-primary hover:underline", children: [
                    /* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3" }),
                    "Lat: ",
                    Number(leave.student_lat).toFixed(4),
                    ", Lng: ",
                    Number(leave.student_lng).toFixed(4)
                  ] }) : /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/70", children: "No GPS recorded" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: `rounded-lg border p-2.5 ${leave.parent_status === "APPROVED" ? "border-emerald-500/30 bg-emerald-50/50" : leave.parent_status === "REJECTED" ? "border-rose-500/30 bg-rose-50/50" : "border-amber-500/30 bg-amber-50/50"}`, children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 font-semibold text-xs text-foreground", children: [
                    /* @__PURE__ */ jsx("span", { className: "flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground", children: "2" }),
                    "Parent Verification"
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: `text-[10px] font-bold ${leave.parent_status === "APPROVED" ? "text-emerald-600" : leave.parent_status === "REJECTED" ? "text-rose-600" : "text-amber-600"}`, children: leave.parent_status || "PENDING" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "mt-1.5 space-y-1 text-[11px] text-muted-foreground", children: [
                  leave.parent_lat != null && leave.parent_lng != null && /* @__PURE__ */ jsxs("a", { href: `https://maps.google.com/?q=${leave.parent_lat},${leave.parent_lng}`, target: "_blank", rel: "noreferrer", className: "flex items-center gap-1 text-[10px] text-primary hover:underline", children: [
                    /* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3" }),
                    "Parent GPS"
                  ] }),
                  parentPhoto ? /* @__PURE__ */ jsxs("div", { className: "pt-1", children: [
                    /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-semibold text-foreground flex items-center gap-1", children: [
                      /* @__PURE__ */ jsx(Camera, { className: "h-3 w-3 text-primary" }),
                      " Live Photo:"
                    ] }),
                    /* @__PURE__ */ jsx("img", { src: parentPhoto, alt: "Parent Live Verification", className: "live-photo mt-1 h-14 w-full cursor-pointer rounded border border-border object-cover transition hover:opacity-90 shadow-sm", onClick: () => setZoomedPhoto({
                      url: parentPhoto,
                      title: `Parent Verification Photo - ${leave.student?.name}`
                    }) })
                  ] }) : /* @__PURE__ */ jsx("span", { className: "text-[10px] italic text-muted-foreground", children: "No photo uploaded" }),
                  leave.parent_reject_reason && /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-rose-600", children: [
                    "Reject: ",
                    leave.parent_reject_reason
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: `rounded-lg border p-2.5 ${leave.hostel_status === "APPROVED" ? "border-emerald-500/30 bg-emerald-50/50" : leave.hostel_status === "REJECTED" ? "border-rose-500/30 bg-rose-50/50" : "border-amber-500/30 bg-amber-50/50"}`, children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 font-semibold text-xs text-foreground", children: [
                    /* @__PURE__ */ jsx("span", { className: "flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground", children: "3" }),
                    "Warden Review"
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: `text-[10px] font-bold ${leave.hostel_status === "APPROVED" ? "text-emerald-600" : leave.hostel_status === "REJECTED" ? "text-rose-600" : "text-amber-600"}`, children: leave.hostel_status || "PENDING" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "mt-1.5 space-y-1 text-[11px] text-muted-foreground", children: [
                  leave.hostel_lat != null && /* @__PURE__ */ jsxs("a", { href: `https://maps.google.com/?q=${leave.hostel_lat},${leave.hostel_lng}`, target: "_blank", rel: "noreferrer", className: "flex items-center gap-1 text-[10px] text-primary hover:underline", children: [
                    /* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3" }),
                    " Warden GPS"
                  ] }),
                  leave.note && /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-foreground font-medium", children: [
                    "Note: ",
                    leave.note
                  ] }),
                  leave.hostel_reject_reason && /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-rose-600 font-medium", children: [
                    "Reject: ",
                    leave.hostel_reject_reason
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border/80 bg-muted/20 p-2.5", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 font-semibold text-xs text-foreground", children: [
                    /* @__PURE__ */ jsx("span", { className: "flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground", children: "4" }),
                    "Gate Exit"
                  ] }),
                  leave.gatePass?.out_time_actual ? /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "bg-emerald-500/10 text-[9px] text-emerald-700", children: "SCANNED OUT" }) : /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground", children: "Pending" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "mt-1.5 space-y-1 text-[11px] text-muted-foreground", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    "Time: ",
                    leave.gatePass?.out_time_actual ? new Date(leave.gatePass.out_time_actual).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    }) : "—"
                  ] }),
                  leave.gatePass?.out_guard_lat != null && /* @__PURE__ */ jsxs("a", { href: `https://maps.google.com/?q=${leave.gatePass.out_guard_lat},${leave.gatePass.out_guard_lng}`, target: "_blank", rel: "noreferrer", className: "flex items-center gap-1 text-[10px] text-primary hover:underline", children: [
                    /* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3" }),
                    " Gate GPS"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border/80 bg-muted/20 p-2.5", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 font-semibold text-xs text-foreground", children: [
                    /* @__PURE__ */ jsx("span", { className: "flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground", children: "5" }),
                    "Gate Return"
                  ] }),
                  leave.gatePass?.in_time_actual ? /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "bg-teal-500/10 text-[9px] text-teal-700", children: "RETURNED" }) : isOut ? /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "bg-blue-500/10 text-[9px] text-blue-700", children: "OUTSIDE" }) : /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground", children: "Pending" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "mt-1.5 space-y-1 text-[11px] text-muted-foreground", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    "Time: ",
                    leave.gatePass?.in_time_actual ? new Date(leave.gatePass.in_time_actual).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    }) : "—"
                  ] }),
                  leave.gatePass?.in_guard_lat != null && /* @__PURE__ */ jsxs("a", { href: `https://maps.google.com/?q=${leave.gatePass.in_guard_lat},${leave.gatePass.in_guard_lng}`, target: "_blank", rel: "noreferrer", className: "flex items-center gap-1 text-[10px] text-primary hover:underline", children: [
                    /* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3" }),
                    " Return GPS"
                  ] })
                ] })
              ] })
            ] })
          ] })
        ] }, leave.id || idx);
      }) }),
      /* @__PURE__ */ jsx(DialogFooter, { className: "border-t bg-muted/30 px-6 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex w-full items-center justify-between", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "Hostel GATEX Automated Audit & Movement Logging System" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: () => setModalOpen(false), children: "Close" }),
          /* @__PURE__ */ jsxs(Button, { size: "sm", className: "gap-1.5 bg-primary text-primary-foreground", onClick: handlePrintPdf, children: [
            /* @__PURE__ */ jsx(Printer, { className: "h-4 w-4" }),
            " Print / Save as PDF"
          ] })
        ] })
      ] }) })
    ] }) }),
    zoomedPhoto && /* @__PURE__ */ jsx(Dialog, { open: Boolean(zoomedPhoto), onOpenChange: () => setZoomedPhoto(null), children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-md p-4", children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { className: "text-sm font-semibold", children: zoomedPhoto.title }) }),
      /* @__PURE__ */ jsx("div", { className: "mt-2 overflow-hidden rounded-lg border border-border", children: /* @__PURE__ */ jsx("img", { src: zoomedPhoto.url, alt: "Enlarged preview", className: "w-full object-contain" }) }),
      /* @__PURE__ */ jsx(DialogFooter, { className: "mt-4", children: /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", onClick: () => setZoomedPhoto(null), children: "Close" }) })
    ] }) })
  ] });
}
function Stat({
  label,
  value
}) {
  return /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
    /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-2xl font-semibold", children: value })
  ] }) });
}
export {
  Reports as component
};
