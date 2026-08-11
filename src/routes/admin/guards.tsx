import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createStaff, getHostelStaff, updateStaff, uploadStaffPhoto, deleteStaff } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/guards")({
  head: () => ({ meta: [{ title: "Security Guards · Hostel GATEX" }] }),
  component: GuardsPage,
});

function GuardsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingGuard, setEditingGuard] = useState<any | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const photoMutation = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => uploadStaffPhoto(id, file),
    onSuccess: async () => {
      toast.success("Profile photo uploaded");
      setPhotoFile(null);
      await queryClient.invalidateQueries({ queryKey: ["hostel-staff"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to upload photo"),
  });

  const staffQuery = useQuery({ queryKey: ["hostel-staff"], queryFn: getHostelStaff });
  const list = useMemo(
    () => (staffQuery.data?.data ?? []).filter((staff) => staff.role === "SECURITY_GUARD"),
    [staffQuery.data],
  );

  const createMutation = useMutation({
    mutationFn: createStaff,
    onSuccess: async () => {
      toast.success("Guard added");
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["hostel-staff"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to add guard"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...payload }: { id: string; role: "SECURITY_GUARD"; name: string; email: string; password?: string }) =>
      updateStaff(id, payload),
    onSuccess: async () => {
      toast.success("Guard updated");
      setOpen(false);
      setEditingGuard(null);
      await queryClient.invalidateQueries({ queryKey: ["hostel-staff"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update guard"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStaff,
    onSuccess: async () => {
      toast.success("Security guard deleted successfully");
      setOpen(false);
      setEditingGuard(null);
      await queryClient.invalidateQueries({ queryKey: ["hostel-staff"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to delete guard"),
  });

  return (
    <>
      <PageHeader
        title="Security guards"
        description="Manage security guards with Android app access."
        action={
          <Dialog
            open={open}
            onOpenChange={(val) => {
              setOpen(val);
              if (!val) setEditingGuard(null);
            }}
          >
            <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> Add Guard</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingGuard ? "Edit guard" : "Add guard"}</DialogTitle></DialogHeader>
              <form
                key={editingGuard ? editingGuard.id : "new"}
                className="grid gap-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = new FormData(event.currentTarget);
                  const payload = {
                    role: "SECURITY_GUARD" as const,
                    name: String(form.get("name")),
                    email: String(form.get("email")),
                    password: String(form.get("password") ?? "") || undefined,
                  };
                  if (editingGuard) {
                    updateMutation.mutate({ id: editingGuard.id, ...payload });
                  } else {
                    createMutation.mutate(payload);
                  }
                }}
              >
                <Field name="name" label="Name" defaultValue={editingGuard?.name} required />
                <Field name="email" label="Email" type="email" defaultValue={editingGuard?.email} required />
                
                {editingGuard && (
                  <div className="grid gap-2 rounded-xl border border-border/60 p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        {editingGuard.profile_photo && <AvatarImage src={editingGuard.profile_photo} alt={editingGuard.name} className="object-cover" />}
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {editingGuard.name
                            .split(" ")
                            .map((part: string) => part[0])
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
                        if (!editingGuard || !photoFile) return;
                        photoMutation.mutate({ id: editingGuard.id, file: photoFile });
                      }}
                    >
                      Upload photo
                    </Button>
                  </div>
                )}

                <Field name="password" label="Password" type="password" helper={editingGuard ? "Leave blank to keep current password." : "Leave blank to use the default reset password."} />
                <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-2">
                   {editingGuard ? (
                     <Button
                       type="button"
                       variant="destructive"
                       disabled={deleteMutation.isPending}
                       onClick={() => {
                         if (window.confirm(`Are you sure you want to delete security guard ${editingGuard.name}? This action cannot be undone.`)) {
                           deleteMutation.mutate(editingGuard.id);
                         }
                       }}
                     >
                       Delete Guard
                     </Button>
                   ) : <div />}
                   <Button type="submit">{editingGuard ? "Save changes" : "Save"}</Button>
                 </DialogFooter>
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
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((guard) => (
                  <TableRow key={guard.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            {guard.profile_photo && <AvatarImage src={guard.profile_photo} alt={guard.name} className="object-cover" />}
                            <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                              {guard.name
                                .split(" ")
                                .map((part) => part[0])
                                .slice(0, 2)
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{guard.name}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">{guard.email}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingGuard(guard);
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
