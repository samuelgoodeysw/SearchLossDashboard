import type { VercelRequest, VercelResponse } from "@vercel/node";

const demoData = {
  searchData: {
    totalSearches: 335,
    failedSearches: 156,
    zeroResultRate: 46.57,
    searchToOrderRate: 6.27,
    averageOrderValue: 424.33,
    modeledDemandLost: 4149.6,
  },
  failedSearchTerms: [
    {
      term: "boat trailer axle",
      count: 21,
      conversion: 0,
      lostRevenue: 558.6,
      opportunityScore: "High",
      fixType: "Product/category coverage",
      suggestedFix:
        'Check whether the store sells "boat trailer axle", an equivalent product, or a close substitute. If it exists, improve findability. If not, treat repeated searches as catalogue demand or route customers to the closest helpful alternative.',
      confidence: "High",
      trend: "up",
    },
    {
      term: "HENDRICKSON nut",
      count: 18,
      conversion: 0,
      lostRevenue: 478.8,
      opportunityScore: "High",
      fixType: "Brand/product tagging",
      suggestedFix:
        "Check whether matching products have the right Hendrickson brand, manufacturer, product family, model, and product-type data.",
      confidence: "High",
      trend: "up",
    },
    {
      term: "ABC-123",
      count: 15,
      conversion: 0,
      lostRevenue: 399.0,
      opportunityScore: "High",
      fixType: "Part number mapping",
      suggestedFix:
        'Check whether "ABC-123" matches a SKU, manufacturer part number, alternate part number, old part number, replacement part, barcode, or common customer-used format.',
      confidence: "Medium",
      trend: "flat",
    },
    {
      term: "air bag suspension",
      count: 14,
      conversion: 0,
      lostRevenue: 372.4,
      opportunityScore: "Medium",
      fixType: "Synonym mapping",
      suggestedFix:
        'Check whether "air bag suspension" means the same thing as an existing product or category. If it does, add it as a synonym or searchable term.',
      confidence: "High",
      trend: "up",
    },
    {
      term: "nano lea.f spring",
      count: 8,
      conversion: 0,
      lostRevenue: 212.8,
      opportunityScore: "Medium",
      fixType: "Spelling or formatting variant",
      suggestedFix:
        'Check whether "nano lea.f spring" is a common typo, abbreviation, spacing, punctuation, or singular/plural variant.',
      confidence: "Medium",
      trend: "flat",
    },
  ],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const magentoBaseUrl = process.env.MAGENTO_BASE_URL;
  const magentoApiToken = process.env.MAGENTO_API_TOKEN;

  if (!magentoBaseUrl || !magentoApiToken) {
    return res.status(200).json({
      ...demoData,
      mode: "demo",
    });
  }

  const url = `${magentoBaseUrl.replace(/\/$/, "")}/rest/V1/search-loss/dashboard`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${magentoApiToken}`,
        "Content-Type": "application/json",
      },
    });

    const text = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Magento API request failed",
        url,
        status: response.status,
        response: text,
      });
    }

    const magentoData = JSON.parse(text);

    const normalizedData = Array.isArray(magentoData)
      ? magentoData.reduce((acc, item) => {
          acc[item.key] = item.value;
          return acc;
        }, {} as Record<string, unknown>)
      : magentoData;

    return res.status(200).json({
      ...normalizedData,
      mode: "magento",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Unable to fetch Search Loss data",
      url,
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
