import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { guards as seed, type Guard } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/guards")({
  head: () => ({ meta: [{ title: "Security Guards · HostelOS" }] }),
  component: GuardsPage,
});

function GuardsPage() {
  const [list, setList] = useState<Guard[]>(seed);
  const [open, setOpen] = useState(false);
  return (
    <>
      <PageHeader title="Security guards" description="Manage security guards with Android app access." action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> Add Guard</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add guard</DialogTitle></DialogHeader>
            <form className="grid gap-4" onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              setList([{ id: `G${list.length+1}`, name: String(f.get("name")), mobile: String(f.get("mobile")), email: String(f.get("email")) }, ...list]);
              setOpen(false); toast.success("Guard added");
            }}>
              <div className="grid gap-1.5"><Label>Name</Label><Input name="name" required /></div>
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
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Mobile</TableHead><TableHead>Email</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {list.map(g => (
                <TableRow key={g.id}>
                  <TableCell><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" />{g.name}</div></TableCell>
                  <TableCell className="font-mono text-xs">{g.mobile}</TableCell>
                  <TableCell className="text-xs">{g.email}</TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost"><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => { setList(list.filter(x => x.id !== g.id)); toast.success("Deleted"); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
