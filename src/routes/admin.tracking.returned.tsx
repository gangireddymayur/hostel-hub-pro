import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getLeaveRequests } from "@/lib/api";

export const Route = createFileRoute("/admin/tracking/returned")({
  head: () => ({ meta: [{ title: "Students Returned · HostelOS" }] }),
  component: Page,
});

function Page() {
  const leaveQuery = useQuery({ queryKey: ["hostel-leaves"], queryFn: getLeaveRequests });
  const leaves = leaveQuery.data?.data ?? [];

  const returnedToday = useMemo(
    () =>
      leaves
        .filter((leave) => leave.gatePass?.status === "RETURNED" || !!leave.gatePass?.in_time_actual)
        .map((leave) => ({
          id: leave.student.id,
          name: leave.student.name,
          studentId: leave.student.student_id,
          room: leave.student.room_number,
          returnTime: leave.gatePass?.in_time_actual ?? leave.return_time,
        })),
    [leaves],
  );

  return (
    <>
      <PageHeader title="Students returned today" description="Verified entries logged by security guards." />
      <Card>
        <CardContent className="p-4">
          <div className="overflow-x-auto rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Return Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returnedToday.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                            {student.name
                              .split(" ")
                              .map((part) => part[0])
                              .slice(0, 2)
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{student.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{student.studentId}</TableCell>
                    <TableCell>{student.room}</TableCell>
                    <TableCell>{new Date(student.returnTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</TableCell>
                    <TableCell><Badge className="bg-success text-success-foreground hover:bg-success">Returned</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
