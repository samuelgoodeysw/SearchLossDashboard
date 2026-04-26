import { Fragment, useEffect, useMemo, useState } from "react";
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

function getIssueLabel(item: FailedSearchTerm): string {
  const fixType = (item.fixType || "").toLowerCase();

  if (fixType.includes("visibility") || fixType.includes("availability")) {
    return "Product exists but is not showing";
  }

  if (fixType.includes("synonym") || fixType.includes("terminology")) {
    return "Customers use different wording";
  }

  if (fixType.includes("part") || fixType.includes("sku")) {
    return "SKU or part number is not matching";
  }

  if (fixType.includes("brand") || fixType.includes("tagging")) {
    return "Brand or product terms are missing";
  }

  if (fixType.includes("spelling") || fixType.includes("formatting")) {
    return "Spelling or format variant";
  }

  if (fixType.includes("data quality") || fixType.includes("weak data")) {
    return "Product data is too weak";
  }

  if (fixType.includes("relevance") || fixType.includes("ranking")) {
    return "Results are weak or badly ranked";
  }

  if (fixType.includes("coverage") || fixType.includes("category")) {
    return "Product or category may be missing";
  }

  if (
    fixType.includes("fitment") ||
    fixType.includes("compatibility") ||
    fixType.includes("long-tail")
  ) {
    return "Fitment or use case is unclear";
  }

  if (fixType.includes("ambiguous") || fixType.includes("broad")) {
    return "Search term is too broad or unclear";
  }

  if (fixType.includes("configuration") || fixType.includes("search config")) {
    return "Search is not looking at the right data";
  }

  if (
    fixType.includes("replacement") ||
    fixType.includes("supersession") ||
    fixType.includes("superseded")
  ) {
    return "Old or alternate part number is not connected";
  }

  return "Needs manual review";
}

function getLikelyIssue(item: FailedSearchTerm): string {
  const issueLabel = getIssueLabel(item);

  switch (issueLabel) {
    case "Product exists but is not showing":
      return "A matching product may exist, but Magento may not be showing it in search or on the storefront.";

    case "Customers use different wording":
      return "Customers may be using different words than the catalogue uses.";

    case "SKU or part number is not matching":
      return "This may be a SKU, part number, manufacturer number, old part number, or customer part number that search is not matching correctly.";

    case "Brand or product terms are missing":
      return "This looks like a brand or product search, but relevant products may not include the right brand, manufacturer, model, or product-type data.";

    case "Spelling or format variant":
      return "Customers may be using a typo, abbreviation, singular/plural form, spacing variant, or punctuation variant.";

    case "Product data is too weak":
      return "The product may exist, but the catalogue data may not describe it well enough for customers or search.";

    case "Results are weak or badly ranked":
      return "The right products may exist, but they may be buried under weaker or irrelevant results.";

    case "Product or category may be missing":
      return "Customers may be searching for a product or category the store does not clearly offer, or does not expose well.";

    case "Fitment or use case is unclear":
      return "The search may describe a specific application, compatibility need, model, size, material, system, or use case that current product data does not clearly answer.";

    case "Search term is too broad or unclear":
      return "The term may be too broad or could mean multiple different products or categories.";

    case "Search is not looking at the right data":
      return "Search may not be using the right product fields, search settings, or indexed data.";

    case "Old or alternate part number is not connected":
      return "Customers may be searching for an old, alternate, replacement, or superseded part number that is not connected to the current product.";

    default:
      return "The term shows customer demand, but the likely cause needs manual review.";
  }
}

