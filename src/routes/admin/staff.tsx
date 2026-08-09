import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createStaff, getHostelStaff, updateStaff, getHostels, uploadStaffPhoto, deleteStaff } from "@/lib/api";
import { toast } from "sonner";

type StaffRow = {
  id: string;
  role: string;
  name: string;
  email: string;
  created_at: string;
  profile_photo?: string | null;
  hostel_id?: string;
  hostel_name?: string;
};

export const Route = createFileRoute("/admin/staff")({
  head: () => ({ meta: [{ title: "Staff · HostelOS" }] }),
  component: StaffPage,
});

function StaffPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffRow | null>(null);
  const [selectedHostel, setSelectedHostel] = useState("");
  const [selectedRole, setSelectedRole] = useState("HOSTEL_STAFF");
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [hostelFilter, setHostelFilter] = useState("ALL");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const staffQuery = useQuery({ queryKey: ["hostel-staff"], queryFn: getHostelStaff });
  const hostelsQuery = useQuery({ queryKey: ["active-hostels"], queryFn: getHostels });
  const list = useMemo(() => (staffQuery.data?.data ?? []) as StaffRow[], [staffQuery.data]);
  const hostels = hostelsQuery.data?.data ?? [];

  // Whether to show the hostel picker:
  // - HOSTEL_ADMIN is auto-assigned to the hostel their email belongs to (set server-side)
  // - HOSTEL_STAFF / SECURITY_GUARD need explicit hostel assignment / re-assignment
  const showHostelPicker = selectedRole !== "HOSTEL_ADMIN";

  const photoMutation = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => uploadStaffPhoto(id, file),
    onSuccess: async () => {
      toast.success("Staff photo uploaded");
      setPhotoFile(null);
      await queryClient.invalidateQueries({ queryKey: ["hostel-staff"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to upload photo"),
  });

  const filtered = useMemo(() => {
    return list.filter((staff) => {
      const matchesSearch =
        staff.name.toLowerCase().includes(q.toLowerCase()) ||
        staff.email.toLowerCase().includes(q.toLowerCase());
      const matchesRole = roleFilter === "ALL" || staff.role === roleFilter;
      const matchesHostel = hostelFilter === "ALL" || staff.hostel_id === hostelFilter;
      return matchesSearch && matchesRole && matchesHostel;
    });
  }, [list, q, roleFilter, hostelFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, page]);

  const resetDialog = () => {
    setEditingStaff(null);
    setSelectedHostel("");
    setSelectedRole("HOSTEL_STAFF");
    setPhotoFile(null);
  };

  const createMutation = useMutation({
    mutationFn: createStaff,
    onSuccess: async () => {
      toast.success("Staff added");
      setOpen(false);
      resetDialog();
      await queryClient.invalidateQueries({ queryKey: ["hostel-staff"] });
      await queryClient.invalidateQueries({ queryKey: ["hostel-dashboard"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to add staff"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...payload }: { id: string; role: "HOSTEL_ADMIN" | "SECURITY_GUARD" | "HOSTEL_STAFF"; name: string; email: string; password?: string; hostel_id?: string }) =>
      updateStaff(id, payload),
    onSuccess: async () => {
      toast.success("Staff updated");
      setOpen(false);
      resetDialog();
      await queryClient.invalidateQueries({ queryKey: ["hostel-staff"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update staff"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStaff,
    onSuccess: async () => {
      toast.success("Staff member deleted successfully");
      setOpen(false);
      resetDialog();
      await queryClient.invalidateQueries({ queryKey: ["hostel-staff"] });
      await queryClient.invalidateQueries({ queryKey: ["hostel-dashboard"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to delete staff member"),
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
              if (!val) resetDialog();
            }}
          >
            <DialogTrigger asChild>
              <Button onClick={() => { resetDialog(); setOpen(true); }}><Plus className="h-4 w-4" /> Add Staff</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingStaff ? "Edit staff member" : "Add staff member"}</DialogTitle></DialogHeader>
              <form
                key={editingStaff ? editingStaff.id : "new"}
                className="grid gap-4"
                onSubmit={(event) => {
                  event.preventDefault();

                  // Hostel is required only when role is NOT HOSTEL_ADMIN
                  if (selectedRole !== "HOSTEL_ADMIN" && !selectedHostel) {
                    toast.error("Please select a hostel for this staff member");
                    return;
                  }

                  const form = new FormData(event.currentTarget);
                  const payload = {
                    role: selectedRole as "HOSTEL_ADMIN" | "SECURITY_GUARD" | "HOSTEL_STAFF",
                    name: String(form.get("name")),
                    email: String(form.get("email")),
                    password: String(form.get("password") ?? "") || undefined,
                    // For HOSTEL_ADMIN the server assigns their hostel automatically from their email
                    hostel_id: selectedRole !== "HOSTEL_ADMIN" ? selectedHostel : undefined,
                  };
                  if (editingStaff) {
                    updateMutation.mutate({ id: editingStaff.id, ...payload });
                  } else {
                    createMutation.mutate(payload);
                  }
                }}
              >
                <Field name="name" label="Name" defaultValue={editingStaff?.name} required />

                {/* Role selector — controlled so we can show/hide hostel picker */}
                <div className="grid gap-1.5">
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    name="role"
                    value={selectedRole}
                    onChange={(e) => {
                      setSelectedRole(e.target.value);
                      // Clear hostel selection when switching to HOSTEL_ADMIN (not needed)
                      if (e.target.value === "HOSTEL_ADMIN") setSelectedHostel("");
                    }}
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="HOSTEL_ADMIN">Hostel Admin</option>
                    <option value="SECURITY_GUARD">Security Guard</option>
                    <option value="HOSTEL_STAFF">Hostel Staff</option>
                  </select>
                  <p className="text-xs text-muted-foreground">
                    {selectedRole === "HOSTEL_ADMIN"
                      ? "Hostel Admin gets automatic access to all their hostels — no hostel selection needed."
                      : "Choose which hostel this staff member belongs to."}
                  </p>
                </div>

                {/* Hostel picker — only shown for HOSTEL_STAFF and SECURITY_GUARD */}
                {showHostelPicker && (
                  <div className="grid gap-1.5">
                    <Label htmlFor="hostel_select">Hostel Access</Label>
                    <select
                      id="hostel_select"
                      value={selectedHostel}
                      onChange={(e) => setSelectedHostel(e.target.value)}
                      required
                      className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select a hostel</option>
                      {hostels.length > 0 && (
                        <option value={`${hostels[0]?.id}_ALL`}>🏢 All Hostels (all branches)</option>
                      )}
                      {hostels.map((hostel) => (
                        <option key={hostel.id} value={hostel.id}>
                          {hostel.hostel_name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground">
                      {selectedHostel?.endsWith("_ALL")
                        ? "⚠️ All Hostels: this staff member can see students from ALL branches."
                        : "You can reassign this staff member to any hostel you manage."}
                    </p>
                  </div>
                )}

                <Field name="email" label="Email" type="email" defaultValue={editingStaff?.email} required />

                {editingStaff && (
                  <div className="grid gap-2 rounded-xl border border-border/60 p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        {editingStaff.profile_photo && <AvatarImage src={editingStaff.profile_photo} alt={editingStaff.name} className="object-cover" />}
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {editingStaff.name
                            .split(" ")
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Label htmlFor="photo" className="text-xs font-medium">Upload profile photo</Label>
                        <Input
                          id="photo"
                          type="file"
                          accept="image/*"
                          className="mt-1 h-9 text-xs"
                          onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      className="w-fit"
                      disabled={!photoFile || photoMutation.isPending}
                      onClick={() => {
                        if (!editingStaff || !photoFile) return;
                        photoMutation.mutate({ id: editingStaff.id, file: photoFile });
                      }}
                    >
                      Upload photo
                    </Button>
                  </div>
                )}

                <Field name="password" label="Password" type="password" helper={editingStaff ? "Leave blank to keep current password." : "Leave blank to use the default reset password."} />
                <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-2">
                  {editingStaff ? (
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete staff member ${editingStaff.name}? This action cannot be undone.`)) {
                          deleteMutation.mutate(editingStaff.id);
                        }
                      }}
                    >
                      Delete Staff
                    </Button>
                  ) : <div />}
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingStaff ? "Save changes" : "Save"}
                  </Button>
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
              <Input
                placeholder="Search staff by name, email…"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="ALL">All Roles</option>
              <option value="HOSTEL_ADMIN">Hostel Admin</option>
              <option value="SECURITY_GUARD">Security Guard</option>
              <option value="HOSTEL_STAFF">Hostel Staff</option>
            </select>
            <select
              value={hostelFilter}
              onChange={(e) => {
                setHostelFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="ALL">All Hostels</option>
              {hostels.map((hostel) => (
                <option key={hostel.id} value={hostel.id}>
                  {hostel.hostel_name}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border/60 bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Hostel</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground font-medium">
                      No staff records found.
                    </TableCell>
                  </TableRow>
                ) : paginated.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          {staff.profile_photo && <AvatarImage src={staff.profile_photo} alt={staff.name} className="object-cover" />}
                          <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
                            {staff.name
                              .split(" ")
                              .map((part) => part[0])
                              .slice(0, 2)
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-foreground">{staff.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{staff.role.toLowerCase().replaceAll("_", " ")}</TableCell>
                    <TableCell className="font-medium">
                      {staff.role === "HOSTEL_ADMIN" || staff.hostel_id?.endsWith("_ALL") ? (
                        <span className="text-xs text-muted-foreground italic">All hostels</span>
                      ) : (
                        staff.hostel_name || "N/A"
                      )}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-muted-foreground">{staff.email}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingStaff(staff);
                          setSelectedRole(staff.role || "HOSTEL_STAFF");
                          setSelectedHostel(staff.role === "HOSTEL_ADMIN" ? "" : (staff.hostel_id ?? ""));
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

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-4">
              <p className="text-xs text-muted-foreground">
                Showing <strong className="text-foreground">{(page - 1) * itemsPerPage + 1}</strong> to{" "}
                <strong className="text-foreground">
                  {Math.min(page * itemsPerPage, filtered.length)}
                </strong>{" "}
                of <strong className="text-foreground">{filtered.length}</strong> staff members
              </p>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="h-8 text-xs font-semibold"
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <Button
                      key={pNum}
                      variant={page === pNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(pNum)}
                      className="h-8 w-8 text-xs font-semibold p-0"
                    >
                      {pNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="h-8 text-xs font-semibold"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
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
  defaultValue,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  helper?: string;
  defaultValue?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} required={required} defaultValue={defaultValue} />
      {helper ? <p className="text-xs text-muted-foreground">{helper}</p> : null}
    </div>
  );
}
