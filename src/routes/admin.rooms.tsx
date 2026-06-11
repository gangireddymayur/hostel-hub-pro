import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { rooms as seed, type Room } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/rooms")({
  head: () => ({ meta: [{ title: "Rooms · HostelOS" }] }),
  component: RoomsPage,
});

function RoomsPage() {
  const [list, setList] = useState<Room[]>(seed);
  const [open, setOpen] = useState(false);

  return (
    <>
      <PageHeader title="Rooms" description="Manage rooms, capacity and occupancy." action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> Add Room</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add room</DialogTitle></DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              setList([{ number: String(f.get("number")), capacity: Number(f.get("capacity")), occupied: 0 }, ...list]);
              setOpen(false); toast.success("Room added");
            }} className="grid gap-4">
              <div className="grid gap-1.5"><Label>Room Number</Label><Input name="number" required /></div>
              <div className="grid gap-1.5"><Label>Capacity</Label><Input name="capacity" type="number" min={1} defaultValue={4} required /></div>
              <DialogFooter><Button type="submit">Add Room</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      } />

      <Card>
        <CardContent className="p-4">
          <div className="overflow-x-auto rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                <TableRow><TableHead>Room</TableHead><TableHead>Capacity</TableHead><TableHead>Occupied</TableHead><TableHead>Available</TableHead><TableHead>Occupancy</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {list.map(r => {
                  const avail = r.capacity - r.occupied;
                  const pct = Math.round((r.occupied / r.capacity) * 100);
                  return (
                    <TableRow key={r.number}>
                      <TableCell className="font-medium">{r.number}</TableCell>
                      <TableCell>{r.capacity}</TableCell>
                      <TableCell>{r.occupied}</TableCell>
                      <TableCell>{avail}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                          </div>
                          <Badge variant="outline" className="text-[10px]">{pct}%</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="icon" variant="ghost"><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => { setList(list.filter(x => x.number !== r.number)); toast.success("Room deleted"); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