function getSuggestedAction(item: FailedSearchTerm): string {
  const issueLabel = getIssueLabel(item);
  const term = item.term || "this search term";
  const quotedTerm = `"${term}"`;

  switch (issueLabel) {
    case "Product exists but is not showing":
      return `Check whether the product matching ${quotedTerm} is enabled, visible in catalogue/search, in stock/salable, assigned to a category, and available on the storefront.`;

    case "Customers use different wording":
      return `Check whether ${quotedTerm} means the same thing as an existing product or category. If it does, add it as a synonym or searchable term, and update product/category copy only where the wording is accurate and natural.`;

    case "SKU or part number is not matching":
      return `Check whether ${quotedTerm} matches a SKU, manufacturer part number, alternate part number, old part number, replacement part, barcode, or common customer-used format. Prioritise exact and normalised matches before broad keyword results.`;

    case "Brand or product terms are missing":
      return `Check whether matching products have the right brand, manufacturer, product family, model, and product-type data. If products exist, add the missing terms to searchable attributes and improve product naming or copy where useful.`;

    case "Spelling or format variant":
      return `Check whether ${quotedTerm} is a common typo, abbreviation, spacing, punctuation, or singular/plural variant. Add it only when the intended product is clear, and avoid broad matches for SKU-like terms.`;

    case "Product data is too weak":
      return `Improve product data such as name, SKU, brand, manufacturer part number, compatibility data, dimensions, material, description, and other searchable fields so search has enough accurate information to match ${quotedTerm}.`;

    case "Results are weak or badly ranked":
      return `Search ${quotedTerm} manually and review the top results. If the right products exist but rank poorly, adjust searchable attributes, search weights, product data, ranking rules, or merchandising boosts.`;

    case "Product or category may be missing":
      return `Check whether the store sells ${quotedTerm}, an equivalent product, or a close substitute. If it exists, improve findability. If not, treat repeated searches as catalogue demand or route customers to the closest helpful alternative.`;

    case "Fitment or use case is unclear":
      return `Check whether ${quotedTerm} describes a specific application, compatibility need, model, size, or use case. If relevant products exist, add structured fitment data and clear product copy that connects the need to the right products.`;

    case "Search term is too broad or unclear":
      return `Do not force a narrow synonym or redirect for ${quotedTerm}. Help customers narrow the search with better categories, filters, suggested terms, and result ordering.`;

    case "Search is not looking at the right data":
      return `Review whether the right product fields are searchable, weighted correctly, indexed properly, and supported by the active Magento search engine or search extension.`;

    case "Old or alternate part number is not connected":
      return `Check whether ${quotedTerm} is an old, alternate, replacement, superseded, or cross-reference part number. If it is, connect it to the current valid product as searchable data.`;

    default:
      if (item.suggestedFix) {
        return item.suggestedFix;
      }

      return `Check whether ${quotedTerm} maps to a product, category, SKU, brand, synonym, redirect, compatibility need, or catalogue gap. If it repeats or has high revenue at risk, assign it to a clearer fix type after review.`;
  }
}

function getPlainEnglishMeaning(item: FailedSearchTerm): string {
  const term = item.term || "this search term";

  return `Customers are telling you they want "${term}", but the website may not be connecting that demand to a useful product, category, synonym, or search result.`;
}

