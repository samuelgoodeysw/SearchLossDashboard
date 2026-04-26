import { useState } from "react";
import TabSearchOverview from "@/components/dashboard/TabSearchOverview";
import TabSearchDiscovery from "@/components/dashboard/TabSearchDiscovery";

type DashboardTab = "overview" | "search";

const tabs: Array<{
  id: DashboardTab;
  label: string;
  description: string;
}> = [
  {
    id: "overview",
    label: "Overview",
    description: "Quick view of search demand, risk, and read-only setup.",
  },
  {
    id: "search",
    label: "Opportunities",
    description: "Ranked failed searches, likely fix types, and suggested actions.",
  },
];

export default function Index() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-[28px] border border-slate-800 bg-slate-900/70 p-5 shadow-[0_12px_40px_rgba(2,8,23,0.35)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-300/80">
                Search Loss
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Magento Search Intelligence
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                Standalone visibility for failed searches, missed demand, and
                revenue opportunities — without changing the live Magento store.
              </p>
            </div>

            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-100">
              <p className="font-semibold text-blue-100">Read-only dashboard</p>
              <p className="mt-1 text-blue-100/75">
                No storefront, checkout, catalogue, or order data is modified.
              </p>
            </div>
          </div>
        </header>

        <nav className="mb-6 rounded-[24px] border border-slate-800 bg-slate-900/70 p-2 shadow-[0_10px_30px_rgba(2,8,23,0.25)]">
          <div className="grid gap-2 sm:grid-cols-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={
                    isActive
                      ? "rounded-2xl border border-blue-500/30 bg-blue-500/15 px-4 py-4 text-left shadow-[0_8px_24px_rgba(2,8,23,0.25)]"
                      : "rounded-2xl border border-transparent px-4 py-4 text-left transition hover:border-slate-700 hover:bg-slate-800/60"
                  }
                >
                  <span
                    className={
                      isActive
                        ? "block text-sm font-semibold text-blue-200"
                        : "block text-sm font-semibold text-slate-300"
                    }
                  >
                    {tab.label}
                  </span>
                  <span
                    className={
                      isActive
                        ? "mt-1 block text-xs leading-5 text-blue-100/75"
                        : "mt-1 block text-xs leading-5 text-slate-500"
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