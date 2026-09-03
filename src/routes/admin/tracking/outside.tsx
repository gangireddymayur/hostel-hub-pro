import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getLeaveRequests } from "@/lib/api";

export const Route = createFileRoute("/admin/tracking/outside")({
  head: () => ({ meta: [{ title: "Students Outside · GATEX" }] }),
  component: Page,
});

function Page() {
  const leaveQuery = useQuery({ queryKey: ["hostel-leaves"], queryFn: getLeaveRequests });
  const leaves = leaveQuery.data?.data ?? [];

  const outsideStudents = useMemo(
    () =>
      leaves
        .filter((leave) => leave.gatePass?.status === "OUT")
        .map((leave) => ({
          id: leave.id,
          name: leave.student.name,
          studentId: leave.student.student_id,
          room: leave.student.room_number,
          outTime: leave.gatePass?.out_time_actual ?? leave.out_time,
          expectedReturn: leave.return_time,
          studentLat: leave.student_lat,
          studentLng: leave.student_lng,
          guardLat: leave.gatePass?.out_guard_lat,
          guardLng: leave.gatePass?.out_guard_lng,
        })),
    [leaves],
  );

  return (
    <>
      <PageHeader title="Students currently outside" description="Live view of all students who haven't returned yet." />
      <Card>
        <CardContent className="p-4">
          <div className="overflow-x-auto rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Out Time</TableHead>
                  <TableHead>Expected Return</TableHead>
                  <TableHead>Request Location</TableHead>
                  <TableHead>Exit Location</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outsideStudents.map((student) => (
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
                    <TableCell>
                      {new Date(student.outTime).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      {new Date(student.expectedReturn).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      {student.studentLat && student.studentLng ? (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${student.studentLat},${student.studentLng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline font-mono"
                        >
                          📍 {student.studentLat.toFixed(4)}, {student.studentLng.toFixed(4)}
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {student.guardLat && student.guardLng ? (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${student.guardLat},${student.guardLng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-emerald-600 hover:underline font-mono"
                        >
                          📍 {student.guardLat.toFixed(4)}, {student.guardLng.toFixed(4)}
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell><Badge className="bg-warning/20 text-warning-foreground dark:text-warning hover:bg-warning/20">Outside</Badge></TableCell>
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
