# Welcome to your Lovable project

TODO: Document your project here

---

## Local Development

This dashboard runs as an external Search Loss dashboard and fetches data from the local Magento SearchLoss module.

### Prerequisites

Magento should be running locally, and this endpoint should return JSON:

    curl -i http://localhost/rest/V1/search-loss/dashboard

Expected result:

    HTTP/1.1 200 OK

### Install dependencies

If node_modules is missing, run:

    npm install

### Run the dashboard locally

When running through WSL, use inline environment variables:

    MAGENTO_BASE_URL=http://localhost MAGENTO_API_TOKEN=abc123 vercel dev

Vercel will print a local URL, usually one of:

    http://localhost:3000
    http://localhost:3001
    http://localhost:3002

Open the URL shown in the terminal.

### API route

The dashboard calls:

    /api/search-loss

That Vercel API route then calls Magento:

    /rest/V1/search-loss/dashboard

This keeps Magento credentials on the server side and avoids exposing them in the browser.

### Local environment notes

These local development files should not be committed:

    .env.local
    .vercel/
    node_modules/
    package-lock.json

If Vercel or Vite ports get stuck, stop old processes:

    pkill -f vite || true
    pkill -f vercel || true
    pkill -f node || true

Then restart:

    MAGENTO_BASE_URL=http://localhost MAGENTO_API_TOKEN=abc123 vercel dev

