import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Upload } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings · HostelOS" }] }),
  component: AdminSettings,
});

function AdminSettings() {
  return (
    <>
      <PageHeader title="Hostel settings" description="Branding, notifications and integration preferences." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Hostel details</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-2xl font-bold text-primary-foreground">SB</div>
              <Button variant="outline" size="sm"><Upload className="h-4 w-4" /> Upload logo</Button>
            </div>
            <div className="grid gap-1.5"><Label>Hostel name</Label><Input defaultValue="Sunrise Boys Hostel" /></div>
            <div className="grid gap-1.5"><Label>Address</Label><Textarea defaultValue="12 College Rd, Bengaluru 560001" /></div>
            <div className="grid gap-1.5 sm:grid-cols-2 sm:gap-4">
              <div className="grid gap-1.5"><Label>Phone</Label><Input defaultValue="+91 9845012345" /></div>
              <div className="grid gap-1.5"><Label>Email</Label><Input defaultValue="admin@sunrise.edu" /></div>
            </div>
            <Button className="w-fit">Save changes</Button>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card>
            <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              {[
                ["New leave request","Notify when a parent approves a new request."],
                ["Student returned late","Alert when a student misses expected return time."],
                ["Daily summary","Email morning summary at 8:00 AM."],
              ].map(([t, d]) => (
                <div key={t} className="flex items-start justify-between gap-4">
                  <div><p className="text-sm font-medium">{t}</p><p className="text-xs text-muted-foreground">{d}</p></div>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Email settings</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-1.5"><Label>SMTP host</Label><Input defaultValue="smtp.hostelos.app" /></div>
              <div className="grid gap-1.5 sm:grid-cols-2 sm:gap-4">
                <div className="grid gap-1.5"><Label>Port</Label><Input defaultValue="587" /></div>
                <div className="grid gap-1.5"><Label>From email</Label><Input defaultValue="no-reply@sunrise.edu" /></div>
              </div>
              <Button className="w-fit" variant="outline">Test connection</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
