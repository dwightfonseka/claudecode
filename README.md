# SG Lead Generator

A Singapore-focused B2B lead generation tool that scrapes real business listings from Google Maps via the Apify platform. Filter by sector, target group, and job title — then export results to CSV.

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![Apify](https://img.shields.io/badge/Apify-00B53E?style=flat&logo=apify&logoColor=white)

## Features

- **Sector & group filtering** — tag-style inputs for sectors (e.g. Technology, Finance) and Singapore-specific target groups (SME, Enterprise, MNC, Startup)
- **Job title targeting** — specify decision-makers you want to reach (CEO, CTO, Marketing Manager, etc.)
- **Live Google Maps scraping** — powered by the Apify `compass/google-maps-extractor` actor
- **Real-time progress** — polling loop with status messages and animated progress bar
- **Sortable results table** — click any column header to sort ascending/descending
- **CSV export** — RFC 4180-compliant, UTF-8 BOM for Excel compatibility, filename includes date
- **Dark / Light theme** — toggle persists across sessions via `localStorage`
- **Demo mode** — loads sample Singapore business data when Apify credits are unavailable

## Tech Stack

- **Backend:** Node.js, Express, node-fetch v2, dotenv
- **Frontend:** Vanilla HTML/CSS/JavaScript (no framework, no bundler)
- **Scraping:** [Apify](https://apify.com) — `compass/google-maps-extractor` actor
- **MCP Servers:** Apify MCP, Playwright MCP (configured in `.mcp.json`)

## Setup

### Prerequisites

- Node.js 18+
- An [Apify account](https://apify.com) with an API token
- `gh` CLI (optional — for GitHub Pages deployment)

### Installation

```bash
git clone https://github.com/dwightfonseka/claudecode.git
cd claudecode
npm install
```

### Configuration

Create a `.env` file in the project root:

```bash
APIFY_TOKEN=your_apify_token_here
```

Get your token from [apify.com/account/integrations](https://console.apify.com/account/integrations).

### Run

```bash
npm start
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

> Always access the tool via the Express server — opening `public/index.html` directly will break API calls.

## Usage

1. Type sectors into the **Sectors** field and press Enter (or use the quick-add chips)
2. Add job titles you want to reach in **Job Titles to Target**
3. Select one or more **Target Groups** (SME, Enterprise, MNC, Startup)
4. Adjust **Max Results** with the slider
5. Click **Find Leads** — results appear in 30–90 seconds
6. Click any column header to sort; click **Export CSV** to download

## Screenshots

> _Add screenshots here_

## Apify Credit Notes

- `compass/google-maps-extractor` is a free actor (no extra fee beyond platform compute units)
- The free Apify plan includes $5/month of compute units
- If you hit the monthly limit, the error card shows a **Load Demo Data** button to preview the UI

## License

MIT
