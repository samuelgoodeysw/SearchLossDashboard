import { useEffect, useState } from "react";
import { clientConfig } from "@/config/client";

type SearchData = {
  totalSearches?: number;
  failedSearches?: number;
  zeroResultRate?: number;
  searchToOrderRate?: number;
  averageOrderValue?: number;
  modeledDemandLost?: number;
};

type SearchLossResponse = {
  searchData?: SearchData;
};

function formatNumber(value?: number): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "0";
  }

  return new Intl.NumberFormat(clientConfig.locale).format(value);
}

function formatPercent(value?: number): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "0%";
  }

  return `${value.toFixed(1)}%`;
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

export default function TabSearchOverview() {
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
  const hasAnySearchSignal =
    (searchData.totalSearches || 0) > 0 ||
    (searchData.failedSearches || 0) > 0 ||
    (searchData.modeledDemandLost || 0) > 0;

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-sm font-medium text-slate-300">
            Loading dashboard overview...
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Checking the latest Magento search signals.
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
            Dashboard overview could not be loaded
          </h2>
          <p className="mt-2 text-xs leading-5 text-red-300">
            The dashboard could not connect to the read-only Magento data
            source.
          </p>
          <p className="mt-2 text-xs leading-5 text-red-300/90">
            No store data has been changed. Check the Magento API URL, access
            token, and dashboard environment settings.
          </p>
          <p className="mt-2 text-[11px] leading-5 text-red-300/70">
            Technical detail: {errorMessage}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/70 p-4 shadow-[0_8px_24px_rgba(2,8,23,0.25)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-300/80">
          {clientConfig.productName}
        </p>

        <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-white sm:text-2xl">
          Magento search visibility dashboard
        </h1>

        <p className="mt-2 max-w-4xl text-xs leading-5 text-slate-300 sm:text-sm">
          Customers are telling you what they want. This dashboard shows where
          the website may not be connecting that demand to useful products,
          categories, synonyms, or search results.
        </p>
      </div>

      {!hasAnySearchSignal ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-[0_8px_20px_rgba(2,8,23,0.22)]">
          <h2 className="text-sm font-semibold text-white">
            No search signal found yet
          </h2>
          <p className="mt-2 max-w-4xl text-xs leading-5 text-slate-400">
            The dashboard connected successfully, but there is not enough
            Magento search activity to show missed-demand insights yet. Once
            searches are recorded, this overview will show volume, failed
            searches, zero-result rate, and estimated demand at risk.
          </p>
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-[0_8px_20px_rgba(2,8,23,0.22)]">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            On-Site Searches
          </p>
          <p className="mt-1.5 text-2xl font-semibold tracking-tight text-white">
            {formatNumber(searchData.totalSearches)}
          </p>
          <p className="mt-1.5 text-xs leading-5 text-slate-400">
            Recorded Magento search intent.
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
            Searches without useful results.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-[0_8px_20px_rgba(2,8,23,0.22)]">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Zero-Result Rate
          </p>
          <p className="mt-1.5 text-2xl font-semibold tracking-tight text-white">
            {formatPercent(searchData.zeroResultRate)}
          </p>
          <p className="mt-1.5 text-xs leading-5 text-slate-400">
            Search demand that appears unmatched.
          </p>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900 to-blue-950/60 p-4 shadow-[0_8px_20px_rgba(2,8,23,0.22)]">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-300">
            Estimated Revenue at Risk
          </p>
          <p className="mt-1.5 text-2xl font-semibold tracking-tight text-white">
            {formatCurrency(searchData.modeledDemandLost)}
          </p>
          <p className="mt-1.5 text-xs leading-5 text-slate-300/80">
            Based on AOV and search-to-order rate.
          </p>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-[0_8px_20px_rgba(2,8,23,0.22)]">
          <h2 className="text-sm font-semibold text-white">
            Search is high-intent demand
          </h2>
          <p className="mt-1.5 text-xs leading-5 text-slate-300">
            Customers using site search are actively telling the store what they
            want. Failed searches are visible demand that Magento did not
            satisfy.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-[0_8px_20px_rgba(2,8,23,0.22)]">
          <h2 className="text-sm font-semibold text-white">
            Current missed-demand signal
          </h2>
          <p className="mt-1.5 text-xs leading-5 text-slate-300">
            Magento recorded{" "}
            <span className="font-semibold text-white">
              {formatNumber(searchData.failedSearches)}
            </span>{" "}
            failed searches from{" "}
            <span className="font-semibold text-white">
              {formatNumber(searchData.totalSearches)}
            </span>{" "}
            total searches, giving a zero-result rate of{" "}
            <span className="font-semibold text-white">
              {formatPercent(searchData.zeroResultRate)}
            </span>
            .
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-[0_8px_20px_rgba(2,8,23,0.22)]">
          <h2 className="text-sm font-semibold text-white">
            Useful before a search rebuild
          </h2>
          <p className="mt-1.5 text-xs leading-5 text-slate-300">
            Helps identify wording gaps, product data issues, visibility
            problems, category opportunities, and quick Magento search fixes
            while a wider search improvement project is prepared.
          </p>
        </div>
      </div>
    </section>
  );
}