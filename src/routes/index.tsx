import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BarChart3, Building2, GraduationCap, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { login } from "@/lib/api";
import { getSession, initTheme, type Role, setSession } from "@/lib/role";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HostelOS - Login" },
      { name: "description", content: "Secure portal for super admins and hostel admins." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("super");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initTheme();
  }, []);

  useEffect(() => {
    const session = getSession();
    if (!session) return;
    navigate({ to: session.profile.role === "SUPER_ADMIN" ? "/super/dashboard" : "/admin/dashboard" });
  }, [navigate]);

  const defaults = useMemo(
    () => ({
      superEmail: "superadmin@platform.test",
      superPassword: "ChangeMe123!",
      hostelEmail: "green-valley@hostel.test",
      adminEmail: "admin@hostel.test",
      adminPassword: "ChangeMe123!",
    }),
    [],
  );

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const identifier = String(form.get("identifier") ?? "");
    const password = String(form.get("password") ?? "");
    const hostelEmail = String(form.get("hostelEmail") ?? "");

    setLoading(true);
    setError(null);
    try {
      const response = await login({
        type: role === "super" ? "SUPER_ADMIN" : "HOSTEL_ADMIN",
        identifier,
        password,
        hostelEmail: role === "admin" ? hostelEmail : undefined,
      });
      setSession(response);
      navigate({ to: response.profile.role === "SUPER_ADMIN" ? "/super/dashboard" : "/admin/dashboard" });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Login failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,oklch(0.55_0.21_265/0.18),transparent_70%)]" />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">HostelOS</span>
        </div>
        <span className="text-xs text-muted-foreground">Live backend connected</span>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-10">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Production portal
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-6xl">
            Modern leave management for{" "}
            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">hostels at scale</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            One secure portal for super admins to onboard hostels and hostel admins to manage students, staff and leave approvals.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-border/60 shadow-lg">
            <CardContent className="p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Sign in</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Use the role selector below and your real backend credentials.
              </p>

              <form className="mt-6 grid gap-4" onSubmit={submit}>
                <Tabs value={role} onValueChange={(value) => setRole(value as Role)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="super">Super Admin</TabsTrigger>
                    <TabsTrigger value="admin">Hostel Admin</TabsTrigger>
                  </TabsList>
                </Tabs>

                {role === "super" ? (
                  <>
                    <Field name="identifier" label="Email" type="email" defaultValue={defaults.superEmail} />
                    <Field name="password" label="Password" type="password" defaultValue={defaults.superPassword} />
                  </>
                ) : (
                  <>
                    <Field name="hostelEmail" label="Hostel Email" type="email" defaultValue={defaults.hostelEmail} />
                    <Field name="identifier" label="Admin Email" type="email" defaultValue={defaults.adminEmail} />
                    <Field name="password" label="Password" type="password" defaultValue={defaults.adminPassword} />
                  </>
                )}

                {error ? <p className="text-sm text-destructive">{error}</p> : null}

                <Button className="w-full justify-between" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      Signing in <Loader2 className="h-4 w-4 animate-spin" />
                    </>
                  ) : (
                    <>
                      Continue <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-muted/20">
            <CardContent className="p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-info/10 text-info">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">What’s included</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-success" />JWT-based authentication with role-based access control.</li>
                <li className="flex items-start gap-2"><GraduationCap className="mt-0.5 h-4 w-4 text-success" />Multi-tenant hostel data separated per hostel workspace.</li>
                <li className="flex items-start gap-2"><Building2 className="mt-0.5 h-4 w-4 text-success" />Web access is only for super admins and hostel admins.</li>
                <li className="flex items-start gap-2"><BarChart3 className="mt-0.5 h-4 w-4 text-success" />Live dashboards, imports, reviews and reports backed by API.</li>
              </ul>

              <div className="mt-6 rounded-xl border border-border bg-background p-4 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Test login</p>
                <p className="mt-2">Super admin: <span className="font-mono text-foreground">{defaults.superEmail}</span></p>
                <p>Password: <span className="font-mono text-foreground">{defaults.superPassword}</span></p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function Field({ name, label, type = "text", defaultValue }: { name: string; label: string; type?: string; defaultValue?: string }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} defaultValue={defaultValue} required />
    </div>
  );
}
