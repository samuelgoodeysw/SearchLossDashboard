import { useEffect, useMemo, useState } from "react";

type SearchData = {
  totalSearches?: number;
  failedSearches?: number;
  zeroResultRate?: number;
  searchToOrderRate?: number;
  averageOrderValue?: number;
  modeledDemandLost?: number;
};

type FailedSearchTerm = {
  term: string;
  count: number;
  conversion?: number;
  lostRevenue?: number;
  opportunityScore?: string;
  fixType?: string;
  suggestedFix?: string;
  confidence?: string;
  trend?: string;
};

type SearchLossResponse = {
  searchData?: SearchData;
  failedSearchTerms?: FailedSearchTerm[];
};

function formatNumber(value?: number): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "0";
  }

  return new Intl.NumberFormat("en-US").format(value);
}

function formatCurrency(value?: number): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "$0";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function getPriorityClasses(priority?: string): string {
  switch ((priority || "").toLowerCase()) {
    case "high":
      return "border-red-500/30 bg-red-500/10 text-red-300";
    case "medium":
      return "border-amber-500/30 bg-amber-500/10 text-amber-300";
    case "low":
      return "border-slate-600 bg-slate-800/80 text-slate-300";
    default:
      return "border-slate-600 bg-slate-800/80 text-slate-300";
  }
}

function getConfidenceClasses(confidence?: string): string {
  switch ((confidence || "").toLowerCase()) {
    case "high":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    case "medium":
      return "border-blue-500/30 bg-blue-500/10 text-blue-300";
    case "low":
      return "border-slate-600 bg-slate-800/80 text-slate-300";
    default:
      return "border-slate-600 bg-slate-800/80 text-slate-300";
  }
}

