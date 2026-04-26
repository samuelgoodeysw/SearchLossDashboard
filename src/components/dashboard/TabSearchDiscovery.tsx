import { useEffect, useState } from "react";
import KPICard from "./KPICard";
import InsightNote from "./InsightNote";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type SearchData = {
  totalSearches: number;
  zeroResultRate: number;
  searchToOrderRate: number;
  modeledDemandLost: number;
};

type FailedSearchTerm = {
  term: string;
  count: number;
  conversion: number;
  lostRevenue: number;
  opportunityScore: "High" | "Medium" | "Low";
  suggestedFix: string;
  trend: "up" | "down" | "stable";
};

type SearchLossResponse = {
  searchData: SearchData;
  failedSearchTerms: FailedSearchTerm[];
};

const fmtK = (n: number) => `$${(n / 1_000).toFixed(0)}K`;

const TabSearchDiscovery = () => {
  const [data, setData] = useState<SearchLossResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadSearchLossData() {
      try {
        const response = await fetch("/api/search-loss");

        if (!response.ok) {
          throw new Error("Failed to load Search Loss data");
        }

        const result = await response.json();
        setData(result);
      } catch (error) {
        setErrorMessage("Unable to load Search Loss data from Magento.");
      } finally {
        setIsLoading(false);
      }
    }

    loadSearchLossData();
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
        Loading Search Loss data from Magento...
      </div>
    );
  }

  if (errorMessage || !data) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-2 text-sm font-medium text-danger">Search Loss data unavailable</h3>
        <p className="text-sm text-muted-foreground">{errorMessage}</p>
      </div>
    );
  }

  const { searchData, failedSearchTerms } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KPICard title="On-Site Searches (30d)" value={searchData.totalSearches.toLocaleString()} variant="accent" />
        <KPICard title="Zero-Result Rate" value={`${searchData.zeroResultRate}%`} variant="danger" />
        <KPICard title="Search → Order Rate" value={`${searchData.searchToOrderRate}%`} variant="accent" />
        <KPICard title="Estimated Lost Revenue" value={fmtK(searchData.modeledDemandLost)} variant="danger" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="col-span-2 rounded-lg border border-border bg-card p-5">
          <h3 className="mb-4 text-[13px] font-medium text-muted-foreground">Search Loss Opportunities</h3>

          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Search Term
                </th>
                <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Count
                </th>
                <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Conv %
                </th>
                <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Lost Revenue
                </th>
                <th className="pb-2 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Opportunity
                </th>
                <th className="pb-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Suggested Fix
                </th>
                <th className="pb-2 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Trend
                </th>
              </tr>
            </thead>

            <tbody>
              {failedSearchTerms.map((s) => (
                <tr key={s.term} className="border-b border-border last:border-0">
                  <td className="py-2.5 font-mono text-[11px] text-foreground">"{s.term}"</td>

                  <td className="py-2.5 text-right text-foreground">{s.count.toLocaleString()}</td>

                  <td className="py-2.5 text-right">
                    <span className={s.conversion === 0 ? "text-danger font-medium" : "text-muted-foreground"}>
                      {s.conversion}%
                    </span>
                  </td>

                  <td className="py-2.5 text-right font-medium text-danger">
                    ${s.lostRevenue.toLocaleString()}
                  </td>

                  <td className="py-2.5 text-center">
                    <span
                      className={
                        s.opportunityScore === "High"
                          ? "text-danger font-medium"
                          : s.opportunityScore === "Medium"
                          ? "text-warning font-medium"
                          : "text-muted-foreground"
                      }
                    >
                      {s.opportunityScore}
                    </span>
                  </td>

                  <td className="py-2.5 text-left text-muted-foreground">{s.suggestedFix}</td>

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

        <div className="space-y-3">
          <InsightNote text="Search users are high-intent visitors. When they search and get poor results, the store is likely losing revenue from buyers who were already trying to purchase." />

          <InsightNote
            variant="warning"
            text="Zero-result searches are the clearest search loss signal. These are customers explicitly asking for products, part numbers, or categories that the store is not successfully matching."
          />

          <InsightNote text="The fastest wins usually come from synonym mapping, product tagging, part-number redirects, and adding missing landing pages for repeated failed queries." />
        </div>
      </div>
    </div>
  );
};

export default TabSearchDiscovery;