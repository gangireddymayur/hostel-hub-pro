import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Building2, GraduationCap, ShieldCheck, BarChart3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { initTheme, setRole, type Role } from "@/lib/role";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HostelOS — Modern Hostel Leave Management" },
      { name: "description", content: "Premium SaaS platform for hostel administrators to manage students, rooms, staff, and leave requests." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  useEffect(() => { initTheme(); }, []);

  const enter = (r: Role) => {
    setRole(r);
    navigate({ to: r === "super" ? "/super/dashboard" : "/admin/dashboard" });
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
        <span className="text-xs text-muted-foreground">v1.0 · SaaS Edition</span>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-10">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Live demo · Mock data
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-6xl">
            Modern leave management for{" "}
            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">hostels at scale</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            One platform for super admins to onboard hostels, and for hostel admins to manage rooms, staff and student leave end-to-end.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-3xl gap-4 md:grid-cols-2">
          <Card className="group cursor-pointer border-border/60 transition hover:border-primary/40 hover:shadow-lg" onClick={() => enter("super")}>
            <CardContent className="p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Super Admin</h3>
              <p className="mt-1 text-sm text-muted-foreground">Onboard hostels, monitor subscriptions and platform-wide analytics.</p>
              <Button className="mt-5 w-full justify-between" onClick={() => enter("super")}>
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="group cursor-pointer border-border/60 transition hover:border-primary/40 hover:shadow-lg" onClick={() => enter("admin")}>
            <CardContent className="p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-info/10 text-info">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Hostel Admin</h3>
              <p className="mt-1 text-sm text-muted-foreground">Manage students, rooms, staff and approve leaves for your hostel.</p>
              <Button className="mt-5 w-full justify-between" variant="secondary" onClick={() => enter("admin")}>
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mx-auto mt-10 flex max-w-2xl items-center justify-center gap-2 rounded-xl border border-border/60 bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-success" />
          Students, parents and security guards use the dedicated Android app — no web access.
        </div>
      </main>
    </div>
  );
}
