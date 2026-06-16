import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { PageHeader } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { changePassword } from "@/lib/api";
import { getSession } from "@/lib/role";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings · HostelOS" }] }),
  component: AdminSettings,
});

function AdminSettings() {
  const session = getSession();
  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => toast.success("Password updated"),
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update password"),
  });

  return (
    <>
      <PageHeader title="Hostel settings" description="Branding, notifications and integration preferences." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Hostel details</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-2xl font-bold text-primary-foreground">
                {(session?.profile.email ?? "HA").slice(0, 2).toUpperCase()}
              </div>
              <Button variant="outline" size="sm"><Upload className="h-4 w-4" /> Upload logo</Button>
            </div>
            <div className="grid gap-1.5"><Label>Hostel email</Label><Input defaultValue={session?.profile.email ?? ""} readOnly /></div>
            <div className="grid gap-1.5"><Label>Address</Label><Textarea placeholder="Enter hostel address" /></div>
            <Button className="w-fit" variant="outline">Save changes</Button>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card>
            <CardHeader><CardTitle>Change password</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              <form
                className="grid gap-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = new FormData(event.currentTarget);
                  passwordMutation.mutate({
                    currentPassword: String(form.get("currentPassword") ?? ""),
                    newPassword: String(form.get("newPassword") ?? ""),
                  });
                }}
              >
                <div className="grid gap-1.5">
                  <Label htmlFor="currentPassword">Current password</Label>
                  <Input id="currentPassword" name="currentPassword" type="password" required />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="newPassword">New password</Label>
                  <Input id="newPassword" name="newPassword" type="password" required />
                </div>
                <Button className="w-fit" type="submit">
                  Update password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
