import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, MapPin, ClipboardList, CheckCircle2, XCircle } from "lucide-react";
import { PageHeader } from "@/components/dashboard-shell";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  head: () => ({ meta: [{ title: "Dashboard · GATEX" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const dashboardQuery = useQuery({ queryKey: ["hostel-dashboard"], queryFn: getHostelDashboard });
  const studentsQuery = useQuery({ queryKey: ["hostel-students"], queryFn: getHostelStudents });
  const leaveQuery = useQuery({ queryKey: ["hostel-leaves"], queryFn: getLeaveRequests });
  const hostelsQuery = useQuery({ queryKey: ["active-hostels"], queryFn: getHostels });

  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [timeRange, setTimeRange] = useState<"week" | "month" | "custom">("week");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const [outsideSearch, setOutsideSearch] = useState("");
  const [outsideTimeFilter, setOutsideTimeFilter] = useState<"24h" | "week" | "month" | "custom">("24h");
  const [outsideCustomFrom, setOutsideCustomFrom] = useState("");
  const [outsideCustomTo, setOutsideCustomTo] = useState("");
  const [reviewedFilter, setReviewedFilter] = useState<"ALL" | "APPROVED" | "REJECTED">("ALL");
  const [reviewedTimeFilter, setReviewedTimeFilter] = useState<"24h" | "week" | "month" | "custom">("24h");
  const [reviewedCustomFrom, setReviewedCustomFrom] = useState("");
  const [reviewedCustomTo, setReviewedCustomTo] = useState("");

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

  const chartData = useMemo(() => {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    if (timeRange === "week") {
      startDate.setDate(now.getDate() - 6);
    } else if (timeRange === "month") {
      startDate.setDate(now.getDate() - 29);
    } else if (timeRange === "custom") {
      if (customFrom) startDate = new Date(customFrom);
      if (customTo) {
        endDate = new Date(customTo);
      } else {
        endDate = new Date();
      }
    }

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const buckets: { day: string; requests: number; approved: number }[] = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      const dateStr = current.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      buckets.push({
        day: dateStr,
        requests: 0,
        approved: 0,
      });
      current.setDate(current.getDate() + 1);
      if (buckets.length > 120) break;
    }

    filteredLeaves.forEach((leave) => {
      const created = new Date(leave.created_at);
      if (created >= startDate && created <= endDate) {
        const dateStr = created.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const bucket = buckets.find((b) => b.day === dateStr);
        if (bucket) {
          bucket.requests += 1;
          if (leave.final_status === "APPROVED") {
            bucket.approved += 1;
          }
        }
      }
    });

    return buckets;
  }, [filteredLeaves, timeRange, customFrom, customTo]);

  const outsideLast24h = useMemo(() => {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    if (outsideTimeFilter === "24h") {
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (outsideTimeFilter === "week") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (outsideTimeFilter === "month") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (outsideTimeFilter === "custom") {
      if (outsideCustomFrom) startDate = new Date(outsideCustomFrom);
      if (outsideCustomTo) {
        endDate = new Date(outsideCustomTo);
        endDate.setHours(23, 59, 59, 999);
      } else {
        endDate = new Date();
      }
    }

    const list = filteredLeaves.filter((leave) => {
      if (leave.gatePass?.status !== "OUT") return false;
      const outTime = leave.gatePass.out_time_actual ? new Date(leave.gatePass.out_time_actual) : null;
      if (!outTime) return true; // Fallback to display
      if (outsideTimeFilter === "custom") {
        return outTime >= startDate && outTime <= endDate;
      }
      return outTime >= startDate;
    });

    if (!outsideSearch.trim()) return list;
    return list.filter((l) => 
      l.student.name.toLowerCase().includes(outsideSearch.toLowerCase()) ||
      l.student.student_id.toLowerCase().includes(outsideSearch.toLowerCase())
    );
  }, [filteredLeaves, outsideSearch, outsideTimeFilter, outsideCustomFrom, outsideCustomTo]);

  const reviewedRequests = useMemo(() => {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    if (reviewedTimeFilter === "24h") {
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (reviewedTimeFilter === "week") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (reviewedTimeFilter === "month") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (reviewedTimeFilter === "custom") {
      if (reviewedCustomFrom) startDate = new Date(reviewedCustomFrom);
      if (reviewedCustomTo) {
        endDate = new Date(reviewedCustomTo);
        endDate.setHours(23, 59, 59, 999);
      } else {
        endDate = new Date();
      }
    }

    const list = filteredLeaves.filter((leave) => {
      if (leave.final_status !== "APPROVED" && leave.final_status !== "REJECTED") return false;
      const rawDate = leave.updated_at || leave.created_at;
      const date = rawDate ? new Date(String(rawDate)) : null;
      if (!date) return true; // Fallback
      if (reviewedTimeFilter === "custom") {
        return date >= startDate && date <= endDate;
      }
      return date >= startDate;
    });

    let filtered = list;
    if (reviewedFilter !== "ALL") {
      filtered = list.filter((l) => l.final_status === reviewedFilter);
    }
    return filtered.sort((a, b) => {
      const dateA = a.updated_at || a.created_at;
      const dateB = b.updated_at || b.created_at;
      return String(dateB).localeCompare(String(dateA));
    });
  }, [filteredLeaves, reviewedFilter, reviewedTimeFilter, reviewedCustomFrom, reviewedCustomTo]);

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

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Table 1: Outside Students */}
        <Card>
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base font-semibold">Students Outside</CardTitle>
              <div className="flex flex-wrap items-center gap-1.5">
                <input
                  type="text"
                  placeholder="Search name/ID…"
                  value={outsideSearch}
                  onChange={(e) => setOutsideSearch(e.target.value)}
                  className="h-8 w-32 rounded-md border border-input bg-background px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring font-medium"
                />
                <select
                  value={outsideTimeFilter}
                  onChange={(e) => setOutsideTimeFilter(e.target.value as any)}
                  className="h-8 w-28 rounded-md border border-input bg-background px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring font-medium"
                >
                  <option value="24h">Last 24h</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>
            {outsideTimeFilter === "custom" && (
              <div className="flex items-center gap-1.5 mt-2 justify-end">
                <input
                  type="date"
                  value={outsideCustomFrom}
                  onChange={(e) => setOutsideCustomFrom(e.target.value)}
                  className="h-7 rounded-md border border-input bg-background px-2 text-[10px] font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <span className="text-[10px] text-muted-foreground">to</span>
                <input
                  type="date"
                  value={outsideCustomTo}
                  onChange={(e) => setOutsideCustomTo(e.target.value)}
                  className="h-7 rounded-md border border-input bg-background px-2 text-[10px] font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            )}
          </CardHeader>
          <CardContent className="h-[450px] overflow-y-auto pt-4 space-y-4">
            {outsideLast24h.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No students currently outside within selected timeframe.</p>
            ) : (
              outsideLast24h.map((leave) => (
                <div key={leave.id} className="flex items-center justify-between border-b border-border/40 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                     <Avatar className="h-8 w-8">
                       <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
                         {leave.student.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                       </AvatarFallback>
                     </Avatar>
                     <div>
                       <p className="text-sm font-medium">{leave.student.name}</p>
                       <p className="text-xs text-muted-foreground">{leave.student.student_id} · Room {leave.student.room_number}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <span className="inline-flex items-center rounded-full bg-warning/10 px-2 py-0.5 text-2xs font-medium text-warning border border-warning/20">OUT</span>
                     <p className="text-[10px] text-muted-foreground mt-1">
                       {leave.gatePass?.out_time_actual 
                         ? new Date(leave.gatePass.out_time_actual).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                         : "N/A"
                       }
                     </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Table 2: Reviewed Requests */}
        <Card>
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base font-semibold">Reviewed Requests</CardTitle>
              <div className="flex flex-wrap items-center gap-1.5">
                <select
                  value={reviewedFilter}
                  onChange={(e) => setReviewedFilter(e.target.value as any)}
                  className="h-8 w-28 rounded-md border border-input bg-background px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring font-medium"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
                <select
                  value={reviewedTimeFilter}
                  onChange={(e) => setReviewedTimeFilter(e.target.value as any)}
                  className="h-8 w-28 rounded-md border border-input bg-background px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring font-medium"
                >
                  <option value="24h">Last 24h</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>
            {reviewedTimeFilter === "custom" && (
              <div className="flex items-center gap-1.5 mt-2 justify-end">
                <input
                  type="date"
                  value={reviewedCustomFrom}
                  onChange={(e) => setReviewedCustomFrom(e.target.value)}
                  className="h-7 rounded-md border border-input bg-background px-2 text-[10px] font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <span className="text-[10px] text-muted-foreground">to</span>
                <input
                  type="date"
                  value={reviewedCustomTo}
                  onChange={(e) => setReviewedCustomTo(e.target.value)}
                  className="h-7 rounded-md border border-input bg-background px-2 text-[10px] font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            )}
          </CardHeader>
          <CardContent className="h-[450px] overflow-y-auto pt-4 space-y-4">
            {reviewedRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No reviewed requests found.</p>
            ) : (
               reviewedRequests.map((leave) => (
                 <div key={leave.id} className="flex items-center justify-between border-b border-border/40 pb-3 last:border-0 last:pb-0">
                   <div className="flex items-center gap-3">
                     <Avatar className="h-8 w-8">
                       <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
                         {leave.student.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                       </AvatarFallback>
                     </Avatar>
                     <div>
                       <p className="text-sm font-medium">{leave.student.name}</p>
                       <p className="text-xs text-muted-foreground">{leave.reason}</p>
                     </div>
                   </div>
                   <div className="text-right shrink-0">
                     <StatusBadge status={leave.final_status.toLowerCase()} />
                      <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                        {(() => {
                          const rawDate = leave.updated_at || leave.created_at;
                          const date = rawDate ? new Date(String(rawDate)) : null;
                          return date 
                            ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : "N/A";
                        })()}
                      </p>
                   </div>
                 </div>
               ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4">
        <Card className="w-full">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2">
            <CardTitle>Permission Activity</CardTitle>
            <div className="flex flex-wrap gap-2 items-center">
              <Button
                size="sm"
                variant={timeRange === "week" ? "default" : "outline"}
                onClick={() => setTimeRange("week")}
                className="h-8 text-xs px-3"
              >
                This Week
              </Button>
              <Button
                size="sm"
                variant={timeRange === "month" ? "default" : "outline"}
                onClick={() => setTimeRange("month")}
                className="h-8 text-xs px-3"
              >
                This Month
              </Button>
              <Button
                size="sm"
                variant={timeRange === "custom" ? "default" : "outline"}
                onClick={() => setTimeRange("custom")}
                className="h-8 text-xs px-3"
              >
                Custom Range
              </Button>
              {timeRange === "custom" && (
                <div className="flex items-center gap-1.5 ml-2">
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="h-8 rounded-md border border-input bg-background px-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <span className="text-xs text-muted-foreground">to</span>
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="h-8 rounded-md border border-input bg-background px-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
