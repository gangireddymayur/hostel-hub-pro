import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { getSuperAnalytics, getSuperHostels } from "@/lib/api";

export const Route = createFileRoute("/super/analytics")({
  head: () => ({ meta: [{ title: "Analytics · Hostel GATEX" }] }),
  component: Analytics,
});

const COLORS = ["var(--color-primary)", "var(--color-success)", "var(--color-warning)", "var(--color-info)", "var(--color-chart-5)"];

function Analytics() {
  const analyticsQuery = useQuery({ queryKey: ["super-analytics"], queryFn: getSuperAnalytics });
  const hostelsQuery = useQuery({ queryKey: ["super-hostels"], queryFn: getSuperHostels });

  const hostels = hostelsQuery.data?.data ?? [];
  const analytics = analyticsQuery.data?.data;

  const subData = useMemo(
    () =>
      ["ACTIVE", "DISABLED"].map((status) => ({
        name: status.toLowerCase(),
        value: hostels.filter((hostel) => hostel.status === status).length,
      })),
    [hostels],
  );

  const growthData = analytics?.monthlyGrowth ?? [];

  return (
    <>
      <PageHeader title="Analytics" description="Platform-level insights and growth trends." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Hostels onboarded</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="hostels" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Hostel status</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={subData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={4}>
                  {subData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
