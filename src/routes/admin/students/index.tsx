import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Eye, Upload } from "lucide-react";
import { PageHeader } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { createStudent, getHostelStudents, uploadStudentPhoto, getHostels, updateStudent } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type StudentRow = {
  id: string;
  student_id: string;
  name: string;
  room_number: string;
  mobile: string;
  parent_mobile: string;
  profile_photo: string | null;
  status: string;
  created_at: string;
  hostel_id?: string;
  hostel_name?: string;
};

export const Route = createFileRoute("/admin/students/")({
  head: () => ({ meta: [{ title: "Students · HostelOS" }] }),
  component: StudentsPage,
});

function StudentsPage() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<StudentRow | null>(null);
  const [editingStudent, setEditingStudent] = useState<StudentRow | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [selectedHostel, setSelectedHostel] = useState("");
  const [hostelFilter, setHostelFilter] = useState("ALL");

  const studentsQuery = useQuery({ queryKey: ["hostel-students"], queryFn: getHostelStudents });
  const hostelsQuery = useQuery({ queryKey: ["active-hostels"], queryFn: getHostels });
  const hostels = hostelsQuery.data?.data ?? [];

  const list = useMemo(() => (studentsQuery.data?.data ?? []) as StudentRow[], [studentsQuery.data]);
  const filtered = useMemo(() => {
    return list.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(q.toLowerCase()) ||
        student.student_id.toLowerCase().includes(q.toLowerCase()) ||
        student.room_number.toLowerCase().includes(q.toLowerCase());
      const matchesHostel = hostelFilter === "ALL" || student.hostel_id === hostelFilter;
      return matchesSearch && matchesHostel;
    });
  }, [list, q, hostelFilter]);

  const createMutation = useMutation({
    mutationFn: createStudent,
    onSuccess: async () => {
      toast.success("Student added");
      setOpen(false);
      setSelectedHostel("");
      await queryClient.invalidateQueries({ queryKey: ["hostel-students"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to add student"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ studentId, payload }: { studentId: string; payload: Parameters<typeof updateStudent>[1] }) =>
      updateStudent(studentId, payload),
    onSuccess: async () => {
      toast.success("Student updated");
      setEditingStudent(null);
      setSelectedHostel("");
      await queryClient.invalidateQueries({ queryKey: ["hostel-students"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update student"),
  });

  const photoMutation = useMutation({
    mutationFn: ({ studentId, file }: { studentId: string; file: File }) => uploadStudentPhoto(studentId, file),
    onSuccess: async () => {
      toast.success("Student photo uploaded");
      setPhotoFile(null);
      await queryClient.invalidateQueries({ queryKey: ["hostel-students"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to upload photo"),
  });

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSelectedHostel("");
    }
  };

  return (
    <>
      <PageHeader
        title="Students"
        description="Manage student records and profiles."
        action={
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4" /> Add Student</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add new student</DialogTitle>
                <DialogDescription>Create a new student profile.</DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!selectedHostel) {
                    toast.error("Hostel is required");
                    return;
                  }
                  const form = new FormData(event.currentTarget);
                  createMutation.mutate({
                    student_id: String(form.get("student_id") ?? ""),
                    name: String(form.get("name") ?? ""),
                    room_number: String(form.get("room_number") ?? ""),
                    mobile: String(form.get("mobile") ?? ""),
                    parent_mobile: String(form.get("parent_mobile") ?? ""),
                    password: String(form.get("password") ?? "") || undefined,
                    hostel_id: selectedHostel,
                  });
                }}
                className="grid gap-4 md:grid-cols-2"
              >
                <Field name="student_id" label="Student ID" required />
                <Field name="name" label="Full Name" required />
                <Field name="room_number" label="Room Number" required />
                <Field name="mobile" label="Mobile Number" required />
                <div className="md:col-span-2">
                  <Field name="parent_mobile" label="Parent Mobile" required />
                </div>
                <div className="md:col-span-2">
                  <div className="grid gap-1.5">
                    <Label htmlFor="hostel_id">Hostel</Label>
                    <Select value={selectedHostel} onValueChange={setSelectedHostel}>
                      <SelectTrigger id="hostel_id">
                        <SelectValue placeholder="Select a hostel" />
                      </SelectTrigger>
                      <SelectContent>
                        {hostels.map((hostel) => (
                          <SelectItem key={hostel.id} value={hostel.id}>
                            {hostel.hostel_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Field name="password" label="Password" type="password" helper="Leave blank to use the default reset password." />
                </div>
                <DialogFooter className="md:col-span-2">
                  <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>Cancel</Button>
                  <Button type="submit">Save Student</Button>
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
              <Input placeholder="Search by name, ID, room…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
            </div>
            <select
              value={hostelFilter}
              onChange={(e) => setHostelFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="ALL">All Hostels</option>
              {hostels.map((hostel) => (
                <option key={hostel.id} value={hostel.id}>
                  {hostel.hostel_name}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Hostel</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Parent Mobile</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          {student.profile_photo && <AvatarImage src={student.profile_photo} alt={student.name} className="object-cover" />}
                          <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                            {student.name
                              .split(" ")
                              .map((part) => part[0])
                              .slice(0, 2)
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-xs text-muted-foreground">{student.student_id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{student.hostel_name || "N/A"}</TableCell>
                    <TableCell>{student.room_number}</TableCell>
                    <TableCell className="font-mono text-xs">{student.parent_mobile}</TableCell>
                    <TableCell className="font-mono text-xs">{student.mobile}</TableCell>
                    <TableCell>
                      <Badge className={student.status === "ACTIVE" ? "bg-success text-success-foreground hover:bg-success" : "bg-warning/20 text-warning-foreground dark:text-warning hover:bg-warning/20"}>
                        {student.status === "ACTIVE" ? "In Hostel" : "Disabled"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => setView(student)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setEditingStudent(student);
                            setSelectedHostel(student.hostel_id ?? "");
                          }}
                        >
                          <Pencil className="h-4 w-4" />
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
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Student profile</DialogTitle>
          </DialogHeader>
          {view ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  {view.profile_photo && <AvatarImage src={view.profile_photo} alt={view.name} className="object-cover" />}
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {view.name
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-lg font-semibold">{view.name}</div>
                  <div className="text-sm text-muted-foreground">{view.student_id}</div>
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-3 text-sm">
                <Info k="Hostel" v={view.hostel_name || "N/A"} />
                <Info k="Room" v={view.room_number} />
                <Info k="Mobile" v={view.mobile} />
                <Info k="Parent" v={view.parent_mobile} />
                <Info k="Status" v={view.status} />
              </dl>

              <div className="grid gap-2 rounded-xl border border-border/60 p-4">
                <Label htmlFor="photo">Upload profile photo</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
                />
                <Button
                  type="button"
                  className="w-fit"
                  disabled={!photoFile || photoMutation.isPending}
                  onClick={() => {
                    if (!view || !photoFile) return;
                    photoMutation.mutate({ studentId: view.id, file: photoFile });
                  }}
                >
                  <Upload className="h-4 w-4" />
                  Upload photo
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit student</DialogTitle>
            <DialogDescription>Update student profile and details.</DialogDescription>
          </DialogHeader>
          {editingStudent ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (!selectedHostel) {
                  toast.error("Hostel is required");
                  return;
                }
                const form = new FormData(event.currentTarget);
                updateMutation.mutate({
                  studentId: editingStudent.id,
                  payload: {
                    student_id: String(form.get("student_id") ?? ""),
                    name: String(form.get("name") ?? ""),
                    room_number: String(form.get("room_number") ?? ""),
                    mobile: String(form.get("mobile") ?? ""),
                    parent_mobile: String(form.get("parent_mobile") ?? ""),
                    password: String(form.get("password") ?? "") || undefined,
                    status: String(form.get("status") ?? ""),
                    hostel_id: selectedHostel,
                  },
                });
              }}
              className="grid gap-4 md:grid-cols-2"
            >
              <Field name="student_id" label="Student ID" defaultValue={editingStudent.student_id} required />
              <Field name="name" label="Full Name" defaultValue={editingStudent.name} required />
              <Field name="room_number" label="Room Number" defaultValue={editingStudent.room_number} required />
              <Field name="mobile" label="Mobile Number" defaultValue={editingStudent.mobile} required />
              <div className="md:col-span-2">
                <Field name="parent_mobile" label="Parent Mobile" defaultValue={editingStudent.parent_mobile} required />
              </div>
              <div className="md:col-span-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="hostel_id">Hostel</Label>
                  <Select value={selectedHostel} onValueChange={setSelectedHostel}>
                    <SelectTrigger id="hostel_id">
                      <SelectValue placeholder="Select a hostel" />
                    </SelectTrigger>
                    <SelectContent>
                      {hostels.map((hostel) => (
                        <SelectItem key={hostel.id} value={hostel.id}>
                          {hostel.hostel_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="status">Status</Label>
                <select id="status" name="status" defaultValue={editingStudent.status} className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="DISABLED">DISABLED</option>
                </select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="password">Password (Optional)</Label>
                <Input id="password" name="password" type="password" />
                <p className="text-xs text-muted-foreground">Leave blank to keep current password.</p>
              </div>
              <DialogFooter className="md:col-span-2">
                <Button type="button" variant="ghost" onClick={() => setEditingStudent(null)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  defaultValue,
  helper,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  helper?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} required={required} defaultValue={defaultValue} />
      {helper ? <p className="text-xs text-muted-foreground">{helper}</p> : null}
    </div>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-md border border-border/60 bg-muted/30 p-3">
      <dt className="text-xs text-muted-foreground">{k}</dt>
      <dd className="mt-0.5 font-medium">{v}</dd>
    </div>
  );
}
