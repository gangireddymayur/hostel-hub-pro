import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, Pencil, Trash2, Ban, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { hostels as seed, type Hostel } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/super/hostels")({
  head: () => ({ meta: [{ title: "Hostel Management · HostelOS" }] }),
  component: HostelsPage,
});

function HostelsPage() {
  const [list, setList] = useState<Hostel[]>(seed);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const filtered = list.filter(h => h.name.toLowerCase().includes(q.toLowerCase()) || h.email.toLowerCase().includes(q.toLowerCase()));

  const addHostel = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const h: Hostel = {
      id: `H${String(list.length + 1).padStart(3, "0")}`,
      name: String(f.get("name") || ""), address: String(f.get("address") || ""),
      phone: String(f.get("phone") || ""), email: String(f.get("email") || ""),
      adminName: String(f.get("adminName") || ""), adminEmail: String(f.get("adminEmail") || ""),
      students: 0, rooms: 0, status: "active", subscription: "trial",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setList([h, ...list]); setOpen(false); toast.success("Hostel created");
  };

  const toggle = (id: string) => setList(list.map(h => h.id === id ? { ...h, status: h.status === "active" ? "disabled" : "active" } : h));
  const remove = (id: string) => { setList(list.filter(h => h.id !== id)); toast.success("Hostel deleted"); };

  return (
    <>
      <PageHeader
        title="Hostel management"
        description="Create, edit and manage all hostels on the platform."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4" /> Create Hostel</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create new hostel</DialogTitle>
                <DialogDescription>Provision a new hostel workspace and admin account.</DialogDescription>
              </DialogHeader>
              <form onSubmit={addHostel} className="grid gap-4 md:grid-cols-2">
                <Field name="name" label="Hostel Name" required />
                <Field name="email" label="Hostel Email" type="email" required />
                <Field name="phone" label="Phone Number" required />
                <Field name="logo" label="Logo URL" />
                <div className="md:col-span-2"><Field name="address" label="Address" required /></div>
                <div className="md:col-span-2 mt-2 border-t border-border pt-3">
                  <p className="text-sm font-medium">Admin account</p>
                </div>
                <Field name="adminName" label="Admin Name" required />
                <Field name="adminEmail" label="Admin Email" type="email" required />
                <div className="md:col-span-2"><Field name="adminPassword" label="Admin Password" type="password" required /></div>
                <DialogFooter className="md:col-span-2">
                  <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit">Create Hostel</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardContent className="p-4">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="relative max-w-sm flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search hostels…" value={q} onChange={e => setQ(e.target.value)} className="pl-9" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hostel</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(h => (
                  <TableRow key={h.id}>
                    <TableCell>
                      <div className="font-medium">{h.name}</div>
                      <div className="text-xs text-muted-foreground">{h.email}</div>
                    </TableCell>
                    <TableCell>
                      <div>{h.adminName}</div>
                      <div className="text-xs text-muted-foreground">{h.adminEmail}</div>
                    </TableCell>
                    <TableCell>{h.students}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{h.subscription}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={h.status === "active" ? "bg-success text-success-foreground hover:bg-success" : "bg-muted text-muted-foreground hover:bg-muted"}>
                        {h.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost"><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => toggle(h.id)}>
                          {h.status === "active" ? <Ban className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => remove(h.id)}>
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
    </>
  );
}

function Field({ name, label, type = "text", required }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} required={required} />
    </div>
  );
}
