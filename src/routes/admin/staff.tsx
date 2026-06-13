import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, UserCog } from "lucide-react";
import { PageHeader } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createStaff, getHostelStaff, updateStaff } from "@/lib/api";
import { toast } from "sonner";

type StaffRow = {
  id: string;
  role: string;
  name: string;
  email: string;
  created_at: string;
};

export const Route = createFileRoute("/admin/staff")({
  head: () => ({ meta: [{ title: "Staff · HostelOS" }] }),
  component: StaffPage,
});

function StaffPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffRow | null>(null);

  const staffQuery = useQuery({ queryKey: ["hostel-staff"], queryFn: getHostelStaff });
  const list = useMemo(() => staffQuery.data?.data ?? [], [staffQuery.data]);

  const createMutation = useMutation({
    mutationFn: createStaff,
    onSuccess: async () => {
      toast.success("Staff added");
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["hostel-staff"] });
      await queryClient.invalidateQueries({ queryKey: ["hostel-dashboard"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to add staff"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...payload }: { id: string; role: "HOSTEL_ADMIN" | "SECURITY_GUARD" | "HOSTEL_STAFF"; name: string; email: string; password?: string }) =>
      updateStaff(id, payload),
    onSuccess: async () => {
      toast.success("Staff updated");
      setOpen(false);
      setEditingStaff(null);
      await queryClient.invalidateQueries({ queryKey: ["hostel-staff"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update staff"),
  });

  return (
    <>
      <PageHeader
        title="Staff"
        description="Manage hostel staff members."
        action={
          <Dialog
            open={open}
            onOpenChange={(val) => {
              setOpen(val);
              if (!val) setEditingStaff(null);
            }}
          >
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4" /> Add Staff</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingStaff ? "Edit staff member" : "Add staff member"}</DialogTitle></DialogHeader>
              <form
                key={editingStaff ? editingStaff.id : "new"}
                className="grid gap-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = new FormData(event.currentTarget);
                  const payload = {
                    role: String(form.get("role")) as "HOSTEL_ADMIN" | "SECURITY_GUARD" | "HOSTEL_STAFF",
                    name: String(form.get("name")),
                    email: String(form.get("email")),
                    password: String(form.get("password") ?? "") || undefined,
                  };
                  if (editingStaff) {
                    updateMutation.mutate({ id: editingStaff.id, ...payload });
                  } else {
                    createMutation.mutate(payload);
                  }
                }}
              >
                <Field name="name" label="Name" defaultValue={editingStaff?.name} required />
                <Field name="role" label="Role" asSelect defaultValue={editingStaff?.role} helper="Choose hostel admin, guard or hostel staff." />
                <Field name="email" label="Email" type="email" defaultValue={editingStaff?.email} required />
                <Field name="password" label="Password" type="password" helper={editingStaff ? "Leave blank to keep current password." : "Leave blank to use the default reset password."} />
                <DialogFooter><Button type="submit">{editingStaff ? "Save changes" : "Save"}</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <Card>
        <CardContent className="p-4">
          <div className="overflow-x-auto rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                            {staff.name
                              .split(" ")
                              .map((part) => part[0])
                              .slice(0, 2)
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{staff.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{staff.role.toLowerCase().replaceAll("_", " ")}</TableCell>
                    <TableCell className="text-xs">{staff.email}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingStaff(staff);
                          setOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
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

function Field({
  name,
  label,
  type = "text",
  required,
  helper,
  asSelect,
  defaultValue,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  helper?: string;
  asSelect?: boolean;
  defaultValue?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      {asSelect ? (
        <select id={name} name={name} required defaultValue={defaultValue} className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="HOSTEL_ADMIN">Hostel Admin</option>
          <option value="SECURITY_GUARD">Security Guard</option>
          <option value="HOSTEL_STAFF">Hostel Staff</option>
        </select>
      ) : (
        <Input id={name} name={name} type={type} required={required} defaultValue={defaultValue} />
      )}
      {helper ? <p className="text-xs text-muted-foreground">{helper}</p> : null}
    </div>
  );
}
