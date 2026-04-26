import { useState } from "react";
import TabSearchOverview from "@/components/dashboard/TabSearchOverview";
import TabSearchDiscovery from "@/components/dashboard/TabSearchDiscovery";
import { clientConfig } from "@/config/client";

type DashboardTab = "overview" | "search" | "phase2a" | "phase2b";

const tabs: Array<{
  id: DashboardTab;
  label: string;
  description: string;
  disabled?: boolean;
}> = [
  {
    id: "overview",
    label: "Overview",
    description: "Quick view",
  },
  {
    id: "search",
    label: "Opportunities",
    description: "Prioritised failed-search actions",
  },
  {
    id: "phase2a",
    label: "Phase 2",
    description: "Future expansion",
    disabled: true,
  },
  {
    id: "phase2b",
    label: "Phase 2",
    description: "Future expansion",
    disabled: true,
  },
];

export default function Index() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-4 py-4 sm:px-5 lg:px-6">
        <header className="mb-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 shadow-[0_10px_30px_rgba(2,8,23,0.25)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-700 bg-slate-950/80">
                <img
                  src={clientConfig.clientLogo}
                  alt={`${clientConfig.clientName} logo`}
                  className="h-full w-full object-contain p-1.5"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-300/80">
                    {clientConfig.productName}
                  </p>

                  <p className="text-xs text-slate-500">
                    Configured for{" "}
                    <span className="font-medium text-slate-300">
                      {clientConfig.clientName}
                    </span>
                  </p>
                </div>

                <h1 className="mt-1 text-lg font-semibold tracking-tight text-white sm:text-xl">
                  {clientConfig.dashboardTitle}
                </h1>

                <p className="mt-1 max-w-4xl text-xs leading-5 text-slate-400 sm:text-sm">
                  {clientConfig.dashboardSubtitle}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs text-blue-100 lg:max-w-md">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
                  Active
                </span>
                <p className="font-semibold text-blue-100">
                  Magento API connection
                </p>
              </div>

              <p className="mt-1 leading-5 text-blue-100/75">
                Standalone visibility layer. No storefront, checkout, catalogue,
                or order data is modified.
              </p>
            </div>
          </div>
        </header>

        <nav className="mb-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-1.5 shadow-[0_8px_24px_rgba(2,8,23,0.22)]">
          <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-4">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const isDisabled = Boolean(tab.disabled);

              return (
                <button
                  key={tab.id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    if (!isDisabled) {
                      setActiveTab(tab.id);
                    }
                  }}
                  className={
                    isDisabled
                      ? "cursor-not-allowed rounded-xl border border-slate-800 bg-slate-950/35 px-3 py-2 text-left opacity-50"
                      : isActive
                        ? "rounded-xl border border-blue-500/30 bg-blue-500/15 px-3 py-2 text-left shadow-[0_6px_18px_rgba(2,8,23,0.22)]"
                        : "rounded-xl border border-transparent px-3 py-2 text-left transition hover:border-slate-700 hover:bg-slate-800/60"
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={
                        isDisabled
                          ? "block text-sm font-semibold text-slate-500"
                          : isActive
                            ? "block text-sm font-semibold text-blue-200"
                            : "block text-sm font-semibold text-slate-300"
                      }
                    >
                      {tab.label}
                    </span>

                    {isDisabled ? (
                      <span className="rounded-full border border-slate-700 bg-slate-900 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                        Planned
                      </span>
                    ) : null}
                  </div>

                  <span
                    className={
                      isDisabled
                        ? "mt-0.5 block text-[11px] leading-4 text-slate-600"
                        : isActive
                          ? "mt-0.5 block text-[11px] leading-4 text-blue-100/70"
                          : "mt-0.5 block text-[11px] leading-4 text-slate-500"
                    }
                  >
                    {tab.description}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="flex-1">
          {activeTab === "overview" && <TabSearchOverview />}
          {activeTab === "search" && <TabSearchDiscovery />}
        </div>
      </div>
    </main>
  );
}