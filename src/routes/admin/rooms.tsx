import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageHeader } from "@/components/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { getHostelStudents } from "@/lib/api";

export const Route = createFileRoute("/admin/rooms")({
  head: () => ({ meta: [{ title: "Rooms · HostelOS" }] }),
  component: RoomsPage,
});

function RoomsPage() {
  const studentsQuery = useQuery({ queryKey: ["hostel-students"], queryFn: getHostelStudents });
  const students = studentsQuery.data?.data ?? [];

  const rooms = useMemo(() => {
    const grouped = new Map<string, number>();
    for (const student of students) {
      grouped.set(student.room_number, (grouped.get(student.room_number) ?? 0) + 1);
    }
    return Array.from(grouped.entries()).map(([number, occupied]) => ({
      number,
      capacity: 4,
      occupied,
    }));
  }, [students]);

  return (
    <>
      <PageHeader title="Rooms" description="Room allocation is derived from student records in the backend." />

      <Card>
        <CardContent className="p-4">
          <div className="overflow-x-auto rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Occupied</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Occupancy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.map((room) => {
                  const available = room.capacity - room.occupied;
                  const pct = Math.round((room.occupied / room.capacity) * 100);
                  return (
                    <TableRow key={room.number}>
                      <TableCell className="font-medium">{room.number}</TableCell>
                      <TableCell>{room.capacity}</TableCell>
                      <TableCell>{room.occupied}</TableCell>
                      <TableCell>{available}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                          </div>
                          <Badge variant="outline" className="text-[10px]">{pct}%</Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
