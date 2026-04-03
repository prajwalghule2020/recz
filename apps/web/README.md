# Face-AI Web Client

This is a [Next.js](https://nextjs.org) application mapped as the graphical interface and standard user portal for the Face-AI engine.

## Overview
The web application provides the unified user interface layer for viewing processing results, orchestrating new pipelines, and monitoring system behavior. 

Instead of having to manage a localized direct connection configuration across multiple discrete apps, this web app leverages internal Turborepo logic—it is capable of dynamically interacting with the API routes directly using local network communication (`fetch` points or frontend REST interfaces). It can also securely import and leverage the internal database packages like `@repo/db` to query real-time database records immediately for SSR pages.

## Tech Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** CSS 
- **Database Connectivity:** `@repo/db` (Shared Prisma Package)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or 
turbo dev --filter=web
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the pages by modifying files under the `app/` directory. The view auto-updates as you edit the file.
