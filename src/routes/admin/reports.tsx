import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, FileBarChart } from "lucide-react";
import { PageHeader } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { getLeaveRequests, getHostelReports } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({ meta: [{ title: "Reports · HostelOS" }] }),
  component: Reports,
});

const items = [
  { title: "Daily Permission Report", desc: "Permissions approved/rejected today." },
  { title: "Monthly Permission Report", desc: "Aggregated permission activity for the month." },
  { title: "Students Outside Report", desc: "Students currently outside the hostel." },
  { title: "Student Exit History", desc: "Historical exit events with timestamps." },
  { title: "Student Return History", desc: "Historical return events with timestamps." },
];

function Reports() {
  const reportsQuery = useQuery({ queryKey: ["hostel-reports"], queryFn: getHostelReports });
  const leavesQuery = useQuery({ queryKey: ["hostel-leaves"], queryFn: getLeaveRequests });

  const leaves = leavesQuery.data?.data ?? [];
  const chartData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, index) => {
      const dayIndex = (index + 1) % 7;
      const dayLeaves = leaves.filter((leave) => new Date(leave.created_at).getDay() === dayIndex);
      return {
        day,
        approved: dayLeaves.filter((leave) => leave.final_status === "APPROVED").length,
      };
    });
  }, [leaves]);

  const handleExport = (title: string) => {
    const downloadCsv = (filename: string, headers: string[], rows: string[][]) => {
      const content = [
        headers.join(","),
        ...rows.map((row) =>
          row
            .map((val) => {
              const strVal = String(val ?? "");
              return `"${strVal.replaceAll('"', '""')}"`;
            })
            .join(","),
        ),
      ].join("\n");

      const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const todayStr = new Date().toISOString().slice(0, 10);

    if (title === "Daily Permission Report") {
      const dailyLeaves = leaves.filter(
        (l) => l.created_at && l.created_at.slice(0, 10) === todayStr,
      );
      const headers = ["Student Name", "Student ID", "Room", "Reason", "From Date", "To Date", "Final Status", "Created At"];
      const dataRows = dailyLeaves.map((l) => [
        l.student?.name ?? "",
        l.student?.student_id ?? "",
        l.student?.room_number ?? "",
        l.reason ?? "",
        l.from_date ?? "",
        l.to_date ?? "",
        l.final_status ?? "",
        l.created_at ?? "",
      ]);
      downloadCsv(`daily_permission_report_${todayStr}.csv`, headers, dataRows);
      toast.success("Daily Permission Report exported");
    } else if (title === "Monthly Permission Report") {
      const currentMonthStr = new Date().toISOString().slice(0, 7);
      const monthlyLeaves = leaves.filter(
        (l) => l.created_at && l.created_at.slice(0, 7) === currentMonthStr,
      );
      const headers = ["Student Name", "Student ID", "Room", "Reason", "From Date", "To Date", "Final Status", "Created At"];
      const dataRows = monthlyLeaves.map((l) => [
        l.student?.name ?? "",
        l.student?.student_id ?? "",
        l.student?.room_number ?? "",
        l.reason ?? "",
        l.from_date ?? "",
        l.to_date ?? "",
        l.final_status ?? "",
        l.created_at ?? "",
      ]);
      downloadCsv(`monthly_permission_report_${currentMonthStr}.csv`, headers, dataRows);
      toast.success("Monthly Permission Report exported");
    } else if (title === "Students Outside Report") {
      const outsideLeaves = leaves.filter((l) => l.gatePass?.status === "OUT");
      const headers = ["Student Name", "Student ID", "Room", "Out Time Actual", "Expected Return", "Student Lat", "Student Lng", "Exit Guard Lat", "Exit Guard Lng"];
      const dataRows = outsideLeaves.map((l) => [
        l.student?.name ?? "",
        l.student?.student_id ?? "",
        l.student?.room_number ?? "",
        l.gatePass?.out_time_actual ?? "",
        l.return_time ?? "",
        String((l as any).student_lat ?? ""),
        String((l as any).student_lng ?? ""),
        String((l as any).gatePass?.out_guard_lat ?? ""),
        String((l as any).gatePass?.out_guard_lng ?? ""),
      ]);
      downloadCsv("students_currently_outside.csv", headers, dataRows);
      toast.success("Students Outside Report exported");
    } else if (title === "Student Exit History") {
      const exitLeaves = leaves.filter((l) => l.gatePass?.out_time_actual);
      const headers = ["Student Name", "Student ID", "Room", "Out Time Actual", "Student Lat", "Student Lng", "Exit Guard Lat", "Exit Guard Lng"];
      const dataRows = exitLeaves.map((l) => [
        l.student?.name ?? "",
        l.student?.student_id ?? "",
        l.student?.room_number ?? "",
        l.gatePass?.out_time_actual ?? "",
        String((l as any).student_lat ?? ""),
        String((l as any).student_lng ?? ""),
        String((l as any).gatePass?.out_guard_lat ?? ""),
        String((l as any).gatePass?.out_guard_lng ?? ""),
      ]);
      downloadCsv("student_exit_history.csv", headers, dataRows);
      toast.success("Student Exit History exported");
    } else if (title === "Student Return History") {
      const returnLeaves = leaves.filter((l) => l.gatePass?.in_time_actual);
      const headers = [
        "Student Name",
        "Student ID",
        "Room",
        "Out Time Actual",
        "In Time Actual",
        "Student Lat",
        "Student Lng",
        "Exit Guard Lat",
        "Exit Guard Lng",
        "Entry Guard Lat",
        "Entry Guard Lng",
      ];
      const dataRows = returnLeaves.map((l) => [
        l.student?.name ?? "",
        l.student?.student_id ?? "",
        l.student?.room_number ?? "",
        l.gatePass?.out_time_actual ?? "",
        l.gatePass?.in_time_actual ?? "",
        String((l as any).student_lat ?? ""),
        String((l as any).student_lng ?? ""),
        String((l as any).gatePass?.out_guard_lat ?? ""),
        String((l as any).gatePass?.out_guard_lng ?? ""),
        String((l as any).gatePass?.in_guard_lat ?? ""),
        String((l as any).gatePass?.in_guard_lng ?? ""),
      ]);
      downloadCsv("student_return_history.csv", headers, dataRows);
      toast.success("Student Return History exported");
    } else {
      toast.error("Unknown report type");
    }
  };

  return (
    <>
      <PageHeader title="Reports" description="Download operational reports for compliance and reviews." />

      <Card className="mb-6">
        <CardHeader><CardTitle>Permission volume - last 7 days</CardTitle></CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
              <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
              <Area type="monotone" dataKey="approved" stroke="var(--color-success)" fill="url(#g2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.title} className="transition hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><FileBarChart className="h-5 w-5" /></div>
              <h3 className="mt-3 text-base font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => handleExport(item.title)}>
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Stat label="Total requests" value={reportsQuery.data?.data.totalRequests ?? 0} />
        <Stat label="Approved" value={reportsQuery.data?.data.approved ?? 0} />
        <Stat label="Rejected" value={reportsQuery.data?.data.rejected ?? 0} />
        <Stat label="Returned" value={reportsQuery.data?.data.returned ?? 0} />
        <Stat label="Gate passes" value={reportsQuery.data?.data.gatePasses ?? 0} />
      </div>
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