function getMagentoFixSteps(item: FailedSearchTerm): string[] {
  const issueLabel = getIssueLabel(item);
  const term = item.term || "this search term";

  switch (issueLabel) {
    case "Product exists but is not showing":
      return [
        "Check product status.",
        "Check product visibility includes catalogue/search where appropriate.",
        "Check stock and salable status.",
        "Check category assignment.",
        "Check that matching products are enabled, visible in catalogue/search, in stock, and available on the storefront.",
        "For B2B stores, check customer group, shared catalogue, company restrictions, and price visibility.",
        "For configurable, grouped, or bundle products, check whether matching child product data is available on the visible parent product.",
        "Reindex Magento catalogue/search data, flush relevant caches if needed, and test the search again.",
      ];

    case "Customers use different wording":
      return [
        `Check whether "${term}" maps to an existing product or category.`,
        "Add a synonym only if the customer phrase and catalogue phrase mean the same thing.",
        "Add the phrase to appropriate searchable product fields where accurate and natural, such as product name, description, brand, manufacturer part number, compatibility data, or a dedicated search keyword field if the store uses one.",
        "Do not force broad or loosely related terms into synonyms.",
        "Make sure the relevant product attributes are searchable.",
        "Apply the change in the right store view/language where relevant.",
        "Reindex Magento catalogue/search data and test the search again.",
      ];

    case "SKU or part number is not matching":
      return [
        "Make sure SKU is searchable.",
        "Add manufacturer part numbers as searchable attributes.",
        "Add alternate part numbers, old part numbers, replacement numbers, and cross-reference numbers where relevant.",
        "Check spacing, hyphens, dots, slashes, prefixes, leading zeros, and unit variants, such as 10mm, 10 mm, and 10-millimeter.",
        `Check whether "${term}" matches a real SKU, part number, or customer-used variant.`,
        "Check whether the match is on a child/variant product and whether that data is available on the visible parent product.",
        "Review search weights, for example giving SKU, part number, brand, and product name more influence than long descriptions.",
        "Prioritise exact and normalised matches, such as ABC-123, ABC 123, and ABC123, before broader keyword results.",
        "Reindex Magento catalogue/search data and test the search again.",
      ];

    case "Brand or product terms are missing":
      return [
        "Check brand/manufacturer attribute values.",
        "Check product family, model, and part-type data.",
        "Add common brand aliases or old brand names where relevant.",
        `Add related product terms from "${term}" to appropriate searchable product fields, such as product name, brand, manufacturer, model, part type, description, or a dedicated search keyword field if the store uses one.`,
        "Make brand/manufacturer searchable where useful.",
        "Consider category-brand landing pages for repeated high-volume brand/product combinations.",
        "Reindex Magento catalogue/search data and test the search again.",
      ];

    case "Spelling or format variant":
      return [
        `Check whether "${term}" is a typo, abbreviation, singular/plural form, spacing variant, punctuation variant, or unit variant.`,
        "Add safe spelling variants as synonyms or searchable terms only when the intended product is clear.",
        "For SKU-like terms, prefer normalisation and exact matching over broad synonyms.",
        "Review typo tolerance or fuzzy matching if using Elasticsearch, OpenSearch, or a search extension.",
        "Do not add variants that could map to the wrong product family.",
        "Reindex Magento catalogue/search data and test the search again.",
      ];

    case "Product data is too weak":
      return [
        "Improve product data such as name, SKU, brand, manufacturer part number, compatibility data, dimensions, material, description, and other relevant searchable fields.",
        "Improve product copy where accurate and natural.",
        "Add manufacturer part number, compatibility, fitment, dimensions, material, or use-case data where relevant.",
        "Avoid making noisy or internal-only attributes searchable.",
        "Review search weights, for example giving SKU, part number, brand, and product name more influence than long descriptions.",
        "Reindex Magento catalogue/search data and test the search again.",
      ];

    case "Results are weak or badly ranked":
      return [
        `Search "${term}" manually and review the top results, not just whether any results exist.`,
        "Make exact matches beat fuzzy or partial matches where possible.",
        "Give SKU, manufacturer part number, brand, product name, and key compatibility fields stronger search weight than long descriptions.",
        "Reduce noisy attributes if they pollute results, such as internal notes or fields customers would not search for.",
        "Boost relevant products or categories where the search tool supports it.",
        "If using Algolia, Klevu, Searchspring, Hawksearch, Adobe Live Search, or another search tool, tune ranking there.",
        "Reindex or refresh search data and test again.",
      ];

    case "Product or category may be missing":
      return [
        `Check whether "${term}" maps to an existing product or category.`,
        "Check whether the store sells this product, an equivalent product, or a close substitute.",
        "If matching products exist, improve searchable fields such as product names, part numbers, brand, compatibility data, or synonyms, and make sure the products appear in the right category.",
        "If a relevant category exists, make sure the search term helps customers reach the right category, landing page, or filtered product list.",
        "Check product visibility, stock/salable status, and storefront availability.",
        "If the store does not sell it, consider close substitutes, replacement products, compatible alternatives, supplier/buyer review, a landing page, or a request-this-product path.",
        "Reindex Magento catalogue/search data and test the search again.",
      ];

    case "Fitment or use case is unclear":
      return [
        `Check whether "${term}" describes a specific application, compatibility need, model, size, material, system, or use case.`,
        "Add fitment or compatibility data, such as vehicle, model, year, equipment type, size, material, application, or system.",
        "Add “fits” or “works with” information where useful.",
        "Add dimensions, units, material, application, system, or model data where relevant.",
        "Add use-case wording to product/category copy where accurate.",
        "Add filters or a fitment selector if this issue repeats.",
        "Add cross-sells or related products where customers may need a kit or compatible part.",
        "Reindex Magento catalogue/search data and test the search again.",
      ];

    case "Search term is too broad or unclear":
      return [
        `Check whether "${term}" could mean multiple different products or categories.`,
        "Do not force a narrow synonym or redirect unless the intent is very clear.",
        "Improve category routing so customers can choose the right path.",
        "Improve filters, facets, and layered navigation, such as brand, size, material, application, part type, or compatibility filters.",
        "Add suggested terms or popular related categories where useful.",
        "Use a broad landing/category page if the term has high demand.",
        "Improve product naming and category structure so customers can narrow quickly.",
      ];

    case "Search is not looking at the right data":
      return [
        "Review which product attributes are marked as searchable.",
        "Review search weights, for example giving SKU, part number, brand, and product name more influence than long descriptions.",
        "Check minimum query length, stop words, tokenisation, typo tolerance, stemming, partial matching, and search engine settings.",
        "Check whether the active search engine or extension handles synonyms, ranking, and redirects inside Magento or in its own dashboard.",
        "Check whether short terms, SKU-like terms, or special-character terms are being blocked by configuration.",
        "Reindex Magento catalogue/search data, flush relevant caches if needed, and test again.",
      ];

    case "Old or alternate part number is not connected":
      return [
        `Check whether "${term}" is an old, alternate, replacement, superseded, or cross-reference part number.`,
        "Add old and alternate part numbers as searchable product data.",
        "Connect superseded part numbers to the current valid product.",
        "Add OEM, aftermarket, and manufacturer cross-reference numbers where relevant.",
        "Make exact and normalised part-number matches, such as ABC-123, ABC 123, and ABC123, rank above broad keyword results.",
        "Reindex Magento catalogue/search data and test the search again.",
      ];

    default:
      return [
        `Search the catalogue manually for "${term}".`,
        "Check product names, SKUs, brands, categories, attributes, synonyms, redirects, and search configuration.",
        "Mark as ignored/no action if the term is irrelevant.",
        "Mark as out of scope if the business does not sell it.",
        "Mark for buyer or merchandiser review if it could be future demand.",
        "Reclassify once reviewed.",
      ];
  }
}

