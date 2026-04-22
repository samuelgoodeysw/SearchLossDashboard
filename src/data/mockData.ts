// Summit Chassis Supply — Operating Dashboard Data

export const kpiData = {
  totalRevenue: 5_418_600,
  grossMarginPct: 28.4,
  revenueAtRisk: 2_412_000,
  backorderExposurePct: 6.2,
  revenueGrowth: 4.8,
  inventoryTurnover: 5.8,
  activeAccounts: 412,
  atRiskAccounts: 87,
  dormantAccounts: 134,
  monthlyRevenueAtRisk: 418_200,
  grossMarginLeakage: 312_000,
  avgSKUsPerAccount: 18,
  catalogPenetrationPct: 14.2,
  crossSellUpside: 1_840_000,
};

export const revenueTrend = [
  { month: "Jul", current: 4_180_000, prior: 4_020_000 },
  { month: "Aug", current: 4_410_000, prior: 4_180_000 },
  { month: "Sep", current: 4_720_000, prior: 4_380_000 },
  { month: "Oct", current: 4_960_000, prior: 4_510_000 },
  { month: "Nov", current: 5_140_000, prior: 4_680_000 },
  { month: "Dec", current: 4_680_000, prior: 4_420_000 },
  { month: "Jan", current: 4_890_000, prior: 4_560_000 },
  { month: "Feb", current: 5_020_000, prior: 4_710_000 },
  { month: "Mar", current: 5_310_000, prior: 4_890_000 },
  { month: "Apr", current: 5_180_000, prior: 5_020_000 },
  { month: "May", current: 5_340_000, prior: 5_140_000 },
  { month: "Jun", current: 5_418_600, prior: 5_280_000 },
];

export const revenueConcentration = [
  { name: "Top 10", value: 44, color: "hsl(213, 94%, 58%)" },
  { name: "Accts 11–50", value: 28, color: "hsl(213, 60%, 45%)" },
  { name: "Accts 51–150", value: 18, color: "hsl(215, 30%, 38%)" },
  { name: "Long Tail", value: 10, color: "hsl(222, 20%, 28%)" },
];

export const revenueBySegment = [
  { name: "Fleet Operators", value: 2_167_440, pct: 40 },
  { name: "Repair Shops", value: 1_625_580, pct: 30 },
  { name: "Dealer Groups", value: 1_083_720, pct: 20 },
  { name: "Regional Wholesalers", value: 541_860, pct: 10 },
];

export type AccountRow = {
  id: string;
  segment: "Fleet" | "Repair Shop" | "Dealer" | "Wholesaler";
  lastOrder: string;
  revenue30d: number;
  avgOrderValue: number;
  orderFrequency: number;
  status: "Active" | "At-risk" | "Dormant";
};

export const accountsTable: AccountRow[] = [
  { id: "ACCT-0012", segment: "Fleet", lastOrder: "2025-06-10", revenue30d: 184_200, avgOrderValue: 12_280, orderFrequency: 15, status: "Active" },
  { id: "ACCT-0034", segment: "Fleet", lastOrder: "2025-06-08", revenue30d: 156_800, avgOrderValue: 9_800, orderFrequency: 16, status: "Active" },
  { id: "ACCT-0051", segment: "Dealer", lastOrder: "2025-06-12", revenue30d: 142_300, avgOrderValue: 7_115, orderFrequency: 20, status: "Active" },
  { id: "ACCT-0078", segment: "Fleet", lastOrder: "2025-06-01", revenue30d: 128_400, avgOrderValue: 10_700, orderFrequency: 12, status: "Active" },
  { id: "ACCT-0093", segment: "Dealer", lastOrder: "2025-05-22", revenue30d: 72_100, avgOrderValue: 6_573, orderFrequency: 11, status: "At-risk" },
  { id: "ACCT-0107", segment: "Repair Shop", lastOrder: "2025-06-11", revenue30d: 87_200, avgOrderValue: 4_360, orderFrequency: 20, status: "Active" },
  { id: "ACCT-0129", segment: "Fleet", lastOrder: "2025-05-18", revenue30d: 48_600, avgOrderValue: 7_640, orderFrequency: 6, status: "At-risk" },
  { id: "ACCT-0145", segment: "Dealer", lastOrder: "2025-06-09", revenue30d: 68_900, avgOrderValue: 5_742, orderFrequency: 12, status: "Active" },
  { id: "ACCT-0162", segment: "Repair Shop", lastOrder: "2025-05-10", revenue30d: 31_200, avgOrderValue: 3_508, orderFrequency: 9, status: "At-risk" },
  { id: "ACCT-0188", segment: "Repair Shop", lastOrder: "2025-04-18", revenue30d: 0, avgOrderValue: 2_890, orderFrequency: 0, status: "Dormant" },
  { id: "ACCT-0201", segment: "Fleet", lastOrder: "2025-04-02", revenue30d: 0, avgOrderValue: 11_200, orderFrequency: 0, status: "Dormant" },
  { id: "ACCT-0215", segment: "Wholesaler", lastOrder: "2025-06-13", revenue30d: 112_500, avgOrderValue: 8_654, orderFrequency: 13, status: "Active" },
  { id: "ACCT-0230", segment: "Repair Shop", lastOrder: "2025-06-05", revenue30d: 34_600, avgOrderValue: 2_882, orderFrequency: 12, status: "Active" },
  { id: "ACCT-0247", segment: "Fleet", lastOrder: "2025-05-15", revenue30d: 41_200, avgOrderValue: 6_120, orderFrequency: 7, status: "At-risk" },
  { id: "ACCT-0263", segment: "Dealer", lastOrder: "2025-04-25", revenue30d: 0, avgOrderValue: 4_310, orderFrequency: 0, status: "Dormant" },
  { id: "ACCT-0281", segment: "Wholesaler", lastOrder: "2025-04-08", revenue30d: 0, avgOrderValue: 9_420, orderFrequency: 0, status: "Dormant" },
];

