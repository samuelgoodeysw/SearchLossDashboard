import KPICard from "./KPICard";
import InsightNote from "./InsightNote";
import { searchData, failedSearchTerms } from "@/data/mockData";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const fmtK = (n: number) => `$${(n / 1_000).toFixed(0)}K`;

const TabSearchDiscovery = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <KPICard title="On-Site Searches (30d)" value={searchData.totalSearches.toLocaleString()} variant="accent" />
      <KPICard title="Zero-Result Rate" value={`${searchData.zeroResultRate}%`} variant="danger" />
      <KPICard title="Search → Order Rate" value={`${searchData.searchToOrderRate}%`} variant="accent" />
      <KPICard title="Modeled Demand Lost" value={fmtK(searchData.modeledDemandLost)} variant="danger" />
    </div>

    <div className="grid gap-4 lg:grid-cols-3">
      {/* Failed Search Table */}
      <div className="col-span-2 rounded-lg border border-border bg-card p-5">
        <h3 className="mb-4 text-[13px] font-medium text-muted-foreground">Top Failed & Low-Conversion Searches</h3>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Search Term</th>
              <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Count</th>
              <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Conv %</th>
              <th className="pb-2 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Trend</th>
            </tr>
          </thead>
          <tbody>
            {failedSearchTerms.map((s) => (
              <tr key={s.term} className="border-b border-border last:border-0">
                <td className="py-2.5 font-mono text-[11px] text-foreground">"{s.term}"</td>
                <td className="py-2.5 text-right text-foreground">{s.count.toLocaleString()}</td>
                <td className="py-2.5 text-right">
                  <span className={s.conversion === 0 ? "text-danger font-medium" : "text-muted-foreground"}>{s.conversion}%</span>
                </td>
                <td className="py-2.5 text-center">
                  {s.trend === "up" ? (
                    <TrendingUp className="mx-auto h-3.5 w-3.5 text-danger" />
                  ) : s.trend === "down" ? (
                    <TrendingDown className="mx-auto h-3.5 w-3.5 text-success" />
                  ) : (
                    <Minus className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Insight Column */}
      <div className="space-y-3">
        <InsightNote text="Search users convert to order at 18.4% — 2.6x the rate of browse-only sessions. Search is a high-intent channel. Failed search does not merely lose one transaction; it breaks the replenishment habit that drives repeat orders." />
        <InsightNote variant="warning" text="9.8% of all searches return zero results. At current volume, that is 3,062 high-intent queries/month hitting dead ends. Each failed search is a buyer actively trying to spend money." />
        <InsightNote text="Synonym mapping, cross-reference enrichment, and OE-to-aftermarket part number resolution are fast-payback opportunities. Many failed queries are valid demand expressed in non-indexed terminology." />
      </div>
    </div>
  </div>
);

export default TabSearchDiscovery;
