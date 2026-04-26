import { useEffect, useState } from "react";

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

  return new Intl.NumberFormat("en-US").format(value);
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

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
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

  if (loading) {
    return (
      <section className="space-y-6 rounded-[28px] border border-slate-800 bg-slate-950/60 p-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-[0_8px_30px_rgba(2,8,23,0.35)]">
          <p className="text-sm font-medium text-slate-400">
            Loading Search Loss overview...
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
            Search Loss overview could not be loaded
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
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-300/80">
              Search Loss
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Magento search visibility dashboard
            </h1>
            <p className="mt-4 text-base leading-8 text-slate-300 sm:text-lg">
              A standalone read-only visibility layer that shows where on-site
              search may be leaking demand, which failed searches matter most,
              and what actions could reduce missed opportunities.
            </p>
          </div>

          <div className="max-w-md rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-5 py-4 shadow-[0_6px_24px_rgba(2,8,23,0.25)]">
            <p className="text-base font-semibold text-emerald-200">
              Read-only Magento connection
            </p>
            <p className="mt-2 text-sm leading-6 text-emerald-100/85">
              No products, orders, customers, checkout, search settings, or
              storefront behaviour are changed.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-[0_8px_24px_rgba(2,8,23,0.25)]">
          <p className="text-sm font-medium text-slate-400">On-Site Searches</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-white">
            {formatNumber(searchData.totalSearches)}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Total recorded Magento search intent.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-[0_8px_24px_rgba(2,8,23,0.25)]">
          <p className="text-sm font-medium text-slate-400">Failed Searches</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-white">
            {formatNumber(searchData.failedSearches)}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Searches where Magento did not return useful results.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-[0_8px_24px_rgba(2,8,23,0.25)]">
          <p className="text-sm font-medium text-slate-400">
            Zero-Result Rate
          </p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-white">
            {formatPercent(searchData.zeroResultRate)}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Share of search demand that appears unmatched.
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
            Directional value based on AOV and search-to-order rate.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-[0_8px_24px_rgba(2,8,23,0.25)]">
          <h2 className="text-lg font-semibold text-white">
            Search is high-intent demand
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Customers using site search are actively telling the store what they
            want. Failed searches are not just analytics noise — they are
            visible demand that Magento did not satisfy.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-[0_8px_24px_rgba(2,8,23,0.25)]">
          <h2 className="text-lg font-semibold text-white">
            Current missed-demand signal
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
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

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-[0_8px_24px_rgba(2,8,23,0.25)]">
          <h2 className="text-lg font-semibold text-white">
            Useful before a search rebuild
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            This dashboard can create value while a wider search improvement
            project is being prepared by highlighting synonym gaps, product
            tagging issues, category opportunities, and quick merchandising
            fixes.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-sm leading-6 text-slate-300 shadow-[0_8px_24px_rgba(2,8,23,0.25)]">
        <p className="font-semibold text-white">What this dashboard does not do</p>
        <p className="mt-2">
          It does not modify the Magento catalogue, write order/customer data,
          change search configuration, affect checkout, or alter the live
          customer experience. It is a read-only visibility layer designed to
          support better search and merchandising decisions.
        </p>
      </div>
    </section>
  );
}