export const productCategories = [
  { name: "Suspension Parts", revenue: 1_408_800, growth: 8.2, pct: 26, margin: 31.2 },
  { name: "Air Springs & Bags", revenue: 1_192_100, growth: 11.4, pct: 22, margin: 34.1 },
  { name: "Brake & Wheel", revenue: 975_300, growth: 3.1, pct: 18, margin: 26.8 },
  { name: "Leaf Springs", revenue: 812_800, growth: -3.8, pct: 15, margin: 22.4 },
  { name: "Shock Absorbers", revenue: 541_900, growth: 5.6, pct: 10, margin: 29.6 },
  { name: "Steering & Linkage", revenue: 487_700, growth: 1.9, pct: 9, margin: 27.3 },
];

export const topSKUs = [
  { sku: "AS-7891-HD", name: "Air Spring Assy — Trailer", units: 1_842, revenue: 294_720 },
  { sku: "SU-4410-KIT", name: "Bushing Kit — Rear Susp", units: 2_204, revenue: 220_400 },
  { sku: "BK-4420-PRO", name: "Brake Drum 16.5\" — Steer", units: 1_310, revenue: 196_500 },
  { sku: "AS-7892-XL", name: "Air Spring Assy — Drive", units: 1_056, revenue: 168_960 },
  { sku: "SH-1120-GAS", name: "Shock Absorber — Cab", units: 1_890, revenue: 132_300 },
];

export const decliningSKUs = [
  { sku: "LS-2210-STD", name: "Leaf Spring — 5 Leaf Rear", units: 312, decline: -18.4 },
  { sku: "LS-2215-HD", name: "Leaf Spring — 7 Leaf Rear", units: 186, decline: -14.2 },
  { sku: "BK-4405-ECO", name: "Brake Lining — Economy", units: 420, decline: -11.8 },
  { sku: "SU-3305-BRG", name: "Torque Rod Bushing — Std", units: 294, decline: -9.1 },
];

export const productPenetration = {
  avgSKUsPerAccount: 18,
  catalogPenetrationPct: 14.2,
  totalSKUs: 4_280,
  multiCategoryBuyerMargin: 34.8,
  singleCategoryBuyerMargin: 24.1,
};

export const fulfillmentKPIs = {
  fillRate: 92.4,
  backorderRate: 6.2,
  avgDeliveryTime: 2.3,
  inventoryTurnover: 5.8,
  ninetyDayInventoryValue: 2_140_000,
};

export const inventoryAging = [
  { name: "< 30 days", value: 58, dollarValue: 4_210_000, color: "hsl(152, 60%, 42%)" },
  { name: "30–90 days", value: 28, dollarValue: 2_030_000, color: "hsl(38, 92%, 50%)" },
  { name: "90+ days", value: 14, dollarValue: 2_140_000, color: "hsl(0, 72%, 51%)" },
];

export const warehousePerformance = [
  { name: "East Coast DC", revenue: 3_250_000, fillRate: 94.1, backorderRate: 4.8, avgShipTime: 1.9, backorders: 142 },
  { name: "Central DC", revenue: 2_168_600, fillRate: 90.2, backorderRate: 8.1, avgShipTime: 2.8, backorders: 218 },
];

export const searchData = {
  totalSearches: 31_240,
  zeroResultRate: 9.8,
  searchToOrderRate: 18.4,
  modeledDemandLost: 418_200,
};

export const failedSearchTerms = [
  { term: "W01-358-9781", count: 342, conversion: 0, trend: "up" as const },
  { term: "air spring kit 9100", count: 298, conversion: 2.1, trend: "up" as const },
  { term: "leaf spring 48 rear HD", count: 267, conversion: 1.4, trend: "stable" as const },
  { term: "shock absorber cab mount", count: 234, conversion: 3.2, trend: "up" as const },
  { term: "brake drum 4707", count: 198, conversion: 0, trend: "stable" as const },
  { term: "torque rod bushing kit", count: 176, conversion: 4.8, trend: "down" as const },
  { term: "hub seal 370022A", count: 163, conversion: 0, trend: "up" as const },
  { term: "suspension rebuild 46K", count: 148, conversion: 1.2, trend: "stable" as const },
];
