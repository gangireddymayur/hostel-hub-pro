import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { outsideStudents } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/tracking/outside")({
  head: () => ({ meta: [{ title: "Students Outside · HostelOS" }] }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Students currently outside" description="Live view of all students who haven't returned yet." />
      <Card><CardContent className="p-4">
        <div className="overflow-x-auto rounded-lg border border-border/60">
          <Table>
            <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Student ID</TableHead><TableHead>Room</TableHead><TableHead>Out Time</TableHead><TableHead>Expected Return</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {outsideStudents.map(s => (
                <TableRow key={s.id}>
                  <TableCell><div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarFallback className="bg-accent text-accent-foreground text-xs">{s.name.split(" ").map(p=>p[0]).slice(0,2).join("")}</AvatarFallback></Avatar><span className="font-medium">{s.name}</span></div></TableCell>
                  <TableCell>{s.id}</TableCell>
                  <TableCell>{s.room}</TableCell>
                  <TableCell>{s.outTime}</TableCell>
                  <TableCell>{s.expectedReturn}</TableCell>
                  <TableCell><Badge className="bg-warning/20 text-warning-foreground dark:text-warning hover:bg-warning/20">Outside</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent></Card>
    </>
  );
}
