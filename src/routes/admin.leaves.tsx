import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Check, X } from "lucide-react";
import { PageHeader } from "@/components/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { leaves as seed, type Leave } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/leaves")({
  head: () => ({ meta: [{ title: "Leave Requests · HostelOS" }] }),
  component: LeavesPage,
});

function LeavesPage() {
  const [list, setList] = useState<Leave[]>(seed);
  const [q, setQ] = useState("");
  const [reason, setReason] = useState("all");

  const filter = (status?: string) => list.filter(l => {
    if (status && l.finalStatus !== status) return false;
    if (reason !== "all" && l.reason !== reason) return false;
    if (q && !(l.studentName.toLowerCase().includes(q.toLowerCase()) || l.studentId.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  const setStatus = (id: string, s: "approved" | "rejected") => {
    setList(list.map(l => l.id === id ? { ...l, finalStatus: s, hostelApproval: s } : l));
    toast.success(`Leave ${s}`);
  };

  const reasons = Array.from(new Set(seed.map(l => l.reason)));

  return (
    <>
      <PageHeader title="Leave requests" description="Review parent-approved leave requests from students." />

      <Card>
        <CardContent className="p-4">
          <div className="mb-4 flex flex-wrap gap-2">
            <div className="relative max-w-sm flex-1 min-w-[200px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by name or ID…" value={q} onChange={e => setQ(e.target.value)} className="pl-9" />
            </div>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All reasons</SelectItem>
                {reasons.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
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
              { v: "pending", filter: filter("pending hostel").concat(filter("pending parent")) },
              { v: "approved", filter: filter("approved") },
              { v: "rejected", filter: filter("rejected") },
              { v: "all", filter: filter() },
            ].map(t => (
              <TabsContent key={t.v} value={t.v} className="mt-4">
                <div className="overflow-x-auto rounded-lg border border-border/60">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead><TableHead>Reason</TableHead><TableHead>Dates</TableHead>
                        <TableHead>Parent</TableHead><TableHead>Hostel</TableHead><TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {t.filter.map(l => (
                        <TableRow key={l.id}>
                          <TableCell>
                            <div className="font-medium">{l.studentName}</div>
                            <div className="text-xs text-muted-foreground">{l.studentId} · {l.room}</div>
                          </TableCell>
                          <TableCell>{l.reason}</TableCell>
                          <TableCell className="text-xs">
                            <div>{l.fromDate} → {l.toDate}</div>
                            <div className="text-muted-foreground">{l.outTime} / {l.returnTime}</div>
                          </TableCell>
                          <TableCell><ApprovalDot s={l.parentApproval} /></TableCell>
                          <TableCell><ApprovalDot s={l.hostelApproval} /></TableCell>
                          <TableCell><StatusBadge s={l.finalStatus} /></TableCell>
                          <TableCell className="text-right">
                            {l.finalStatus.startsWith("pending") ? (
                              <div className="flex justify-end gap-1">
                                <Button size="sm" variant="outline" onClick={() => setStatus(l.id, "approved")} className="text-success border-success/30 hover:bg-success/10"><Check className="h-4 w-4" /></Button>
                                <Button size="sm" variant="outline" onClick={() => setStatus(l.id, "rejected")} className="text-destructive border-destructive/30 hover:bg-destructive/10"><X className="h-4 w-4" /></Button>
                              </div>
                            ) : <span className="text-xs text-muted-foreground">—</span>}
                          </TableCell>
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
  const cls = s === "approved" ? "bg-success text-success-foreground hover:bg-success"
    : s === "rejected" ? "bg-destructive text-destructive-foreground hover:bg-destructive"
    : "bg-warning/20 text-warning-foreground dark:text-warning hover:bg-warning/20";
  return <Badge className={`capitalize ${cls}`}>{s}</Badge>;
}