function TooltipLabel({
  label,
  tooltip,
}: {
  label: string;
  tooltip: string;
}) {
  return (
    <span className="group relative inline-flex items-center gap-1">
      <span>{label}</span>
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-600 text-[10px] font-semibold text-slate-400">
        ?
      </span>
      <span className="pointer-events-none absolute left-0 top-6 z-30 hidden w-72 rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs normal-case leading-5 tracking-normal text-slate-300 shadow-2xl group-hover:block">
        {tooltip}
      </span>
    </span>
  );
}

export default function TabSearchDiscovery() {
  const [data, setData] = useState<SearchLossResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [fixTypeFilter, setFixTypeFilter] = useState("all");
  const [sortMode, setSortMode] = useState<SortMode>("revenue-desc");
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);

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
      const label = getIssueLabel(item);

      if (label) {
        uniqueFixTypes.add(label);
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
        fixTypeFilter === "all" || getIssueLabel(item) === fixTypeFilter;

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
    setExpandedTerm(null);
  }

  function exportCsv() {
    const headers = [
      "Term",
      "Searches",
      "Revenue at Risk",
      "Priority",
      "Issue Type",
      "Likely Issue",
      "Suggested Action",
      "Magento Fix Steps",
    ];

    const rows = filteredTerms.map((item) => [
      item.term,
      item.count,
      item.lostRevenue || 0,
      item.opportunityScore || "Review",
      getIssueLabel(item),
      getLikelyIssue(item),
      getSuggestedAction(item),
      getMagentoFixSteps(item).join(" | "),
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
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setExpandedTerm(null);
              }}
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
              onChange={(event) => {
                setPriorityFilter(event.target.value);
                setExpandedTerm(null);
              }}
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
              Issue type
            </label>
            <select
              value={fixTypeFilter}
              onChange={(event) => {
                setFixTypeFilter(event.target.value);
                setExpandedTerm(null);
              }}
              className="h-9 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-xs text-slate-100 outline-none transition focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15"
            >
              <option value="all">All issue types</option>
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
              onChange={(event) => {
                setSortMode(event.target.value as SortMode);
                setExpandedTerm(null);
              }}
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
                What customers searched, how much it matters, what it likely
                means, and what to review next.
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
                  <th className="w-[15%] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    <TooltipLabel
                      label="Term"
                      tooltip="The exact words customers searched for."
                    />
                  </th>
                  <th className="w-[7%] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    <TooltipLabel
                      label="Searches"
                      tooltip="How many times customers searched this term."
                    />
                  </th>
                  <th className="w-[10%] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    <TooltipLabel
                      label="Revenue at Risk"
                      tooltip="Searches x AOV x search-to-order rate. Directional estimate, not guaranteed lost revenue."
                    />
                  </th>
                  <th className="w-[8%] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    <TooltipLabel
                      label="Priority"
                      tooltip="Based on search volume and estimated revenue at risk. High = review first."
                    />
                  </th>
                  <th className="w-[16%] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Issue Type
                  </th>
                  <th className="w-[22%] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    <TooltipLabel
                      label="Likely Issue"
                      tooltip="What the failed search may be telling you."
                    />
                  </th>
                  <th className="w-[16%] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    <TooltipLabel
                      label="Suggested Action"
                      tooltip="What to check or fix next."
                    />
                  </th>
                  <th className="w-[6%] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Details
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {filteredTerms.map((item) => {
                  const isExpanded = expandedTerm === item.term;

                  return (
                    <Fragment key={item.term}>
                      <tr className="align-top transition-colors hover:bg-slate-800/50">
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
                          {getIssueLabel(item)}
                        </td>

                        <td className="px-4 py-3 text-xs leading-5 text-slate-300">
                          {getLikelyIssue(item)}
                        </td>

                        <td className="px-4 py-3 text-xs leading-5 text-slate-300">
                          {getSuggestedAction(item)}
                        </td>

                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedTerm(isExpanded ? null : item.term)
                            }
                            className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-[11px] font-semibold text-blue-100 transition hover:border-blue-400/60 hover:bg-blue-500/20"
                          >
                            {isExpanded ? "Hide" : "View"}
                          </button>
                        </td>
                      </tr>

                      {isExpanded ? (
                        <tr>
                          <td colSpan={8} className="bg-slate-950/35 px-4 py-4">
                            <div className="mb-4 flex flex-wrap gap-2">
                              <span className="inline-flex rounded-full border border-blue-500/25 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-100">
                                Issue Type: {getIssueLabel(item)}
                              </span>
                              <span
                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getPriorityClasses(
                                  item.opportunityScore
                                )}`}
                              >
                                Priority: {item.opportunityScore || "Review"}
                              </span>
                              <span className="inline-flex rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-300">
                                Searches: {formatNumber(item.count)}
                              </span>
                              <span className="inline-flex rounded-full border border-blue-500/25 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-100">
                                Revenue at Risk:{" "}
                                {formatCurrency(item.lostRevenue)}
                              </span>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-300/80">
                                  What this means
                                </p>
                                <p className="mt-2 text-sm leading-6 text-slate-200">
                                  {getPlainEnglishMeaning(item)}
                                </p>

                                <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-blue-300/80">
                                  Suggested action
                                </p>
                                <p className="mt-2 text-sm leading-6 text-slate-300">
                                  {getSuggestedAction(item)}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-300/80">
                                  Magento checks / fixes
                                </p>
                                <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-300">
                                  {getMagentoFixSteps(item).map((step) => (
                                    <li key={step} className="flex gap-2">
                                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-300/80" />
                                      <span>{step}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}