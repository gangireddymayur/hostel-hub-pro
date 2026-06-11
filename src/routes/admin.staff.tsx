import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { staff as seed, type Staff } from "@/lib/mock-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/staff")({
  head: () => ({ meta: [{ title: "Staff · HostelOS" }] }),
  component: StaffPage,
});

function StaffPage() {
  const [list, setList] = useState<Staff[]>(seed);
  const [open, setOpen] = useState(false);
  return (
    <>
      <PageHeader title="Staff" description="Manage hostel staff members." action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> Add Staff</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add staff member</DialogTitle></DialogHeader>
            <form className="grid gap-4" onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              setList([{ id: `S${list.length+1}`, name: String(f.get("name")), role: String(f.get("role")), mobile: String(f.get("mobile")), email: String(f.get("email")) }, ...list]);
              setOpen(false); toast.success("Staff added");
            }}>
              <div className="grid gap-1.5"><Label>Name</Label><Input name="name" required /></div>
              <div className="grid gap-1.5"><Label>Role</Label><Input name="role" required /></div>
              <div className="grid gap-1.5"><Label>Mobile</Label><Input name="mobile" /></div>
              <div className="grid gap-1.5"><Label>Email</Label><Input name="email" type="email" /></div>
              <DialogFooter><Button type="submit">Save</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      } />
      <Card><CardContent className="p-4">
        <div className="overflow-x-auto rounded-lg border border-border/60">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead>Mobile</TableHead><TableHead>Email</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {list.map(s => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8"><AvatarFallback className="bg-accent text-accent-foreground text-xs">{s.name.split(" ").map(p=>p[0]).slice(0,2).join("")}</AvatarFallback></Avatar>
                      <span className="font-medium">{s.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{s.role}</TableCell>
                  <TableCell className="font-mono text-xs">{s.mobile}</TableCell>
                  <TableCell className="text-xs">{s.email}</TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost"><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => { setList(list.filter(x => x.id !== s.id)); toast.success("Deleted"); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent></Card>
    </>
  );
}
