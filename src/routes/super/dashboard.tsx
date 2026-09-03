import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, CheckCircle2, GraduationCap, ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/dashboard-shell";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { getSuperAnalytics, getSuperHostels } from "@/lib/api";

export const Route = createFileRoute("/super/dashboard")({
  head: () => ({ meta: [{ title: "Super Admin Dashboard · GATEX" }] }),
  component: SuperDashboard,
});

function SuperDashboard() {
  const analyticsQuery = useQuery({ queryKey: ["super-analytics"], queryFn: getSuperAnalytics });
  const hostelsQuery = useQuery({ queryKey: ["super-hostels"], queryFn: getSuperHostels });

  const analytics = analyticsQuery.data?.data;
  const hostels = hostelsQuery.data?.data ?? [];

  if (analyticsQuery.isLoading || hostelsQuery.isLoading) {
    return (
      <>
        <PageHeader title="Platform overview" description="Loading live data from the backend..." />
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Loading dashboard…</CardContent>
        </Card>
      </>
    );
  }

  const totalHostels = analytics?.hostels ?? hostels.length;
  const activeHostels = hostels.filter((hostel) => hostel.status === "ACTIVE").length;
  const totalStudents = analytics?.students ?? 0;
  const totalLeaves = analytics?.leaveRequests ?? 0;
  const recentHostels = [...hostels].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))).slice(0, 5);
  const monthlyGrowth = analytics?.monthlyGrowth ?? [];
  const weeklyLeaves = analytics?.weeklyLeaves ?? [];

  return (
    <>
      <PageHeader title="Platform overview" description="Real-time view of hostels, students and permission activity across the network." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Hostels" value={totalHostels} icon={Building2} tone="primary" trend="+ live" />
        <StatCard label="Active Hostels" value={activeHostels} icon={CheckCircle2} tone="success" hint={`${totalHostels - activeHostels} disabled`} />
        <StatCard label="Total Students" value={totalStudents.toLocaleString()} icon={GraduationCap} tone="info" />
        <StatCard label="Permission Requests" value={totalLeaves.toLocaleString()} icon={ClipboardList} tone="warning" hint="Across all hostels" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Platform growth</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} opacity={0.3} />
                <XAxis 
                  dataKey="month" 
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
                <Area type="monotone" dataKey="students" stroke="var(--color-primary)" fill="url(#gs)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Permission activity</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyLeaves} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="superRequestsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                  </linearGradient>
                  <linearGradient id="superApprovedGradient" x1="0" y1="0" x2="0" y2="1">
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
                <Bar dataKey="requests" fill="url(#superRequestsGradient)" radius={[6, 6, 0, 0]} maxBarSize={24} />
                <Bar dataKey="approved" fill="url(#superApprovedGradient)" radius={[6, 6, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Recently added hostels</CardTitle></CardHeader>
        <CardContent>
          <div className="divide-y divide-border/60">
            {recentHostels.map((hostel) => (
              <div key={hostel.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{hostel.hostel_name}</p>
                  <p className="truncate text-xs text-muted-foreground">{hostel.email}</p>
                </div>
                <div className="hidden text-right text-xs text-muted-foreground sm:block">
                  <p>{hostel._count?.students ?? 0} students</p>
                  <p>{hostel._count?.staff ?? 0} staff</p>
                </div>
                <Badge variant={hostel.status === "ACTIVE" ? "default" : "secondary"} className={hostel.status === "ACTIVE" ? "bg-success text-success-foreground hover:bg-success" : ""}>
                  {hostel.status.toLowerCase()}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
