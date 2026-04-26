# Search Loss Dashboard

External dashboard for surfacing missed revenue opportunities from Magento on-site search data.

The dashboard connects to the Magento `SearchLoss` module through a server-side API route, then presents failed search terms, estimated revenue exposure, likely fix types, and recommended actions in a client-friendly interface.

## Purpose

Ecommerce site search is a high-intent signal. When customers search and receive zero results or poor matches, the store may be losing revenue from users who were already trying to purchase.

This dashboard is designed to make that lost demand visible by showing:

- Total on-site search demand
- Failed search volume
- Zero-result rate
- Estimated lost revenue
- Failed search terms ranked by opportunity
- Likely fix type
- Confidence level
- Recommended action

The goal is to provide a lightweight external dashboard that can be trialled without modifying a client storefront. If the value is proven, the native Magento module can then be installed or expanded.

## Architecture

Browser dashboard
  ↓
Vercel API route: /api/search-loss
  ↓
Magento REST endpoint: /rest/V1/search-loss/dashboard
  ↓
Magento SearchLoss module
  ↓
Magento search_query data

The frontend does not call Magento directly. Magento credentials are kept server-side in environment variables.

Related Repository

The Magento module lives separately from this dashboard.

https://github.com/samuelgoodeysw/SearchLoss

This repository contains only the external dashboard application.

Current Data Flow

The current implementation fetches Search Loss data from the Magento module.

The Magento module currently uses Magento search_query data to calculate:

Total searches
Failed searches
Zero-result rate
Average order value
Search-to-order rate
Estimated lost revenue
Failed search opportunities
Fix type
Suggested action
Confidence level

The dashboard receives normalized JSON from /api/search-loss and renders the Search & Discovery view.

Local Development
Prerequisites

Magento should be running locally.

Confirm the Magento Search Loss endpoint is available:

curl -i http://localhost/rest/V1/search-loss/dashboard

Expected result:

HTTP/1.1 200 OK

The response should include searchData and failedSearchTerms.

Install Dependencies
npm install
Run the Dashboard Locally

When running through WSL, pass the Magento environment variables inline:

MAGENTO_BASE_URL=http://localhost MAGENTO_API_TOKEN=abc123 vercel dev

Vercel will print a local URL, usually one of:

http://localhost:3000
http://localhost:3001
http://localhost:3002

Open the URL shown in the terminal.

Environment Variables
Required
MAGENTO_BASE_URL=http://localhost
MAGENTO_API_TOKEN=abc123
Notes

For local WSL development, inline variables are currently the most reliable option:

MAGENTO_BASE_URL=http://localhost MAGENTO_API_TOKEN=abc123 vercel dev

For deployed environments, these should be configured in the Vercel project settings.

API Route

The frontend calls:

/api/search-loss

The Vercel API route calls Magento:

/rest/V1/search-loss/dashboard

This keeps Magento credentials out of the browser.

Local Files Not to Commit

The following files/directories are local development artifacts and should not be committed:

.env.local
.vercel/
node_modules/
package-lock.json
Troubleshooting
Vite or Vercel Port Already in Use

Stop old local processes:

pkill -f vite || true
pkill -f vercel || true
pkill -f node || true

Then restart:

MAGENTO_BASE_URL=http://localhost MAGENTO_API_TOKEN=abc123 vercel dev
Missing node_modules

Run:

npm install
Magento Returns 500

First confirm Magento cache and generated folders are writable in the local development environment.

For the current local WSL setup, this dev-only command has been used:

chmod -R 777 /home/magento/magento/var
chmod -R 777 /home/magento/magento/generated
chmod -R 777 /home/magento/magento/pub/static
chmod -R 777 /home/magento/magento/pub/media
php /home/magento/magento/bin/magento cache:flush

This is not production-safe. It is only a local development workaround.

Current UI

The dashboard currently focuses on the Search & Discovery view.

It shows:

On-site searches
Failed searches
Zero-result rate
Estimated lost revenue
Search Loss Opportunities table

The opportunities table includes:

Term
Searches
Lost revenue
Priority
Fix type
Confidence
Suggested action
Product Direction

The dashboard should not be treated as a generic analytics dashboard.

The product goal is to answer:

Where is the store silently losing revenue through failed search, and what should be fixed first?

The strongest future improvement is catalogue-aware recommendations.

Instead of relying only on text-pattern rules, the Magento module should check whether each failed search term matches or partially matches:

Product names
SKUs
Categories
Brands
Attributes
Existing synonyms or redirects

This would allow the system to classify opportunities more accurately, for example:

Exact product exists but search does not find it
Related products exist but tagging is weak
Category exists but search is not mapped
Brand intent exists but products are not tagged
No catalogue coverage exists
Recommended Next Step

Implement catalogue-aware recommendation logic in the Magento SearchLossDataProvider.

Target flow:

Failed search term
  ↓
Check product/category/catalog matches
  ↓
Classify issue
  ↓
Generate better suggested action
  ↓
Expose via REST API
  ↓
Render in dashboard

This will make the recommendations more credible and commercially useful.
