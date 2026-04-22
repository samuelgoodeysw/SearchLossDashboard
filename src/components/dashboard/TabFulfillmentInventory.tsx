import KPICard from "./KPICard";
import InsightNote from "./InsightNote";
import { fulfillmentKPIs, inventoryAging, warehousePerformance } from "@/data/mockData";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const fmtM = (n: number) => `$${(n / 1_000_000).toFixed(1)}M`;
const fmtK = (n: number) => `$${(n / 1_000).toFixed(0)}K`;

const TabFulfillmentInventory = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <KPICard title="Fill Rate" value={`${fulfillmentKPIs.fillRate}%`} change={-0.8} changeLabel="vs prior" variant="accent" />
      <KPICard title="Backorder Rate" value={`${fulfillmentKPIs.backorderRate}%`} variant="danger" />
      <KPICard title="Inventory Turns" value={`${fulfillmentKPIs.inventoryTurnover}x`} variant="accent" />
      <KPICard title="90+ Day Inventory" value={fmtM(fulfillmentKPIs.ninetyDayInventoryValue)} variant="danger" />
    </div>

    <div className="grid gap-4 lg:grid-cols-2">
      {/* Inventory Aging */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="mb-4 text-[13px] font-medium text-muted-foreground">Inventory Aging at Cost</h3>
        <div className="flex items-center gap-6">
          <ResponsiveContainer width="45%" height={200}>
            <PieChart>
              <Pie data={inventoryAging} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={52} strokeWidth={0}>
                {inventoryAging.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "hsl(222, 41%, 10%)", border: "1px solid hsl(222, 20%, 18%)", borderRadius: "6px", fontSize: "12px" }} formatter={(v: number) => [`${v}%`, ""]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-3">
            {inventoryAging.map((item) => (
              <div key={item.name} className="flex items-center gap-3 text-[12px]">
                <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                <div>
                  <span className="text-muted-foreground">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{item.value}%</span>
                    <span className="text-muted-foreground">· {fmtM(item.dollarValue)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DC Performance */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="mb-4 text-[13px] font-medium text-muted-foreground">Distribution Center Performance</h3>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">DC</th>
              <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Revenue</th>
              <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Fill Rate</th>
              <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Ship Time</th>
              <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Backorders</th>
            </tr>
          </thead>
          <tbody>
            {warehousePerformance.map((w) => (
              <tr key={w.name} className="border-b border-border last:border-0">
                <td className="py-3 font-medium text-foreground">{w.name}</td>
                <td className="py-3 text-right text-foreground">{fmtM(w.revenue)}</td>
                <td className="py-3 text-right text-foreground">{w.fillRate}%</td>
                <td className="py-3 text-right text-foreground">{w.avgShipTime}d</td>
                <td className="py-3 text-right">
                  <span className={w.backorders > 200 ? "text-danger font-medium" : "text-foreground"}>{w.backorders}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    <InsightNote variant="warning" text="$2.1M in 90+ day inventory while Central DC holds 218 open backorders. Slow-moving SKUs accumulate carrying cost while fast-moving SKUs create fill rate pressure. Rebalancing between DCs and accelerating markdown on aged stock recovers working capital and improves fill rate simultaneously." />
  </div>
);

export default TabFulfillmentInventory;
