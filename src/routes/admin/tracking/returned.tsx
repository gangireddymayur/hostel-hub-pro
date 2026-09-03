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
  head: () => ({ meta: [{ title: "Students Returned · GATEX" }] }),
  component: Page,
});

function Page() {
  const leaveQuery = useQuery({ queryKey: ["hostel-leaves"], queryFn: getLeaveRequests });
  const leaves = leaveQuery.data?.data ?? [];

  const returnedToday = useMemo(
    () =>
      leaves
        .filter((leave) => {
          const inTime = leave.gatePass?.in_time_actual;
          if (!inTime) return false;
          const returnDate = new Date(inTime);
          const today = new Date();
          return (
            returnDate.getFullYear() === today.getFullYear() &&
            returnDate.getMonth() === today.getMonth() &&
            returnDate.getDate() === today.getDate()
          );
        })
        .map((leave) => ({
          id: leave.id,
          name: leave.student.name,
          studentId: leave.student.student_id,
          room: leave.student.room_number,
          returnTime: leave.gatePass?.in_time_actual ?? leave.return_time,
          studentLat: leave.student_lat,
          studentLng: leave.student_lng,
          guardOutLat: leave.gatePass?.out_guard_lat,
          guardOutLng: leave.gatePass?.out_guard_lng,
          guardInLat: leave.gatePass?.in_guard_lat,
          guardInLng: leave.gatePass?.in_guard_lng,
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
                  <TableHead>Request Location</TableHead>
                  <TableHead>Exit Location</TableHead>
                  <TableHead>Entry Location</TableHead>
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
                    <TableCell>
                      {new Date(student.returnTime).toLocaleString([], {
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
                      {student.guardOutLat && student.guardOutLng ? (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${student.guardOutLat},${student.guardOutLng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-emerald-600 hover:underline font-mono"
                        >
                          📍 {student.guardOutLat.toFixed(4)}, {student.guardOutLng.toFixed(4)}
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {student.guardInLat && student.guardInLng ? (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${student.guardInLat},${student.guardInLng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-600 hover:underline font-mono"
                        >
                          📍 {student.guardInLat.toFixed(4)}, {student.guardInLng.toFixed(4)}
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
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
