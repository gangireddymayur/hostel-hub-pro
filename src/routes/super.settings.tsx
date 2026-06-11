import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/super/settings")({
  head: () => ({ meta: [{ title: "Settings · HostelOS" }] }),
  component: SuperSettings,
});

function SuperSettings() {
  return (
    <>
      <PageHeader title="Platform settings" description="Configure your HostelOS workspace." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Organization</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-1.5"><Label>Platform name</Label><Input defaultValue="HostelOS" /></div>
            <div className="grid gap-1.5"><Label>Support email</Label><Input defaultValue="support@hostelos.app" /></div>
            <div className="grid gap-1.5"><Label>Default timezone</Label><Input defaultValue="Asia/Kolkata" /></div>
            <Button className="w-fit">Save changes</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            {[
              ["New hostel onboarded","Send email when a new hostel signs up."],
              ["Subscription expiring","Notify 7 days before subscription ends."],
              ["Weekly summary","Receive a weekly performance digest."],
            ].map(([t, d]) => (
              <div key={t} className="flex items-start justify-between gap-4">
                <div><p className="text-sm font-medium">{t}</p><p className="text-xs text-muted-foreground">{d}</p></div>
                <Switch defaultChecked />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
