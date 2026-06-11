import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { returnedToday } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/tracking/returned")({
  head: () => ({ meta: [{ title: "Students Returned · HostelOS" }] }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Students returned today" description="Verified entries logged by security guards." />
      <Card><CardContent className="p-4">
        <div className="overflow-x-auto rounded-lg border border-border/60">
          <Table>
            <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Student ID</TableHead><TableHead>Room</TableHead><TableHead>Return Time</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {returnedToday.map(s => (
                <TableRow key={s.id}>
                  <TableCell><div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarFallback className="bg-accent text-accent-foreground text-xs">{s.name.split(" ").map(p=>p[0]).slice(0,2).join("")}</AvatarFallback></Avatar><span className="font-medium">{s.name}</span></div></TableCell>
                  <TableCell>{s.id}</TableCell>
                  <TableCell>{s.room}</TableCell>
                  <TableCell>{s.returnTime}</TableCell>
                  <TableCell><Badge className="bg-success text-success-foreground hover:bg-success">Returned</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent></Card>
    </>
  );
}
