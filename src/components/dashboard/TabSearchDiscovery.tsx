import { useEffect, useState } from "react";
import KPICard from "./KPICard";
import InsightNote from "./InsightNote";

type SearchData = {
  totalSearches: number;
  failedSearches: number;
  zeroResultRate: number;
  searchToOrderRate: number;
  averageOrderValue: number;
  modeledDemandLost: number;
};

type FailedSearchTerm = {
  term: string;
  count: number;
  conversion: number;
  lostRevenue: number;
  opportunityScore: "High" | "Medium" | "Low";
  fixType: string;
  suggestedFix: string;
  confidence: "High" | "Medium" | "Low";
  trend: "up" | "down" | "stable";
};

type SearchLossResponse = {
  searchData: SearchData;
  failedSearchTerms: FailedSearchTerm[];
};

const fmtCurrency = (n: number) =>
  `$${n.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`;

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
        <h3 className="mb-2 text-sm font-medium text-danger">
          Search Loss data unavailable
        </h3>
        <p className="text-sm text-muted-foreground">{errorMessage}</p>
      </div>
    );
  }

  const { searchData, failedSearchTerms } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KPICard
          title="On-Site Searches"
          value={searchData.totalSearches.toLocaleString()}
          variant="accent"
        />

        <KPICard
          title="Failed Searches"
          value={searchData.failedSearches.toLocaleString()}
          variant="danger"
        />

        <KPICard
          title="Zero-Result Rate"
          value={`${searchData.zeroResultRate}%`}
          variant="danger"
        />

        <KPICard
          title="Estimated Lost Revenue"
          value={fmtCurrency(searchData.modeledDemandLost)}
          variant="danger"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="col-span-2 rounded-lg border border-border bg-card p-5">
          <div className="mb-4">
            <h3 className="text-[13px] font-medium text-muted-foreground">
              Search Loss Opportunities
            </h3>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Ranked by estimated revenue risk, failed search volume, and likely fix type.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-[12px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Search Term
                  </th>
                  <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Count
                  </th>
                  <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Lost Revenue
                  </th>
                  <th className="pb-2 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Opportunity
                  </th>
                  <th className="pb-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Fix Type
                  </th>
                  <th className="pb-2 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Confidence
                  </th>
                  <th className="pb-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Suggested Fix
                  </th>
                </tr>
              </thead>

              <tbody>
                {failedSearchTerms.map((s) => (
                  <tr key={s.term} className="border-b border-border last:border-0">
                    <td className="max-w-[150px] py-3 pr-3 font-mono text-[11px] text-foreground">
                      "{s.term}"
                    </td>

                    <td className="py-3 text-right text-foreground">
                      {s.count.toLocaleString()}
                    </td>

                    <td className="py-3 text-right font-medium text-danger">
                      {fmtCurrency(s.lostRevenue)}
                    </td>

                    <td className="py-3 text-center">
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

                    <td className="max-w-[160px] py-3 pl-3 text-left text-foreground">
                      {s.fixType}
                    </td>

                    <td className="py-3 text-center">
                      <span
                        className={
                          s.confidence === "High"
                            ? "text-success font-medium"
                            : s.confidence === "Medium"
                            ? "text-warning font-medium"
                            : "text-muted-foreground"
                        }
                      >
                        {s.confidence}
                      </span>
                    </td>

                    <td className="max-w-[360px] py-3 pl-3 text-left text-muted-foreground">
                      {s.suggestedFix}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3">
          <InsightNote text="Search is high-intent demand. These are customers telling the store exactly what they want, but Magento is not successfully matching them to products." />

          <InsightNote
            variant="warning"
            text={`${searchData.zeroResultRate}% of recorded searches currently return zero results. That represents ${searchData.failedSearches.toLocaleString()} failed search events from ${searchData.totalSearches.toLocaleString()} total searches.`}
          />

          <InsightNote
            text={`Estimated lost revenue is modeled from failed searches, average order value (${fmtCurrency(
              searchData.averageOrderValue
            )}), and observed search-to-order rate (${searchData.searchToOrderRate}%). Treat this as directional revenue recovery potential, not exact accounting.`}
          />
        </div>
      </div>
    </div>
  );
};

export default TabSearchDiscovery;