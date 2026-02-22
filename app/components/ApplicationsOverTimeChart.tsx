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

function getWeekKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().slice(0, 10);
}

type Props = {
  applications: Application[] | undefined;
  isLoading?: boolean;
};

export function ApplicationsOverTimeChart({ applications, isLoading }: Props) {
  const data = applications
    ? (() => {
        const byWeek: Record<string, number> = {};
        for (const app of applications) {
          const key = getWeekKey(new Date(app.lastUpdated));
          byWeek[key] = (byWeek[key] ?? 0) + 1;
        }
        return Object.entries(byWeek)
          .map(([week, count]) => ({ week, count }))
          .sort((a, b) => a.week.localeCompare(b.week))
          .map(({ week, count }) => ({
            label: new Date(week).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "2-digit",
            }),
            week,
            count,
          }));
      })()
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
          dataKey="label"
          tick={{ fontSize: 11 }}
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
          formatter={(value) => [`${value ?? 0} applications`, "Count"]}
        />
        <Bar
          dataKey="count"
          fill="var(--chart-2)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
