import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
import { getHostelDashboard, getHostelStudents, getLeaveRequests, getHostels } from "@/lib/api";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · HostelOS" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const dashboardQuery = useQuery({ queryKey: ["hostel-dashboard"], queryFn: getHostelDashboard });
  const studentsQuery = useQuery({ queryKey: ["hostel-students"], queryFn: getHostelStudents });
  const leaveQuery = useQuery({ queryKey: ["hostel-leaves"], queryFn: getLeaveRequests });
  const hostelsQuery = useQuery({ queryKey: ["active-hostels"], queryFn: getHostels });

  const [selectedBranch, setSelectedBranch] = useState("ALL");

  const students = studentsQuery.data?.data ?? [];
  const leaves = leaveQuery.data?.data ?? [];
  const hostels = hostelsQuery.data?.data ?? [];

  const filteredStudents = useMemo(() => {
    if (selectedBranch === "ALL") return students;
    return students.filter((s) => s.hostel_id === selectedBranch);
  }, [students, selectedBranch]);

  const filteredLeaves = useMemo(() => {
    if (selectedBranch === "ALL") return leaves;
    return leaves.filter((l) => l.hostel_id === selectedBranch);
  }, [leaves, selectedBranch]);

  const outsideStudents = useMemo(
    () => filteredLeaves.filter((leave) => leave.gatePass?.status === "OUT").length,
    [filteredLeaves],
  );

  const pending = useMemo(() => {
    if (selectedBranch === "ALL") {
      return dashboardQuery.data?.data.pendingLeaves ?? leaves.filter((leave) => leave.final_status === "PENDING").length;
    }
    return filteredLeaves.filter((leave) => leave.final_status === "PENDING").length;
  }, [dashboardQuery.data, leaves, filteredLeaves, selectedBranch]);

  const approved = useMemo(() => {
    if (selectedBranch === "ALL") {
      return dashboardQuery.data?.data.approvedLeaves ?? leaves.filter((leave) => leave.final_status === "APPROVED").length;
    }
    return filteredLeaves.filter((leave) => leave.final_status === "APPROVED").length;
  }, [dashboardQuery.data, leaves, filteredLeaves, selectedBranch]);

  const rejected = useMemo(() => {
    return filteredLeaves.filter((leave) => leave.final_status === "REJECTED").length;
  }, [filteredLeaves]);

  const recent = useMemo(() => {
    return [...filteredLeaves].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))).slice(0, 6);
  }, [filteredLeaves]);

  const weeklyLeaves = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, index) => {
      const dayIndex = (index + 1) % 7;
      const dayLeaves = filteredLeaves.filter((leave) => new Date(leave.created_at).getDay() === dayIndex);
      return {
        day,
        requests: dayLeaves.length,
        approved: dayLeaves.filter((leave) => leave.final_status === "APPROVED").length,
      };
    });
  }, [filteredLeaves]);

  if (dashboardQuery.isLoading || studentsQuery.isLoading || leaveQuery.isLoading || hostelsQuery.isLoading) {
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Welcome back" description="Here's what's happening at your hostel today." />
        <div className="flex items-center gap-2 self-start sm:self-center bg-card p-1.5 rounded-lg border border-border shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground px-2">Branch:</span>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="h-8 w-44 rounded-md border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring font-medium"
          >
            <option value="ALL">All Branches</option>
            {hostels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.hostel_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 mt-4">
        <StatCard label="Total Students" value={filteredStudents.length} icon={Users} tone="primary" />
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
              <BarChart data={weeklyLeaves} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="requestsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                  </linearGradient>
                  <linearGradient id="approvedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0.25} />
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
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)" 
                  }} 
                  itemStyle={{ color: "#f8fafc" }} 
                  labelStyle={{ color: "#94a3b8", fontWeight: "bold" }} 
                />
                <Legend 
                  wrapperStyle={{ fontSize: 12, paddingTop: 12 }} 
                  iconType="circle" 
                  iconSize={8} 
                />
                <Bar dataKey="requests" fill="url(#requestsGradient)" radius={[6, 6, 0, 0]} maxBarSize={32} />
                <Bar dataKey="approved" fill="url(#approvedGradient)" radius={[6, 6, 0, 0]} maxBarSize={32} />
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
