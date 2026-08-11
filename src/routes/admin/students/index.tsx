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
import { createStudent, getHostelStudents, uploadStudentPhoto, uploadParentPhoto, getHostels, updateStudent, deleteStudent } from "@/lib/api";
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
  parent_profile_photo?: string | null;
  status: string;
  created_at: string;
  student_year?: string | null;
  hostel_id?: string;
  hostel_name?: string;
};

export const Route = createFileRoute("/admin/students/")({
  head: () => ({ meta: [{ title: "Students · Hostel GATEX" }] }),
  component: StudentsPage,
});

function StudentsPage() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<StudentRow | null>(null);
  const [editingStudent, setEditingStudent] = useState<StudentRow | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [parentPhotoFile, setParentPhotoFile] = useState<File | null>(null);
  const [selectedHostel, setSelectedHostel] = useState("");
  const [hostelFilter, setHostelFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

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
      const matchesYear = yearFilter === "ALL" || student.student_year === yearFilter;
      return matchesSearch && matchesHostel && matchesYear;
    });
  }, [list, q, hostelFilter, yearFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, page]);

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

  const deleteMutation = useMutation({
    mutationFn: deleteStudent,
    onSuccess: async () => {
      toast.success("Student deleted successfully");
      setEditingStudent(null);
      await queryClient.invalidateQueries({ queryKey: ["hostel-students"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to delete student"),
  });

  const photoMutation = useMutation({
    mutationFn: ({ studentId, file }: { studentId: string; file: File }) => uploadStudentPhoto(studentId, file),
    onSuccess: async (resData: any) => {
      toast.success("Student photo uploaded");
      setPhotoFile(null);
      await queryClient.invalidateQueries({ queryKey: ["hostel-students"] });
      if (view) {
        setView((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            profile_photo: resData.data?.profile_photo ?? prev.profile_photo,
          };
        });
      }
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to upload photo"),
  });

  const parentPhotoMutation = useMutation({
    mutationFn: ({ studentId, file }: { studentId: string; file: File }) => uploadParentPhoto(studentId, file),
    onSuccess: async (resData: any) => {
      toast.success("Parent photo uploaded");
      setParentPhotoFile(null);
      await queryClient.invalidateQueries({ queryKey: ["hostel-students"] });
      if (view) {
        setView((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            parent_profile_photo: resData.data?.profile_photo ?? prev.parent_profile_photo,
          };
        });
      }
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
                    parent_password: String(form.get("parent_password") ?? "") || undefined,
                    hostel_id: selectedHostel,
                    student_year: String(form.get("student_year") ?? "") || null,
                  });
                }}
                className="grid gap-4 md:grid-cols-2"
              >
                <Field name="student_id" label="Student ID" required />
                <Field name="name" label="Full Name" required />
                <Field name="room_number" label="Room Number" required />
                <Field name="mobile" label="Mobile Number" required />
                <Field name="parent_mobile" label="Parent Mobile" required />
                <div className="grid gap-1.5">
                  <Label htmlFor="student_year">Student Year</Label>
                  <select
                    id="student_year"
                    name="student_year"
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select Year (Optional)</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
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
                <Field name="password" label="Student Password (Optional)" type="password" helper="Leave blank for default password." />
                <Field name="parent_password" label="Parent Password (Optional)" type="password" helper="Leave blank for default password." />
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
              <Input 
                placeholder="Search by name, ID, room…" 
                value={q} 
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }} 
                className="pl-9" 
              />
            </div>
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
            <select
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="ALL">All Years</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border/60 bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Hostel</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      No student records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            {student.profile_photo && <AvatarImage src={student.profile_photo} alt={student.name} className="object-cover" />}
                            <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
                              {student.name
                                .split(" ")
                                .map((part) => part[0])
                                .slice(0, 2)
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-foreground">{student.name}</div>
                            <div className="text-xs text-muted-foreground">{student.student_id} · {student.student_year || "N/A"}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{student.hostel_name || "N/A"}</TableCell>
                      <TableCell className="font-medium">Room {student.room_number}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            {student.parent_profile_photo && <AvatarImage src={student.parent_profile_photo} alt="Parent" className="object-cover" />}
                            <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-semibold">
                              P
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-mono text-xs font-medium">{student.parent_mobile}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-medium">{student.mobile}</TableCell>
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
                  ))
                )}
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
                of <strong className="text-foreground">{filtered.length}</strong> students
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

      <Dialog open={!!view} onOpenChange={(open) => { if (!open) { setView(null); setPhotoFile(null); setParentPhotoFile(null); } }}>
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
                <Info k="Student Year" v={view.student_year || "N/A"} />
                <Info k="Status" v={view.status} />
              </dl>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Student Photo */}
                <div className="grid gap-2 rounded-xl border border-border/60 p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      {view.profile_photo && <AvatarImage src={view.profile_photo} alt={view.name} className="object-cover" />}
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {view.name
                          .split(" ")
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Label htmlFor="photo" className="text-xs font-medium">Student photo</Label>
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
                    className="w-full mt-1"
                    disabled={!photoFile || photoMutation.isPending}
                    onClick={() => {
                      if (!view || !photoFile) return;
                      photoMutation.mutate({ studentId: view.id, file: photoFile });
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload student photo
                  </Button>
                </div>

                {/* Parent Photo */}
                <div className="grid gap-2 rounded-xl border border-border/60 p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      {view.parent_profile_photo && <AvatarImage src={view.parent_profile_photo} alt="Parent" className="object-cover" />}
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-sm font-semibold">
                        P
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Label htmlFor="parent_photo" className="text-xs font-medium">Parent photo</Label>
                      <Input
                        id="parent_photo"
                        type="file"
                        accept="image/*"
                        className="mt-1 h-9 text-xs"
                        onChange={(event) => setParentPhotoFile(event.target.files?.[0] ?? null)}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="w-full mt-1"
                    disabled={!parentPhotoFile || parentPhotoMutation.isPending}
                    onClick={() => {
                      if (!view || !parentPhotoFile) return;
                      parentPhotoMutation.mutate({ studentId: view.id, file: parentPhotoFile });
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload parent photo
                  </Button>
                </div>
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
                    parent_password: String(form.get("parent_password") ?? "") || undefined,
                    status: String(form.get("status") ?? ""),
                    hostel_id: selectedHostel,
                    student_year: String(form.get("student_year") ?? "") || null,
                  },
                });
              }}
              className="grid gap-4 md:grid-cols-2"
            >
              <Field name="student_id" label="Student ID" defaultValue={editingStudent.student_id} required />
              <Field name="name" label="Full Name" defaultValue={editingStudent.name} required />
              <Field name="room_number" label="Room Number" defaultValue={editingStudent.room_number} required />
              <Field name="mobile" label="Mobile Number" defaultValue={editingStudent.mobile} required />
              <Field name="parent_mobile" label="Parent Mobile" defaultValue={editingStudent.parent_mobile} required />
              <div className="grid gap-1.5">
                <Label htmlFor="student_year">Student Year</Label>
                <select
                  id="student_year"
                  name="student_year"
                  defaultValue={editingStudent.student_year || ""}
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select Year (Optional)</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
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
              <div className="md:col-span-2 grid gap-1.5">
                <Label htmlFor="status">Status</Label>
                <select id="status" name="status" defaultValue={editingStudent.status} className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="DISABLED">DISABLED</option>
                </select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="password">Student Password (Optional)</Label>
                <Input id="password" name="password" type="password" />
                <p className="text-xs text-muted-foreground">Leave blank to keep current student password.</p>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="parent_password">Parent Password (Optional)</Label>
                <Input id="parent_password" name="parent_password" type="password" />
                <p className="text-xs text-muted-foreground">Leave blank to keep current parent password.</p>
              </div>
              <DialogFooter className="md:col-span-2 flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  disabled={deleteMutation.isPending}
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete student ${editingStudent.name}? This will remove all their leave requests and gate passes.`)) {
                      deleteMutation.mutate(editingStudent.id);
                    }
                  }}
                >
                  Delete Student
                </Button>
                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  <Button type="button" variant="ghost" onClick={() => setEditingStudent(null)}>Cancel</Button>
                  <Button type="submit">Save Changes</Button>
                </div>
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
