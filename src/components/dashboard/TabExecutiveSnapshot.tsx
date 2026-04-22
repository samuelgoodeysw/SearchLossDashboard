import KPICard from "./KPICard";
import InsightNote from "./InsightNote";
import { kpiData, revenueTrend, revenueConcentration } from "@/data/mockData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AlertTriangle } from "lucide-react";

const fmtM = (n: number) => `$${(n / 1_000_000).toFixed(1)}M`;
const fmtK = (n: number) => `$${(n / 1_000).toFixed(0)}K`;

const TabExecutiveSnapshot = () => (
  <div className="space-y-6">
    {/* Risk Banner */}
    <div className="rounded-lg border border-danger/30 bg-danger/5 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-danger/15">
            <AlertTriangle className="h-5 w-5 text-danger" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-danger">Annual Revenue Exposure</p>
            <p className="text-2xl font-bold text-foreground tracking-tight">$2.4M at risk</p>
          </div>
        </div>
        <div className="flex gap-6 border-l border-border pl-6">
          <div>
            <p className="text-[11px] text-muted-foreground">Dormant accounts</p>
            <p className="text-lg font-semibold text-foreground">134</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Failed search demand</p>
            <p className="text-lg font-semibold text-foreground">{fmtK(418_200)}/mo</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">90+ day inventory</p>
            <p className="text-lg font-semibold text-foreground">{fmtM(2_140_000)}</p>
          </div>
        </div>
      </div>
    </div>

    {/* KPI Cards */}
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <KPICard title="Revenue (30d)" value={fmtM(kpiData.totalRevenue)} change={kpiData.revenueGrowth} changeLabel="vs prior" variant="accent" />
      <KPICard title="Gross Margin" value={`${kpiData.grossMarginPct}%`} change={-1.2} changeLabel="vs prior" variant="accent" />
      <KPICard title="Revenue at Risk" value={fmtK(kpiData.monthlyRevenueAtRisk)} variant="danger" />
      <KPICard title="Backorder Exposure" value={`${kpiData.backorderExposurePct}%`} variant="warning" />
    </div>

    <div className="grid gap-4 lg:grid-cols-3">
      {/* Revenue Trend */}
      <div className="col-span-2 rounded-lg border border-border bg-card p-5">
        <h3 className="mb-4 text-[13px] font-medium text-muted-foreground">Revenue — Current vs Prior Year</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={revenueTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 20%, 20%)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(215, 15%, 52%)" }} stroke="hsl(222, 20%, 20%)" />
            <YAxis tickFormatter={(v) => `$${(v / 1_000_000).toFixed(1)}M`} tick={{ fontSize: 11, fill: "hsl(215, 15%, 52%)" }} stroke="hsl(222, 20%, 20%)" />
            <Tooltip contentStyle={{ backgroundColor: "hsl(222, 41%, 10%)", border: "1px solid hsl(222, 20%, 18%)", borderRadius: "6px", fontSize: "12px" }} formatter={(v: number) => [fmtK(v), ""]} />
            <Line type="monotone" dataKey="current" stroke="hsl(213, 94%, 58%)" strokeWidth={2} dot={false} name="Current" />
            <Line type="monotone" dataKey="prior" stroke="hsl(215, 15%, 40%)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Prior Year" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue Concentration + Insight */}
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="mb-4 text-[13px] font-medium text-muted-foreground">Revenue Concentration</h3>
          <div className="space-y-3">
            {revenueConcentration.map((tier) => (
              <div key={tier.name}>
                <div className="mb-1 flex items-center justify-between text-[12px]">
                  <span className="text-muted-foreground">{tier.name}</span>
                  <span className="font-semibold text-foreground">{tier.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary">
                  <div className="h-full rounded-full" style={{ width: `${tier.value}%`, backgroundColor: tier.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <InsightNote
          variant="warning"
          text="Top 10 accounts generate 44% of total revenue. Loss of any two fleet accounts would create a material gap. Active diversification into mid-market repair and dealer segments reduces single-account dependency."
        />
      </div>
    </div>
  </div>
);

export default TabExecutiveSnapshot;
