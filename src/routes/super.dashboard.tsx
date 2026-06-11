import { createFileRoute } from "@tanstack/react-router";
import { Building2, CheckCircle2, GraduationCap, ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/dashboard-shell";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Legend,
} from "recharts";
import { hostels, monthlyGrowth, weeklyLeaves } from "@/lib/mock-data";

export const Route = createFileRoute("/super/dashboard")({
  head: () => ({ meta: [{ title: "Super Admin Dashboard · HostelOS" }] }),
  component: SuperDashboard,
});

function SuperDashboard() {
  const totalHostels = hostels.length;
  const activeHostels = hostels.filter(h => h.status === "active").length;
  const totalStudents = hostels.reduce((s, h) => s + h.students, 0);
  const totalLeaves = 1284;

  return (
    <>
      <PageHeader title="Platform overview" description="Real-time view of hostels, students and leave activity across the network." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Hostels" value={totalHostels} icon={Building2} tone="primary" trend="+3 this month" />
        <StatCard label="Active Hostels" value={activeHostels} icon={CheckCircle2} tone="success" hint={`${totalHostels - activeHostels} disabled`} />
        <StatCard label="Total Students" value={totalStudents.toLocaleString()} icon={GraduationCap} tone="info" trend="+12.4% MoM" />
        <StatCard label="Leave Requests" value={totalLeaves.toLocaleString()} icon={ClipboardList} tone="warning" hint="Last 30 days" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Platform growth</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyGrowth}>
                <defs>
                  <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="students" stroke="var(--color-primary)" fill="url(#gs)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Leave activity</CardTitle></CardHeader>
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
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Recently added hostels</CardTitle></CardHeader>
        <CardContent>
          <div className="divide-y divide-border/60">
            {hostels.slice(0, 5).map(h => (
              <div key={h.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{h.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{h.address}</p>
                </div>
                <div className="hidden text-right text-xs text-muted-foreground sm:block">
                  <p>{h.students} students</p>
                  <p>{h.rooms} rooms</p>
                </div>
                <Badge variant={h.status === "active" ? "default" : "secondary"} className={h.status === "active" ? "bg-success text-success-foreground hover:bg-success" : ""}>
                  {h.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
