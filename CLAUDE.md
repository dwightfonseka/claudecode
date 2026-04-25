# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # production — node server.js on port 3000
npm run dev        # development — node --watch server.js (auto-restarts on save)
```

No build step, no test suite. After starting the server, open `http://localhost:3000` in a browser — never open `public/index.html` directly (API calls will fail without the Express proxy).

To kill a stuck server on Windows: `Get-Process node | Stop-Process -Force`

## Architecture

This is a two-layer app with no bundler and no framework.

**`server.js`** — Express server, three purposes:
1. Serves `public/` as static files
2. Proxies all Apify API calls so `APIFY_TOKEN` is never exposed to the browser
3. Translates Apify error types into human-readable messages (`apifyError()`)

**`public/`** — Plain HTML/CSS/JS, loaded directly by the browser:
- `index.html` — static shell only; no logic
- `style.css` — theming via CSS custom properties on `[data-theme="light"|"dark"]` on `<html>`; all colors are tokens, no hard-coded values
- `app.js` — all client logic in one IIFE; sections are marked with `=== SECTION ===` comments

## Key patterns in app.js

**Search flow** (`runSearch`): POST `/api/run-search` → poll `/api/poll/:runId` every 3s until `SUCCEEDED` → GET `/api/results/:datasetId`. The browser holds the polling loop; the server is stateless between requests.

**Query construction** (`buildSearchStrings`): takes `state.sectors[]` and selected target groups, produces a cross-product of natural-language Google Maps queries capped at 10. Job titles are UI-only — they are not sent to Apify (Google Maps doesn't index by title).

**Tag inputs** (`createTagManager`): factory function used for both Sectors and Job Titles fields. Each instance mutates a shared `state.sectors` or `state.titles` array directly.

**Demo mode**: when Apify returns a billing/credit error, `showError()` detects it by keyword and injects a "Load Demo Data" button that calls `loadDemoData()`, populating `state.results` from the hardcoded `DEMO_RESULTS` array at the top of `app.js`.

## Apify integration

- Actor: `compass~google-maps-extractor` (free tier). Input key is `maxPlacesPerCrawl` (not `maxCrawledPlaces`).
- Poll endpoint uses `/v2/actor-runs/:runId` (not the actor-scoped path).
- 402 = paid actor, insufficient credits. 403 with `platform-feature-disabled` = monthly hard limit hit. Both are mapped to friendly messages in `apifyError()`.

## MCP servers

Two MCP servers are configured in `.mcp.json`:
- **apify** — `@apify/actors-mcp-server`: lets Claude directly invoke Apify actors
- **playwright** — `@playwright/mcp@latest`: browser automation for UI testing or scraping fallback
