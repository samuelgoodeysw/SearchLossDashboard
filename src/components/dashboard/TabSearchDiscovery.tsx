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
  confidence: "High" | "Medium" | "Low";
  suggestedFix: string;
  trend: "up" | "down" | "stable";
};

type SearchLossResponse = {
  searchData: SearchData;
  failedSearchTerms: FailedSearchTerm[];
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(value);

const formatPercent = (value: number) => `${value.toFixed(2)}%`;

const scoreClassName = (score: "High" | "Medium" | "Low") => {
  if (score === "High") return "text-danger font-medium";
  if (score === "Medium") return "text-warning font-medium";
  return "text-muted-foreground";
};

const confidenceClassName = (confidence: "High" | "Medium" | "Low") => {
  if (confidence === "High") return "text-success font-medium";
  if (confidence === "Medium") return "text-warning font-medium";
  return "text-muted-foreground";
};

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
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
          value={formatPercent(searchData.zeroResultRate)}
          variant="danger"
        />

        <KPICard
          title="Estimated Lost Revenue"
          value={formatCurrency(searchData.modeledDemandLost)}
          variant="danger"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <InsightNote text="Search is high-intent demand. These are customers telling the store exactly what they want, but Magento is not successfully matching them to products." />

        <InsightNote
          variant="warning"
          text={`${formatPercent(
            searchData.zeroResultRate
          )} of recorded searches currently return zero results. That represents ${searchData.failedSearches.toLocaleString()} failed search events from ${searchData.totalSearches.toLocaleString()} total searches.`}
        />

        <InsightNote
          text={`Estimated lost revenue is modeled from failed searches, average order value (${formatCurrency(
            searchData.averageOrderValue
          )}), and observed search-to-order rate (${formatPercent(
            searchData.searchToOrderRate
          )}). Treat this as directional revenue recovery potential, not exact accounting.`}
        />
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="mb-5">
          <h3 className="text-[13px] font-medium text-muted-foreground">
            Search Loss Opportunities
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Ranked by estimated revenue risk, failed search volume, and likely
            fix type.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] table-fixed text-[12px]">
            <colgroup>
              <col className="w-[170px]" />
              <col className="w-[80px]" />
              <col className="w-[115px]" />
              <col className="w-[115px]" />
              <col className="w-[190px]" />
              <col className="w-[115px]" />
              <col />
            </colgroup>

            <thead>
              <tr className="border-b border-border">
                <th className="whitespace-nowrap pb-3 pr-4 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Term
                </th>

                <th className="whitespace-nowrap pb-3 pr-4 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Searches
                </th>

                <th className="whitespace-nowrap pb-3 pr-4 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Lost Rev.
                </th>

                <th className="whitespace-nowrap pb-3 pr-4 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Priority
                </th>

                <th className="whitespace-nowrap pb-3 pr-4 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Fix Type
                </th>

                <th className="whitespace-nowrap pb-3 pr-4 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Confidence
                </th>

                <th className="whitespace-nowrap pb-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Suggested Action
                </th>
              </tr>
            </thead>

            <tbody>
              {failedSearchTerms.map((term) => (
                <tr
                  key={term.term}
                  className="border-b border-border align-top last:border-0"
                >
                  <td className="py-4 pr-4 font-mono text-[11px] leading-relaxed text-foreground">
                    "{term.term}"
                  </td>

                  <td className="py-4 pr-4 text-right text-foreground">
                    {term.count.toLocaleString()}
                  </td>

                  <td className="py-4 pr-4 text-right font-medium text-danger">
                    {formatCurrency(term.lostRevenue)}
                  </td>

                  <td className="py-4 pr-4 text-center">
                    <span className={scoreClassName(term.opportunityScore)}>
                      {term.opportunityScore}
                    </span>
                  </td>

                  <td className="py-4 pr-4 font-medium leading-relaxed text-foreground">
                    {term.fixType}
                  </td>

                  <td className="py-4 pr-4 text-center">
                    <span className={confidenceClassName(term.confidence)}>
                      {term.confidence}
                    </span>
                  </td>

                  <td className="py-4 leading-relaxed text-muted-foreground">
                    {term.suggestedFix}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TabSearchDiscovery;