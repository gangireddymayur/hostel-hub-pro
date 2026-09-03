import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { PageHeader } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { changePassword } from "@/lib/api";
import { getSession } from "@/lib/role";
import { toast } from "sonner";

export const Route = createFileRoute("/super/settings")({
  head: () => ({ meta: [{ title: "Settings · GATEX" }] }),
  component: SuperSettings,
});

function SuperSettings() {
  const session = getSession();
  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => toast.success("Password updated"),
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update password"),
  });

  return (
    <>
      <PageHeader title="Platform settings" description="Configure your GATEX workspace." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Account</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-1.5"><Label>Signed in as</Label><Input value={session?.profile.email ?? ""} readOnly /></div>
            <div className="grid gap-1.5"><Label>Role</Label><Input value={session?.profile.role ?? ""} readOnly /></div>
            <Button className="w-fit" variant="outline">Save changes</Button>
          </CardContent>
        </Card>
        <div className="grid gap-4">
          <Card>
            <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              {[
                ["New hostel onboarded", "Send email when a new hostel signs up."],
                ["Subscription expiring", "Notify 7 days before subscription ends."],
                ["Weekly summary", "Receive a weekly performance digest."],
              ].map(([title, description]) => (
                <div key={title} className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Change password</CardTitle></CardHeader>
            <CardContent>
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
                <Button className="w-fit" type="submit">Update password</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
