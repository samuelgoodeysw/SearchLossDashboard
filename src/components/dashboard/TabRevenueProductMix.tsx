import KPICard from "./KPICard";
import InsightNote from "./InsightNote";
import { kpiData, productCategories, topSKUs, decliningSKUs, productPenetration } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

const fmtK = (n: number) => `$${(n / 1_000).toFixed(0)}K`;
const fmtM = (n: number) => `$${(n / 1_000_000).toFixed(1)}M`;

const TabRevenueProductMix = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <KPICard title="Gross Margin Leakage" value={fmtK(kpiData.grossMarginLeakage)} variant="danger" />
      <KPICard title="Avg SKUs / Account" value={String(kpiData.avgSKUsPerAccount)} variant="accent" />
      <KPICard title="Catalog Penetration" value={`${kpiData.catalogPenetrationPct}%`} variant="warning" />
      <KPICard title="Cross-Sell Upside" value={fmtM(kpiData.crossSellUpside)} variant="accent" />
    </div>

    <div className="grid gap-4 lg:grid-cols-3">
      {/* Revenue by Category */}
      <div className="col-span-2 rounded-lg border border-border bg-card p-5">
        <h3 className="mb-4 text-[13px] font-medium text-muted-foreground">Revenue by Category</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={productCategories} layout="vertical" margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 20%, 20%)" horizontal={false} />
            <XAxis type="number" tickFormatter={(v) => `$${(v / 1_000_000).toFixed(1)}M`} tick={{ fontSize: 11, fill: "hsl(215, 15%, 52%)" }} stroke="hsl(222, 20%, 20%)" />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "hsl(215, 15%, 52%)" }} stroke="hsl(222, 20%, 20%)" width={120} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(222, 41%, 10%)", border: "1px solid hsl(222, 20%, 18%)", borderRadius: "6px", fontSize: "12px" }} formatter={(v: number) => [fmtK(v), "Revenue"]} />
            <Bar dataKey="revenue" fill="hsl(213, 94%, 58%)" radius={[0, 4, 4, 0]} barSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Growth + Margin */}
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="mb-3 text-[13px] font-medium text-muted-foreground">Category Growth & Margin</h3>
          <div className="space-y-2.5">
            {productCategories.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-[12px]">
                <span className="text-muted-foreground">{c.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">{c.margin}%</span>
                  <div className="flex items-center gap-1 w-14 justify-end">
                    {c.growth > 0 ? <TrendingUp className="h-3 w-3 text-success" /> : <TrendingDown className="h-3 w-3 text-danger" />}
                    <span className={c.growth > 0 ? "text-success" : "text-danger"}>{c.growth > 0 ? "+" : ""}{c.growth}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <InsightNote text={`Multi-category buyers generate ${productPenetration.multiCategoryBuyerMargin}% gross margin vs ${productPenetration.singleCategoryBuyerMargin}% for single-category. Expanding category adoption inside existing accounts improves margin and retention simultaneously.`} />
        <InsightNote variant="warning" text="Leaf springs declining at -3.8% while air springs grow at +11.4%. Category mix shift is compressing blended margin by ~120bps. Proactive pricing review on high-volume suspension SKUs could offset." />
      </div>
    </div>

    <div className="grid gap-4 lg:grid-cols-2">
      {/* Top SKUs */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="mb-3 text-[13px] font-medium text-muted-foreground">Top SKUs by Revenue</h3>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">SKU</th>
              <th className="pb-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Description</th>
              <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Units</th>
              <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {topSKUs.map((s) => (
              <tr key={s.sku} className="border-b border-border last:border-0">
                <td className="py-2 font-mono text-[11px] text-foreground">{s.sku}</td>
                <td className="py-2 text-muted-foreground">{s.name}</td>
                <td className="py-2 text-right text-foreground">{s.units.toLocaleString()}</td>
                <td className="py-2 text-right font-medium text-foreground">{fmtK(s.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Declining SKUs */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="mb-3 text-[13px] font-medium text-muted-foreground">Declining SKUs — Watchlist</h3>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">SKU</th>
              <th className="pb-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Description</th>
              <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Units</th>
              <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Trend</th>
            </tr>
          </thead>
          <tbody>
            {decliningSKUs.map((s) => (
              <tr key={s.sku} className="border-b border-border last:border-0">
                <td className="py-2 font-mono text-[11px] text-foreground">{s.sku}</td>
                <td className="py-2 text-muted-foreground">{s.name}</td>
                <td className="py-2 text-right text-foreground">{s.units.toLocaleString()}</td>
                <td className="py-2 text-right font-medium text-danger">{s.decline}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default TabRevenueProductMix;
