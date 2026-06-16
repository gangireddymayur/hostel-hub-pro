import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, MapPin, ClipboardList, CheckCircle2, XCircle } from "lucide-react";
import { PageHeader } from "@/components/dashboard-shell";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { getHostelDashboard, getHostelStudents, getLeaveRequests } from "@/lib/api";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · HostelOS" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const dashboardQuery = useQuery({ queryKey: ["hostel-dashboard"], queryFn: getHostelDashboard });
  const studentsQuery = useQuery({ queryKey: ["hostel-students"], queryFn: getHostelStudents });
  const leaveQuery = useQuery({ queryKey: ["hostel-leaves"], queryFn: getLeaveRequests });

  const students = studentsQuery.data?.data ?? [];
  const leaves = leaveQuery.data?.data ?? [];

  const outsideStudents = useMemo(
    () => leaves.filter((leave) => leave.gatePass?.status === "OUT").length,
    [leaves],
  );

  const pending = dashboardQuery.data?.data.pendingLeaves ?? leaves.filter((leave) => leave.final_status === "PENDING").length;
  const approved = dashboardQuery.data?.data.approvedLeaves ?? leaves.filter((leave) => leave.final_status === "APPROVED").length;
  const rejected = leaves.filter((leave) => leave.final_status === "REJECTED").length;
  const recent = [...leaves].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))).slice(0, 6);

  const weeklyLeaves = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, index) => {
      const dayIndex = (index + 1) % 7;
      const dayLeaves = leaves.filter((leave) => new Date(leave.created_at).getDay() === dayIndex);
      return {
        day,
        requests: dayLeaves.length,
        approved: dayLeaves.filter((leave) => leave.final_status === "APPROVED").length,
      };
    });
  }, [leaves]);

  if (dashboardQuery.isLoading || studentsQuery.isLoading || leaveQuery.isLoading) {
    return (
      <>
        <PageHeader title="Welcome back" description="Loading live hostel data..." />
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Loading dashboard…</CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Welcome back" description="Here's what's happening at your hostel today." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Students" value={students.length} icon={Users} tone="primary" />
        <StatCard label="Students Outside" value={outsideStudents} icon={MapPin} tone="warning" />
        <StatCard label="Pending Permissions" value={pending} icon={ClipboardList} tone="warning" />
        <StatCard label="Approved Permissions" value={approved} icon={CheckCircle2} tone="success" />
        <StatCard label="Rejected Permissions" value={rejected} icon={XCircle} tone="destructive" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>This week's permission activity</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyLeaves}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="requests" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="approved" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent permission requests</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {recent.map((leave) => (
              <div key={leave.id} className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                    {leave.student.name
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{leave.student.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{leave.reason}</p>
                </div>
                <StatusBadge status={leave.final_status.toLowerCase()} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "approved"
      ? "bg-success text-success-foreground hover:bg-success"
      : status === "rejected"
        ? "bg-destructive text-destructive-foreground hover:bg-destructive"
        : "bg-warning/20 text-warning-foreground dark:text-warning hover:bg-warning/20";
  return <Badge className={`capitalize ${cls}`}>{status}</Badge>;
}
