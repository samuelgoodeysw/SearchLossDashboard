import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const magentoBaseUrl = process.env.MAGENTO_BASE_URL || "http://localhost";
  const magentoApiToken = process.env.MAGENTO_API_TOKEN || "abc123";

  const url = `${magentoBaseUrl}/rest/V1/search-loss/dashboard`;

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

    return res.status(200).json(normalizedData);
  } catch (error) {
    return res.status(500).json({
      error: "Unable to fetch Search Loss data",
      url,
      message: error instanceof Error ? error.message : String(error),
    });
  }
}