import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Check, X } from "lucide-react";
import { PageHeader } from "@/components/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getLeaveRequests, reviewLeaveRequest, bulkReviewLeaveRequests } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/leaves")({
  head: () => ({ meta: [{ title: "Permission Requests · HostelOS" }] }),
  component: LeavesPage,
});

function LeavesPage() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [reason, setReason] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const leavesQuery = useQuery({ queryKey: ["hostel-leaves"], queryFn: getLeaveRequests });
  const list = useMemo(() => leavesQuery.data?.data ?? [], [leavesQuery.data]);

  const reasons = useMemo(() => Array.from(new Set(list.map((leave) => leave.reason))), [list]);

  const reviewMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "APPROVED" | "REJECTED" }) => reviewLeaveRequest(id, { status }),
    onSuccess: async (_, variables) => {
      toast.success(`Permission ${variables.status.toLowerCase()}`);
      setSelectedIds((prev) => prev.filter((id) => id !== variables.id));
      await queryClient.invalidateQueries({ queryKey: ["hostel-leaves"] });
      await queryClient.invalidateQueries({ queryKey: ["hostel-dashboard"] });
      await queryClient.invalidateQueries({ queryKey: ["hostel-reports"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update permission"),
  });

  const bulkReviewMutation = useMutation({
    mutationFn: (status: "APPROVED" | "REJECTED") => bulkReviewLeaveRequests({ ids: selectedIds, status }),
    onSuccess: async (_, status) => {
      toast.success(`Bulk permissions ${status.toLowerCase()} successfully`);
      setSelectedIds([]);
      await queryClient.invalidateQueries({ queryKey: ["hostel-leaves"] });
      await queryClient.invalidateQueries({ queryKey: ["hostel-dashboard"] });
      await queryClient.invalidateQueries({ queryKey: ["hostel-reports"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to bulk update permissions"),
  });

  const filter = (status?: string) =>
    list.filter((leave) => {
      if (status && leave.final_status !== status) return false;
      if (reason !== "all" && leave.reason !== reason) return false;
      if (
        q &&
        !(
          leave.student.name.toLowerCase().includes(q.toLowerCase()) ||
          leave.student.student_id.toLowerCase().includes(q.toLowerCase())
        )
      )
        return false;
      return true;
    });

  return (
    <>
      <PageHeader title="Permission requests" description="Review parent-approved permission requests from students." />

      <Card>
        <CardContent className="p-4">
          <div className="mb-4 flex flex-wrap gap-2">
            <div className="relative max-w-sm flex-1 min-w-[200px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by name or ID…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
            </div>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All reasons</SelectItem>
                {reasons.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>



          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="all">History</TabsTrigger>
            </TabsList>
            {[
              { v: "pending", filter: filter("PENDING") },
              { v: "approved", filter: filter("APPROVED") },
              { v: "rejected", filter: filter("REJECTED") },
              { v: "all", filter: filter() },
            ].map((tab) => (
              <TabsContent key={tab.v} value={tab.v} className="mt-4">
                <div className="overflow-x-auto rounded-lg border border-border/60">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Parent</TableHead>
                        <TableHead>Hostel</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tab.filter.map((leave) => (
                        <TableRow key={leave.id}>
                          <TableCell>
                            <div className="font-medium">{leave.student.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {leave.student.student_id} · {leave.student.room_number} {leave.student.hostel_name ? `(${leave.student.hostel_name})` : ""}
                            </div>
                          </TableCell>
                          <TableCell>{leave.reason}</TableCell>
                          <TableCell className="text-xs">
                            <div>
                              {new Date(leave.from_date).toLocaleDateString()} → {new Date(leave.to_date).toLocaleDateString()}
                            </div>
                            <div className="text-muted-foreground">
                              {new Date(leave.out_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} /{" "}
                              {new Date(leave.return_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </TableCell>
                          <TableCell><ApprovalDot s={leave.parent_status.toLowerCase() as "pending" | "approved" | "rejected"} /></TableCell>
                          <TableCell><ApprovalDot s={leave.hostel_status.toLowerCase() as "pending" | "approved" | "rejected"} /></TableCell>
                          <TableCell><StatusBadge s={leave.final_status.toLowerCase()} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}

function ApprovalDot({ s }: { s: "pending" | "approved" | "rejected" }) {
  const c = s === "approved" ? "bg-success" : s === "rejected" ? "bg-destructive" : "bg-warning";
  return <div className="flex items-center gap-2 text-xs capitalize"><span className={`h-2 w-2 rounded-full ${c}`} />{s}</div>;
}

function StatusBadge({ s }: { s: string }) {
  const cls =
    s === "approved"
      ? "bg-success text-success-foreground hover:bg-success"
      : s === "rejected"
        ? "bg-destructive text-destructive-foreground hover:bg-destructive"
        : "bg-warning/20 text-warning-foreground dark:text-warning hover:bg-warning/20";
  return <Badge className={`capitalize ${cls}`}>{s}</Badge>;
}
