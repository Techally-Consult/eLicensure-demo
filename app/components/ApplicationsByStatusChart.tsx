import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { Application } from "~/types/application";

const STATUS_ORDER: Application["status"][] = [
  "Draft",
  "Submitted",
  "Under Review",
  "Approved",
  "Rejected",
];

type Props = {
  applications: Application[] | undefined;
  isLoading?: boolean;
};

export function ApplicationsByStatusChart({ applications, isLoading }: Props) {
  const data = applications
    ? STATUS_ORDER.map((status) => ({
        status,
        count: applications.filter((a) => a.status === status).length,
      })).filter((d) => d.count > 0)
    : [];

  if (isLoading) {
    return (
      <div className="flex h-[240px] items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-[240px] items-center justify-center text-muted-foreground">
        No data to display
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="status"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
          }}
          labelStyle={{ color: "var(--card-foreground)" }}
        />
        <Bar
          dataKey="count"
          fill="var(--chart-1)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
