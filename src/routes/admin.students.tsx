import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, Pencil, Trash2, Eye } from "lucide-react";
import { PageHeader } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { students as seed, type Student } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/students")({
  head: () => ({ meta: [{ title: "Students · HostelOS" }] }),
  component: StudentsPage,
});

function StudentsPage() {
  const [list, setList] = useState<Student[]>(seed);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Student | null>(null);
  const filtered = list.filter(s =>
    s.name.toLowerCase().includes(q.toLowerCase()) || s.id.toLowerCase().includes(q.toLowerCase()) || s.room.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <>
      <PageHeader title="Students" description="Manage student records, profiles and rooms." action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> Add Student</Button></DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add new student</DialogTitle>
              <DialogDescription>Create a new student profile.</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const s: Student = {
                id: String(f.get("id") || `STU${Date.now()}`),
                roll: String(f.get("roll") || ""),
                name: String(f.get("name") || ""),
                mobile: String(f.get("mobile") || ""),
                parentMobile: String(f.get("parentMobile") || ""),
                room: String(f.get("room") || ""),
                course: String(f.get("course") || ""),
                joinDate: new Date().toISOString().slice(0, 10),
                status: "in",
              };
              setList([s, ...list]); setOpen(false); toast.success("Student added");
            }} className="grid gap-4 md:grid-cols-2">
              <F name="id" label="Student ID" /><F name="roll" label="Roll Number" />
              <F name="name" label="Full Name" required /><F name="room" label="Room Number" required />
              <F name="mobile" label="Mobile Number" /><F name="parentMobile" label="Parent Mobile" />
              <div className="md:col-span-2"><F name="course" label="Course / Class" /></div>
              <DialogFooter className="md:col-span-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit">Save Student</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      } />

      <Card>
        <CardContent className="p-4">
          <div className="mb-4 relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name, ID, room…" value={q} onChange={e => setQ(e.target.value)} className="pl-9" />
          </div>

          <div className="overflow-x-auto rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(s => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9"><AvatarFallback className="bg-accent text-accent-foreground text-xs">{s.name.split(" ").map(p => p[0]).slice(0,2).join("")}</AvatarFallback></Avatar>
                        <div><div className="font-medium">{s.name}</div><div className="text-xs text-muted-foreground">{s.id}</div></div>
                      </div>
                    </TableCell>
                    <TableCell>{s.roll}</TableCell>
                    <TableCell>{s.room}</TableCell>
                    <TableCell>{s.course}</TableCell>
                    <TableCell className="font-mono text-xs">{s.mobile}</TableCell>
                    <TableCell>
                      <Badge className={s.status === "in" ? "bg-success text-success-foreground hover:bg-success" : "bg-warning/20 text-warning-foreground dark:text-warning hover:bg-warning/20"}>
                        {s.status === "in" ? "In Hostel" : "Outside"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => setView(s)}><Eye className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost"><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => { setList(list.filter(x => x.id !== s.id)); toast.success("Student deleted"); }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!view} onOpenChange={() => setView(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Student profile</DialogTitle></DialogHeader>
          {view && (
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16"><AvatarFallback className="bg-primary text-primary-foreground">{view.name.split(" ").map(p=>p[0]).slice(0,2).join("")}</AvatarFallback></Avatar>
                <div><div className="text-lg font-semibold">{view.name}</div><div className="text-sm text-muted-foreground">{view.id} · {view.roll}</div></div>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <Info k="Room" v={view.room} /><Info k="Course" v={view.course} />
                <Info k="Mobile" v={view.mobile} /><Info k="Parent" v={view.parentMobile} />
                <Info k="Joined" v={view.joinDate} /><Info k="Status" v={view.status === "in" ? "In Hostel" : "Outside"} />
              </dl>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function F({ name, label, type = "text", required }: { name: string; label: string; type?: string; required?: boolean }) {
  return <div className="grid gap-1.5"><Label htmlFor={name}>{label}</Label><Input id={name} name={name} type={type} required={required} /></div>;
}
function Info({ k, v }: { k: string; v: string }) {
  return <div className="rounded-md border border-border/60 bg-muted/30 p-3"><dt className="text-xs text-muted-foreground">{k}</dt><dd className="mt-0.5 font-medium">{v}</dd></div>;
}
