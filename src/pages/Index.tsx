import { useState } from "react";
import TabExecutiveSnapshot from "@/components/dashboard/TabExecutiveSnapshot";
import TabAccountPerformance from "@/components/dashboard/TabAccountPerformance";
import TabRevenueProductMix from "@/components/dashboard/TabRevenueProductMix";
import TabFulfillmentInventory from "@/components/dashboard/TabFulfillmentInventory";
import TabSearchDiscovery from "@/components/dashboard/TabSearchDiscovery";

const tabs = [
  { id: "executive", label: "Executive View" },
  { id: "accounts", label: "Accounts" },
  { id: "revenue", label: "Revenue & Margin" },
  { id: "fulfillment", label: "Inventory & Fulfillment" },
  { id: "search", label: "Search & Discovery" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>("executive");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15">
              <span className="text-sm font-bold text-primary">SC</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground tracking-tight">Summit Chassis Supply</h1>
              <p className="text-[11px] text-muted-foreground">Operating Dashboard</p>
            </div>
          </div>
          <div className="text-right text-[11px] text-muted-foreground">
            <p>Last updated: Jun 13, 2025 · 08:42 AM CT</p>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="border-b border-border bg-card px-6">
        <div className="flex gap-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-[13px] font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-[1440px] p-6">
        {activeTab === "executive" && <TabExecutiveSnapshot />}
        {activeTab === "accounts" && <TabAccountPerformance />}
        {activeTab === "revenue" && <TabRevenueProductMix />}
        {activeTab === "fulfillment" && <TabFulfillmentInventory />}
        {activeTab === "search" && <TabSearchDiscovery />}
      </main>
    </div>
  );
};

export default Index;