export default function TabSearchDiscovery() {
  const [data, setData] = useState<SearchLossResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchSearchLossData() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch("/api/search-loss");

        if (!response.ok) {
          throw new Error(`Search Loss API returned ${response.status}`);
        }

        const payload = (await response.json()) as SearchLossResponse;

        if (isMounted) {
          setData(payload);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load Search Loss data."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchSearchLossData();

    return () => {
      isMounted = false;
    };
  }, []);

  const searchData = data?.searchData || {};
  const failedSearchTerms = data?.failedSearchTerms || [];

  const topOpportunityTerm = useMemo(() => {
    if (!failedSearchTerms.length) {
      return null;
    }

    return failedSearchTerms.reduce((highest, current) => {
      const highestRevenue = highest.lostRevenue || 0;
      const currentRevenue = current.lostRevenue || 0;

      return currentRevenue > highestRevenue ? current : highest;
    }, failedSearchTerms[0]);
  }, [failedSearchTerms]);

  if (loading) {
    return (
      <section className="space-y-6 rounded-[28px] border border-slate-800 bg-slate-950/60 p-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-[0_8px_30px_rgba(2,8,23,0.35)]">
          <p className="text-sm font-medium text-slate-400">
            Loading failed search opportunities...
          </p>
          <div className="mt-4 h-3 w-64 animate-pulse rounded-full bg-slate-800" />
          <div className="mt-3 h-3 w-96 max-w-full animate-pulse rounded-full bg-slate-800" />
        </div>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="space-y-6 rounded-[28px] border border-slate-800 bg-slate-950/60 p-6">
        <div className="rounded-3xl border border-red-500/30 bg-red-950/30 p-8 shadow-[0_8px_30px_rgba(2,8,23,0.35)]">
          <h2 className="text-lg font-semibold text-red-200">
            Failed search opportunities could not be loaded
          </h2>
          <p className="mt-2 text-sm text-red-300">{errorMessage}</p>
          <p className="mt-4 text-sm text-red-300/90">
            Check that the Vercel API route is running and that the Magento API
            URL/token are set correctly.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6 rounded-[28px] border border-slate-800 bg-slate-950/60 p-6">
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/70 p-7 shadow-[0_8px_30px_rgba(2,8,23,0.35)]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-300/80">
              Opportunities
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Failed search opportunities
            </h1>
            <p className="mt-4 text-base leading-8 text-slate-300 sm:text-lg">
              Ranked search terms where customer intent appears to be unmatched.
              Use this view to decide which search, catalogue, synonym, redirect,
              or merchandising fixes should be reviewed first.
            </p>
          </div>

          {topOpportunityTerm ? (
            <div className="max-w-md rounded-2xl border border-blue-500/20 bg-blue-500/10 px-5 py-4 shadow-[0_6px_24px_rgba(2,8,23,0.25)]">
              <p className="text-sm font-medium text-blue-200/80">
                Top opportunity
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {topOpportunityTerm.term}
              </p>
              <p className="mt-1 text-sm text-blue-100/75">
                {formatCurrency(topOpportunityTerm.lostRevenue)} estimated
                revenue at risk.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-[0_8px_24px_rgba(2,8,23,0.25)]">
          <p className="text-sm font-medium text-slate-400">
            Failed Searches
          </p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-white">
            {formatNumber(searchData.failedSearches)}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Total failed searches currently visible in Magento data.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-[0_8px_24px_rgba(2,8,23,0.25)]">
          <p className="text-sm font-medium text-slate-400">
            Opportunity Terms
          </p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-white">
            {formatNumber(failedSearchTerms.length)}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Ranked terms with likely missed-demand opportunities.
          </p>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900 to-blue-950/60 p-5 shadow-[0_8px_24px_rgba(2,8,23,0.25)]">
          <p className="text-sm font-medium text-slate-300">
            Estimated Revenue at Risk
          </p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-white">
            {formatCurrency(searchData.modeledDemandLost)}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-300/80">
            Directional value across failed search demand.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-[0_8px_30px_rgba(2,8,23,0.35)]">
        <div className="border-b border-slate-800 bg-slate-900/95 p-6">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Ranked search fixes
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Each row combines demand signal, estimated revenue at risk,
              likely fix type, confidence, and a suggested next action.
            </p>
          </div>
        </div>

        {failedSearchTerms.length === 0 ? (
          <div className="p-8 text-sm text-slate-300">
            No failed search terms were returned by the API.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed divide-y divide-slate-800">
              <thead className="bg-slate-950/60">
                <tr>
                  <th className="w-[18%] px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Term
                  </th>
                  <th className="w-[9%] px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Searches
                  </th>
                  <th className="w-[11%] px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Revenue at Risk
                  </th>
                  <th className="w-[10%] px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Priority
                  </th>
                  <th className="w-[16%] px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Fix Type
                  </th>
                  <th className="w-[10%] px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Confidence
                  </th>
                  <th className="w-[26%] px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Suggested Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {failedSearchTerms.map((item) => (
                  <tr
                    key={item.term}
                    className="align-top transition-colors hover:bg-slate-800/50"
                  >
                    <td className="px-5 py-5">
                      <p className="font-semibold text-white">{item.term}</p>
                      {item.trend ? (
                        <p className="mt-1 text-xs text-slate-400">
                          Trend: {item.trend}
                        </p>
                      ) : null}
                    </td>

                    <td className="px-5 py-5 text-sm font-medium text-slate-200">
                      {formatNumber(item.count)}
                    </td>

                    <td className="px-5 py-5 text-sm font-semibold text-white">
                      {formatCurrency(item.lostRevenue)}
                    </td>

                    <td className="px-5 py-5">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getPriorityClasses(
                          item.opportunityScore
                        )}`}
                      >
                        {item.opportunityScore || "Review"}
                      </span>
                    </td>

                    <td className="px-5 py-5 text-sm text-slate-300">
                      {item.fixType || "Review required"}
                    </td>

                    <td className="px-5 py-5">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getConfidenceClasses(
                          item.confidence
                        )}`}
                      >
                        {item.confidence || "Unknown"}
                      </span>
                    </td>

                    <td className="px-5 py-5 text-sm leading-6 text-slate-300">
                      {item.suggestedFix || "Review this search term manually."}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}