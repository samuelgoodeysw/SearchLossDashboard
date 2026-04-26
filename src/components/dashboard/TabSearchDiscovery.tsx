import { useEffect, useMemo, useState } from "react";
import { clientConfig } from "@/config/client";

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

type SortMode = "revenue-desc" | "searches-desc" | "term-asc";

function formatNumber(value?: number): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "0";
  }

  return new Intl.NumberFormat(clientConfig.locale).format(value);
}

function formatCurrency(value?: number): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "$0";
  }

  return new Intl.NumberFormat(clientConfig.locale, {
    style: "currency",
    currency: clientConfig.currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function escapeCsvValue(value: string | number | undefined | null): string {
  if (value === undefined || value === null) {
    return "";
  }

  const stringValue = String(value);
  const escapedValue = stringValue.replace(/"/g, '""');

  return `"${escapedValue}"`;
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

  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [fixTypeFilter, setFixTypeFilter] = useState("all");
  const [sortMode, setSortMode] = useState<SortMode>("revenue-desc");

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

  const fixTypeOptions = useMemo(() => {
    const uniqueFixTypes = new Set<string>();

    failedSearchTerms.forEach((item) => {
      if (item.fixType) {
        uniqueFixTypes.add(item.fixType);
      }
    });

    return Array.from(uniqueFixTypes).sort((a, b) => a.localeCompare(b));
  }, [failedSearchTerms]);

  const filteredTerms = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = failedSearchTerms.filter((item) => {
      const matchesSearch = !query || item.term.toLowerCase().includes(query);

      const matchesPriority =
        priorityFilter === "all" ||
        (item.opportunityScore || "").toLowerCase() === priorityFilter;

      const matchesFixType =
        fixTypeFilter === "all" || item.fixType === fixTypeFilter;

      return matchesSearch && matchesPriority && matchesFixType;
    });

    return [...filtered].sort((a, b) => {
      if (sortMode === "searches-desc") {
        return (b.count || 0) - (a.count || 0);
      }

      if (sortMode === "term-asc") {
        return a.term.localeCompare(b.term);
      }

      return (b.lostRevenue || 0) - (a.lostRevenue || 0);
    });
  }, [failedSearchTerms, searchQuery, priorityFilter, fixTypeFilter, sortMode]);

  function clearFilters() {
    setSearchQuery("");
    setPriorityFilter("all");
    setFixTypeFilter("all");
    setSortMode("revenue-desc");
  }

  function exportCsv() {
    const headers = [
      "Term",
      "Searches",
      "Revenue at Risk",
      "Priority",
      "Fix Type",
      "Confidence",
      "Trend",
      "Suggested Action",
    ];

    const rows = filteredTerms.map((item) => [
      item.term,
      item.count,
      item.lostRevenue || 0,
      item.opportunityScore || "Review",
      item.fixType || "Review required",
      item.confidence || "Unknown",
      item.trend || "",
      item.suggestedFix || "Review this search term manually.",
    ]);

    const csvContent = [
      headers.map(escapeCsvValue).join(","),
      ...rows.map((row) => row.map(escapeCsvValue).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `search-loss-opportunities-${date}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-sm font-medium text-slate-400">
            Loading failed search opportunities...
          </p>
          <div className="mt-3 h-2 w-48 animate-pulse rounded-full bg-slate-800" />
          <div className="mt-2 h-2 w-72 max-w-full animate-pulse rounded-full bg-slate-800" />
        </div>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
        <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-4">
          <h2 className="text-sm font-semibold text-red-200">
            Failed search opportunities could not be loaded
          </h2>
          <p className="mt-2 text-xs text-red-300">{errorMessage}</p>
          <p className="mt-2 text-xs text-red-300/90">
            Check that the Vercel API route is running and that the Magento API
            URL/token are set correctly.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-[0_8px_20px_rgba(2,8,23,0.22)]">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Ranked Terms
          </p>
          <p className="mt-1.5 text-2xl font-semibold tracking-tight text-white">
            {formatNumber(failedSearchTerms.length)}
          </p>
          <p className="mt-1.5 text-xs leading-5 text-slate-400">
            Search terms prioritised for review.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-[0_8px_20px_rgba(2,8,23,0.22)]">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Failed Searches
          </p>
          <p className="mt-1.5 text-2xl font-semibold tracking-tight text-white">
            {formatNumber(searchData.failedSearches)}
          </p>
          <p className="mt-1.5 text-xs leading-5 text-slate-400">
            Failed searches visible in Magento data.
          </p>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 shadow-[0_8px_20px_rgba(2,8,23,0.22)]">
          <p className="text-[11px] font-medium uppercase tracking-wide text-blue-200/80">
            Top Opportunity
          </p>
          <p className="mt-1.5 truncate text-2xl font-semibold tracking-tight text-white">
            {topOpportunityTerm?.term || "None yet"}
          </p>
          <p className="mt-1.5 text-xs leading-5 text-blue-100/75">
            {topOpportunityTerm
              ? `${formatCurrency(
                  topOpportunityTerm.lostRevenue
                )} estimated revenue at risk.`
              : "No failed search opportunity returned yet."}
          </p>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900 to-blue-950/60 p-4 shadow-[0_8px_20px_rgba(2,8,23,0.22)]">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-300">
            Revenue at Risk
          </p>
          <p className="mt-1.5 text-2xl font-semibold tracking-tight text-white">
            {formatCurrency(searchData.modeledDemandLost)}
          </p>
          <p className="mt-1.5 text-xs leading-5 text-slate-300/80">
            Directional value across failed demand.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 shadow-[0_8px_20px_rgba(2,8,23,0.22)]">
        <div className="grid gap-2 lg:grid-cols-[1.3fr_0.8fr_1fr_0.8fr_auto_auto]">
          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Search terms
            </label>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by customer search term..."
              className="h-9 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-xs text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Priority
            </label>
            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              className="h-9 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-xs text-slate-100 outline-none transition focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15"
            >
              <option value="all">All priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Fix type
            </label>
            <select
              value={fixTypeFilter}
              onChange={(event) => setFixTypeFilter(event.target.value)}
              className="h-9 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-xs text-slate-100 outline-none transition focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15"
            >
              <option value="all">All fix types</option>
              {fixTypeOptions.map((fixType) => (
                <option key={fixType} value={fixType}>
                  {fixType}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Sort by
            </label>
            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as SortMode)}
              className="h-9 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-xs text-slate-100 outline-none transition focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15"
            >
              <option value="revenue-desc">Revenue at risk</option>
              <option value="searches-desc">Search volume</option>
              <option value="term-asc">Term A-Z</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={clearFilters}
              className="h-9 rounded-xl border border-slate-700 px-3 text-xs font-semibold text-slate-300 transition hover:border-slate-500 hover:bg-slate-800"
            >
              Reset
            </button>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={exportCsv}
              disabled={filteredTerms.length === 0}
              className="h-9 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 text-xs font-semibold text-blue-100 transition hover:border-blue-400/60 hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-900 disabled:text-slate-600"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-[0_8px_24px_rgba(2,8,23,0.25)]">
        <div className="border-b border-slate-800 bg-slate-900/95 px-4 py-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-white">
                Ranked search fixes
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Demand signal, revenue at risk, likely fix type, confidence, and
                suggested next action.
              </p>
            </div>

            <p className="text-xs text-slate-500">
              Showing {formatNumber(filteredTerms.length)} of{" "}
              {formatNumber(failedSearchTerms.length)} terms
            </p>
          </div>
        </div>

        {filteredTerms.length === 0 ? (
          <div className="p-5 text-xs text-slate-300">
            No failed search terms match the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed divide-y divide-slate-800">
              <thead className="bg-slate-950/60">
                <tr>
                  <th className="w-[18%] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Term
                  </th>
                  <th className="w-[9%] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Searches
                  </th>
                  <th className="w-[11%] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Revenue at Risk
                  </th>
                  <th className="w-[10%] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Priority
                  </th>
                  <th className="w-[16%] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Fix Type
                  </th>
                  <th className="w-[10%] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Confidence
                  </th>
                  <th className="w-[26%] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Suggested Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {filteredTerms.map((item) => (
                  <tr
                    key={item.term}
                    className="align-top transition-colors hover:bg-slate-800/50"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-white">
                        {item.term}
                      </p>
                      {item.trend ? (
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          Trend: {item.trend}
                        </p>
                      ) : null}
                    </td>

                    <td className="px-4 py-3 text-xs font-medium text-slate-200">
                      {formatNumber(item.count)}
                    </td>

                    <td className="px-4 py-3 text-xs font-semibold text-white">
                      {formatCurrency(item.lostRevenue)}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getPriorityClasses(
                          item.opportunityScore
                        )}`}
                      >
                        {item.opportunityScore || "Review"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-xs leading-5 text-slate-300">
                      {item.fixType || "Review required"}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getConfidenceClasses(
                          item.confidence
                        )}`}
                      >
                        {item.confidence || "Unknown"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-xs leading-5 text-slate-300">
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