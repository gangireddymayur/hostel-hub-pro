import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Ban, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { createHostel, getSuperHostels, setHostelStatus, updateHostel } from "@/lib/api";
import { toast } from "sonner";

type HostelRow = {
  id: string;
  hostel_name: string;
  email: string;
  status: string;
  created_at: string;
  _count?: { students: number; parents: number; staff: number; leaveRequests: number };
};

export const Route = createFileRoute("/admin/hostels")({
  head: () => ({ meta: [{ title: "Hostel Management · HostelOS" }] }),
  component: HostelsPage,
});

function HostelsPage() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<HostelRow | null>(null);

  const hostelsQuery = useQuery({ queryKey: ["super-hostels"], queryFn: getSuperHostels });

  const list = useMemo(() => hostelsQuery.data?.data ?? [], [hostelsQuery.data]);
  const filtered = list.filter((hostel) =>
    (hostel.hostel_name?.toLowerCase() ?? "").includes(q.toLowerCase()) ||
    (hostel.email?.toLowerCase() ?? "").includes(q.toLowerCase()),
  );

  if (hostelsQuery.isLoading) {
    return (
      <>
        <PageHeader
          title="Hostel management"
          description="Create, edit and manage all hostels on the platform."
        />
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Loading hostels...</CardContent>
        </Card>
      </>
    );
  }

  if (hostelsQuery.isError) {
    return (
      <>
        <PageHeader
          title="Hostel management"
          description="Create, edit and manage all hostels on the platform."
        />
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-destructive">Failed to load hostels.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {(hostelsQuery.error as Error)?.message ?? "Unknown error"}
            </p>
          </CardContent>
        </Card>
      </>
    );
  }

  const createMutation = useMutation({
    mutationFn: createHostel,
    onSuccess: async (response) => {
      const creds = response.data.credentials;
      toast.success("Hostel created", {
        description: `Login Email: ${creds.hostel_email} | Password: ${creds.password}`,
      });
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["super-hostels"] });
      await queryClient.invalidateQueries({ queryKey: ["active-hostels"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to create hostel"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { hostel_name?: string; email?: string; password?: string } }) => updateHostel(id, payload),
    onSuccess: async () => {
      toast.success("Hostel updated");
      setEditing(null);
      await queryClient.invalidateQueries({ queryKey: ["super-hostels"] });
      await queryClient.invalidateQueries({ queryKey: ["active-hostels"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update hostel"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "ACTIVE" | "DISABLED" }) => setHostelStatus(id, status),
    onSuccess: async (_, variables) => {
      toast.success(`Hostel ${variables.status === "ACTIVE" ? "enabled" : "disabled"}`);
      await queryClient.invalidateQueries({ queryKey: ["super-hostels"] });
      await queryClient.invalidateQueries({ queryKey: ["active-hostels"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update status"),
  });

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
                <DialogDescription>Provision a new hostel workspace. The admin login details will be auto-generated.</DialogDescription>
              </DialogHeader>
              <HostelForm
                isCreate
                onSubmit={(payload) =>
                  createMutation.mutate({
                    hostel_name: payload.hostel_name ?? "",
                  })
                }
                submitLabel={createMutation.isPending ? "Creating..." : "Create Hostel"}
                onCancel={() => setOpen(false)}
              />
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardContent className="p-4">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="relative max-w-sm flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search hostels…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hostel</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <div className="py-8 text-center text-sm text-muted-foreground">
                        No hostels yet. Create the first hostel to get started.
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filtered.map((hostel) => (
                  <TableRow key={hostel.id}>
                    <TableCell>
                      <div className="font-medium">{hostel.hostel_name}</div>
                      <div className="text-xs text-muted-foreground">{hostel.email}</div>
                    </TableCell>
                    <TableCell>{hostel._count?.students ?? 0}</TableCell>
                    <TableCell>{hostel._count?.staff ?? 0}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          hostel.status === "ACTIVE"
                            ? "bg-success text-success-foreground hover:bg-success"
                            : "bg-muted text-muted-foreground hover:bg-muted"
                        }
                      >
                        {hostel.status.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => setEditing(hostel)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            statusMutation.mutate({
                              id: hostel.id,
                              status: hostel.status === "ACTIVE" ? "DISABLED" : "ACTIVE",
                            })
                          }
                        >
                          {hostel.status === "ACTIVE" ? <Ban className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
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

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit hostel</DialogTitle>
            <DialogDescription>Update hostel details and admin login settings.</DialogDescription>
          </DialogHeader>
          {editing ? (
            <HostelForm
              initial={editing}
              isCreate={false}
              onSubmit={(payload) => updateMutation.mutate({ id: editing.id, payload })}
              submitLabel={updateMutation.isPending ? "Saving..." : "Save changes"}
              onCancel={() => setEditing(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function HostelForm({
  initial,
  isCreate,
  onSubmit,
  submitLabel,
  onCancel,
}: {
  initial?: Partial<HostelRow>;
  isCreate: boolean;
  onSubmit: (payload: { hostel_name?: string }) => void;
  submitLabel: string;
  onCancel: () => void;
}) {
  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        onSubmit({
          hostel_name: String(form.get("hostel_name") ?? ""),
        });
      }}
    >
      <Field name="hostel_name" label="Hostel Name" defaultValue={initial?.hostel_name ?? ""} required />
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </DialogFooter>
    </form>
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
