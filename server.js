require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = 3000;
const APIFY_TOKEN = process.env.APIFY_TOKEN;
const ACTOR_ID = 'compass~google-maps-extractor';
const BASE_URL = 'https://api.apify.com/v2';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function apifyError(body, status) {
  const type = body?.error?.type || '';
  const msg = body?.error?.message || `HTTP ${status}`;

  if (type === 'platform-feature-disabled' || msg.includes('hard limit')) {
    return { error: 'Monthly Apify usage limit reached. Add billing at apify.com/billing or wait until next month.', type };
  }
  if (type === 'not-enough-usage-to-run-paid-actor' || msg.includes('exceed your remaining usage')) {
    return { error: 'Apify account has insufficient credits. Please upgrade at apify.com/billing.', type };
  }
  return { error: msg, type };
}

app.post('/api/run-search', async (req, res) => {
  try {
    const { searchStrings, maxCrawledPlaces } = req.body;
    if (!Array.isArray(searchStrings) || searchStrings.length === 0) {
      return res.status(400).json({ error: 'searchStrings must be a non-empty array' });
    }

    const response = await fetch(
      `${BASE_URL}/acts/${ACTOR_ID}/runs?token=${APIFY_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchStringsArray: searchStrings,
          maxPlacesPerCrawl: maxCrawledPlaces || 20,
          language: 'en',
          countryCode: 'sg'
        })
      }
    );

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return res.status(502).json(apifyError(body, response.status));
    }

    const data = await response.json();
    res.json({
      runId: data.data.id,
      datasetId: data.data.defaultDatasetId
    });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

app.get('/api/poll/:runId', async (req, res) => {
  try {
    const response = await fetch(
      `${BASE_URL}/actor-runs/${req.params.runId}?token=${APIFY_TOKEN}`
    );

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return res.status(502).json(apifyError(body, response.status));
    }

    const data = await response.json();
    res.json({ status: data.data.status });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

app.get('/api/results/:datasetId', async (req, res) => {
  try {
    const response = await fetch(
      `${BASE_URL}/datasets/${req.params.datasetId}/items?token=${APIFY_TOKEN}&format=json&clean=true`
    );

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return res.status(502).json(apifyError(body, response.status));
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`SG Lead Generator running at http://localhost:${PORT}`);
});
