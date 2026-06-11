import { createFileRoute } from "@tanstack/react-router";
import { Users, BedDouble, MapPin, ClipboardList, CheckCircle2, XCircle } from "lucide-react";
import { PageHeader } from "@/components/dashboard-shell";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { students, rooms, leaves, weeklyLeaves, outsideStudents } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · HostelOS" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const pending = leaves.filter(l => l.finalStatus.startsWith("pending")).length;
  const approved = leaves.filter(l => l.finalStatus === "approved").length;
  const rejected = leaves.filter(l => l.finalStatus === "rejected").length;
  const recent = leaves.slice(0, 6);

  return (
    <>
      <PageHeader title="Welcome back" description="Here's what's happening at Sunrise Boys Hostel today." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Students" value={students.length} icon={Users} tone="primary" />
        <StatCard label="Total Rooms" value={rooms.length} icon={BedDouble} tone="info" />
        <StatCard label="Students Outside" value={outsideStudents.length} icon={MapPin} tone="warning" />
        <StatCard label="Pending Leaves" value={pending} icon={ClipboardList} tone="warning" />
        <StatCard label="Approved Leaves" value={approved} icon={CheckCircle2} tone="success" />
        <StatCard label="Rejected Leaves" value={rejected} icon={XCircle} tone="destructive" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>This week's leave activity</CardTitle></CardHeader>
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
          <CardHeader><CardTitle>Recent leave requests</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {recent.map(l => (
              <div key={l.id} className="flex items-center gap-3">
                <Avatar className="h-9 w-9"><AvatarFallback className="bg-accent text-accent-foreground text-xs">{l.studentName.split(" ").map(s=>s[0]).slice(0,2).join("")}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{l.studentName}</p>
                  <p className="truncate text-xs text-muted-foreground">{l.reason}</p>
                </div>
                <StatusBadge status={l.finalStatus} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls = status === "approved" ? "bg-success text-success-foreground hover:bg-success"
    : status === "rejected" ? "bg-destructive text-destructive-foreground hover:bg-destructive"
    : "bg-warning/20 text-warning-foreground dark:text-warning hover:bg-warning/20";
  return <Badge className={`capitalize ${cls}`}>{status}</Badge>;
}
