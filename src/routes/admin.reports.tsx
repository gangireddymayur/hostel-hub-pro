import { createFileRoute } from "@tanstack/react-router";
import { Download, FileBarChart } from "lucide-react";
import { PageHeader } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { weeklyLeaves } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({ meta: [{ title: "Reports · HostelOS" }] }),
  component: Reports,
});

const items = [
  { title: "Daily Leave Report", desc: "Leaves approved/rejected today." },
  { title: "Monthly Leave Report", desc: "Aggregated leave activity for the month." },
  { title: "Students Outside Report", desc: "Students currently outside the hostel." },
  { title: "Student Exit History", desc: "Historical exit events with timestamps." },
  { title: "Student Return History", desc: "Historical return events with timestamps." },
];

function Reports() {
  return (
    <>
      <PageHeader title="Reports" description="Download operational reports for compliance and reviews." />

      <Card className="mb-6">
        <CardHeader><CardTitle>Leave volume — last 7 days</CardTitle></CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyLeaves}>
              <defs>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
              <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
              <Area type="monotone" dataKey="approved" stroke="var(--color-success)" fill="url(#g2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map(r => (
          <Card key={r.title} className="transition hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><FileBarChart className="h-5 w-5" /></div>
              <h3 className="mt-3 text-base font-semibold">{r.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => toast.success(`${r.title} downloaded`)}>
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
