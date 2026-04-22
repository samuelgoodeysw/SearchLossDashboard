import KPICard from "./KPICard";
import StatusBadge from "./StatusBadge";
import InsightNote from "./InsightNote";
import { kpiData, accountsTable, revenueConcentration, revenueBySegment } from "@/data/mockData";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";


const fmtK = (n: number) => n === 0 ? "—" : `$${(n / 1_000).toFixed(1)}K`;

const TabAccountPerformance = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <KPICard title="Active Accounts" value={String(kpiData.activeAccounts)} change={3.2} changeLabel="vs prior" variant="accent" />
      <KPICard title="At-Risk Accounts" value={String(kpiData.atRiskAccounts)} variant="warning" />
      <KPICard title="Dormant Accounts" value={String(kpiData.dormantAccounts)} variant="danger" />
      <KPICard title="Monthly Revenue at Risk" value={fmtK(kpiData.monthlyRevenueAtRisk)} variant="danger" />
    </div>

    <div className="grid gap-4 lg:grid-cols-3">
      {/* Segment Breakdown */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="mb-4 text-[13px] font-medium text-muted-foreground">Account Base by Segment</h3>
        <div className="space-y-3">
          {revenueBySegment.map((seg) => (
            <div key={seg.name} className="flex items-center justify-between text-[12px]">
              <span className="text-muted-foreground">{seg.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-foreground font-medium">{fmtK(seg.value)}</span>
                <span className="text-muted-foreground w-8 text-right">{seg.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Concentration Donut */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="mb-4 text-[13px] font-medium text-muted-foreground">Revenue Concentration by Tier</h3>
        <div className="flex items-center gap-4">
          <ResponsiveContainer width="50%" height={180}>
            <PieChart>
              <Pie data={revenueConcentration} dataKey="value" cx="50%" cy="50%" outerRadius={72} innerRadius={48} strokeWidth={0}>
                {revenueConcentration.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "hsl(222, 41%, 10%)", border: "1px solid hsl(222, 20%, 18%)", borderRadius: "6px", fontSize: "12px" }} formatter={(v: number) => [`${v}%`, ""]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2.5">
            {revenueConcentration.map((tier) => (
              <div key={tier.name} className="flex items-center gap-2 text-[12px]">
                <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: tier.color }} />
                <span className="text-muted-foreground">{tier.name}</span>
                <span className="ml-auto font-medium text-foreground">{tier.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="space-y-3">
        <InsightNote variant="warning" text="Accounts do not churn all at once — they decay first. 87 accounts showing declining order frequency and reduced basket size before going silent. Early intervention on at-risk accounts preserves $418K/mo." />
        <InsightNote text="The average active account purchases from only 18 of 4,280 available SKUs. Catalog penetration is 14.2%. Every 1% improvement in penetration across active accounts represents ~$760K in annual expansion revenue." />
      </div>
    </div>

    {/* Account Table */}
    <div className="overflow-auto rounded-lg border border-border bg-card">
      <div className="px-5 py-3 border-b border-border">
        <h3 className="text-[13px] font-medium text-muted-foreground">Watchlist — High-Value Accounts</h3>
      </div>
      <table className="w-full text-[12px]">
        <thead>
          <tr className="border-b border-border bg-secondary/30">
            <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Account</th>
            <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Segment</th>
            <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Last Order</th>
            <th className="px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">30d Rev</th>
            <th className="px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">AOV</th>
            <th className="px-4 py-2.5 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Order Cadence (days)</th>
            <th className="px-4 py-2.5 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Status</th>
          </tr>
        </thead>
        <tbody>
          {accountsTable.map((a) => (
            <tr key={a.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
              <td className="px-4 py-2.5 font-mono text-[11px] text-foreground">{a.id}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{a.segment}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{a.lastOrder}</td>
              <td className="px-4 py-2.5 text-right font-medium text-foreground">{a.revenue30d === 0 ? "—" : fmtK(a.revenue30d)}</td>
              <td className="px-4 py-2.5 text-right text-muted-foreground">{fmtK(a.avgOrderValue)}</td>
              <td className="px-4 py-2.5 text-center text-muted-foreground">{a.orderFrequency ? `${a.orderFrequency}d` : "—"}</td>
              <td className="px-4 py-2.5 text-center"><StatusBadge status={a.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default TabAccountPerformance;
