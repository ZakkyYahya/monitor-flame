import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Activity, Droplets, Thermometer, Zap, Lightbulb, Power } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

type Point = {
  time: string;
  suhu: number;
  kelembapan: number;
  tegangan: number;
};

const MAX_POINTS = 20;

function rand(min: number, max: number) {
  return +(Math.random() * (max - min) + min).toFixed(1);
}

function seedData(): Point[] {
  const now = Date.now();
  return Array.from({ length: MAX_POINTS }, (_, i) => {
    const t = new Date(now - (MAX_POINTS - i) * 2000);
    return {
      time: t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      suhu: rand(24, 32),
      kelembapan: rand(55, 80),
      tegangan: rand(210, 230),
    };
  });
}

function Dashboard() {
  const [data, setData] = useState<Point[]>(() => seedData());
  const [relay, setRelay] = useState(false);
  const [lamp, setLamp] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setData((prev) => {
        const last = prev[prev.length - 1];
        const next: Point = {
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          suhu: +Math.max(20, Math.min(35, last.suhu + rand(-0.8, 0.8))).toFixed(1),
          kelembapan: +Math.max(40, Math.min(90, last.kelembapan + rand(-1.5, 1.5))).toFixed(1),
          tegangan: +Math.max(200, Math.min(240, last.tegangan + rand(-1.2, 1.2))).toFixed(1),
        };
        return [...prev.slice(-(MAX_POINTS - 1)), next];
      });
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const latest = data[data.length - 1];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Activity className="size-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">IoT Sensor Dashboard</h1>
              <p className="text-xs text-muted-foreground">Real-time monitoring simulation</p>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1.5">
            <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
            Live
          </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Suhu"
            value={`${latest.suhu} °C`}
            icon={<Thermometer className="size-5" />}
            tint="text-orange-500"
          />
          <StatCard
            title="Kelembapan"
            value={`${latest.kelembapan} %`}
            icon={<Droplets className="size-5" />}
            tint="text-sky-500"
          />
          <StatCard
            title="Tegangan"
            value={`${latest.tegangan} V`}
            icon={<Zap className="size-5" />}
            tint="text-amber-500"
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Real-time Sensor Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                      minTickGap={24}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-popover)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="suhu"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                      name="Suhu (°C)"
                    />
                    <Line
                      type="monotone"
                      dataKey="kelembapan"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                      name="Kelembapan (%)"
                    />
                    <Line
                      type="monotone"
                      dataKey="tegangan"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                      name="Tegangan (V)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <LegendDot color="#f97316" label="Suhu (°C)" />
                <LegendDot color="#0ea5e9" label="Kelembapan (%)" />
                <LegendDot color="#f59e0b" label="Tegangan (V)" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Device Control</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ControlRow
                icon={<Power className="size-5" />}
                label="Relay"
                description="Kontrol daya perangkat"
                on={relay}
                setOn={setRelay}
              />
              <ControlRow
                icon={<Lightbulb className="size-5" />}
                label="Lampu"
                description="Kontrol pencahayaan"
                on={lamp}
                setOn={setLamp}
              />
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  tint,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  tint: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">{value}</p>
        </div>
        <div className={`grid size-11 place-items-center rounded-full bg-muted ${tint}`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function ControlRow({
  icon,
  label,
  description,
  on,
  setOn,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  on: boolean;
  setOn: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="flex items-center gap-3">
        <div
          className={`grid size-10 place-items-center rounded-md ${
            on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">{on ? "ON" : "OFF"}</span>
        <Switch checked={on} onCheckedChange={setOn} />
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="size-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}