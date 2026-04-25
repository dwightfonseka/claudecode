(function () {
  'use strict';

  // === DEMO DATA ===
  const DEMO_RESULTS = [
    { title: 'Grab Holdings', categoryName: 'Technology Company', address: '3 Media Close, Singapore 138498', phone: '+65 6570 1000', website: 'https://grab.com', totalScore: 4.2, reviewsCount: 1840 },
    { title: 'Sea Limited (Shopee)', categoryName: 'E-Commerce Company', address: '1 Fusionopolis Place, Singapore 138522', phone: '+65 6270 2153', website: 'https://sea.com', totalScore: 4.0, reviewsCount: 2310 },
    { title: 'Razer Inc.', categoryName: 'Technology Company', address: '514 Chai Chee Lane, Singapore 469029', phone: '+65 6318 4800', website: 'https://razer.com', totalScore: 4.5, reviewsCount: 988 },
    { title: 'Carousell', categoryName: 'Online Marketplace', address: '120 Telok Ayer Street, Singapore 068589', phone: '+65 3129 4588', website: 'https://carousell.com', totalScore: 3.8, reviewsCount: 540 },
    { title: 'Circles.Life', categoryName: 'Telecommunications Company', address: '30 Cecil Street, Singapore 049712', phone: '+65 3157 3000', website: 'https://circles.life', totalScore: 3.9, reviewsCount: 720 },
    { title: 'DBS Bank', categoryName: 'Bank', address: '12 Marina Boulevard, Singapore 018982', phone: '+65 6327 2265', website: 'https://dbs.com', totalScore: 4.1, reviewsCount: 3200 },
    { title: 'OCBC Bank', categoryName: 'Bank', address: '65 Chulia Street, Singapore 049513', phone: '+65 6363 3333', website: 'https://ocbc.com', totalScore: 4.0, reviewsCount: 2780 },
    { title: 'Singtel', categoryName: 'Telecommunications Company', address: '31 Exeter Road, Singapore 239732', phone: '+65 6838 3388', website: 'https://singtel.com', totalScore: 3.7, reviewsCount: 4100 },
    { title: 'PropertyGuru', categoryName: 'Real Estate Agency', address: '1 Paya Lebar Link, Singapore 408533', phone: '+65 6238 5971', website: 'https://propertyguru.com.sg', totalScore: 4.3, reviewsCount: 890 },
    { title: 'Lazada Singapore', categoryName: 'E-Commerce Company', address: '4 Pandan Crescent, Singapore 128475', phone: '+65 6715 9501', website: 'https://lazada.sg', totalScore: 3.6, reviewsCount: 5600 },
    { title: 'Ninja Van', categoryName: 'Courier Service', address: '2 Jalan Kilang Barat, Singapore 159346', phone: '+65 6018 9818', website: 'https://ninjavan.co', totalScore: 3.5, reviewsCount: 3400 },
    { title: 'foodpanda Singapore', categoryName: 'Food Delivery Service', address: '5 Shenton Way, Singapore 068808', phone: '+65 3157 7788', website: 'https://foodpanda.sg', totalScore: 3.8, reviewsCount: 7200 }
  ];

  // === STATE ===
  const state = {
    sectors: [],
    titles: [],
    results: [],
    sortCol: null,
    sortDir: 'asc'
  };

  // === DOM REFS ===
  const sectorsContainer = document.getElementById('sectorsContainer');
  const sectorsInput = document.getElementById('sectorsInput');
  const titlesContainer = document.getElementById('titlesContainer');
  const titlesInput = document.getElementById('titlesInput');
  const maxResultsSlider = document.getElementById('maxResults');
  const maxResultsDisplay = document.getElementById('maxResultsDisplay');
  const searchBtn = document.getElementById('searchBtn');
  const loadingCard = document.getElementById('loadingCard');
  const loadingStatus = document.getElementById('loadingStatus');
  const progressFill = document.getElementById('progressFill');
  const errorCard = document.getElementById('errorCard');
  const errorMessage = document.getElementById('errorMessage');
  const retryBtn = document.getElementById('retryBtn');
  const resultsCard = document.getElementById('resultsCard');
  const resultCount = document.getElementById('resultCount');
  const targetingNote = document.getElementById('targetingNote');
  const resultsBody = document.getElementById('resultsBody');
  const exportBtn = document.getElementById('exportBtn');
  const queryPreview = document.getElementById('queryPreview');
  const queryPreviewText = document.getElementById('queryPreviewText');
  const themeToggle = document.getElementById('themeToggle');

  // === THEME ===
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  // === SLIDER ===
  maxResultsSlider.addEventListener('input', () => {
    maxResultsDisplay.textContent = maxResultsSlider.value;
    updateQueryPreview();
  });

  // === TAG INPUT FACTORY ===
  function createTagManager(container, input, arr) {
    function addTag(value) {
      const v = value.trim().replace(/,+$/, '').trim();
      if (!v || arr.includes(v)) return;
      arr.push(v);

      const pill = document.createElement('span');
      pill.className = 'tag';
      pill.dataset.value = v;

      const text = document.createElement('span');
      text.textContent = v;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = '×';
      btn.setAttribute('aria-label', `Remove ${v}`);
      btn.addEventListener('click', () => {
        const idx = arr.indexOf(v);
        if (idx !== -1) arr.splice(idx, 1);
        pill.remove();
        updateQueryPreview();
      });

      pill.appendChild(text);
      pill.appendChild(btn);
      container.insertBefore(pill, input);
      input.value = '';
      updateQueryPreview();
    }

    input.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ',') && input.value.trim()) {
        e.preventDefault();
        addTag(input.value);
      } else if (e.key === 'Backspace' && !input.value) {
        const last = arr[arr.length - 1];
        if (last) {
          arr.pop();
          const pills = container.querySelectorAll('.tag');
          pills[pills.length - 1]?.remove();
          updateQueryPreview();
        }
      }
    });

    input.addEventListener('blur', () => {
      if (input.value.trim()) addTag(input.value);
    });

    container.addEventListener('click', () => input.focus());

    return { addTag };
  }

  const sectorsManager = createTagManager(sectorsContainer, sectorsInput, state.sectors);
  const titlesManager = createTagManager(titlesContainer, titlesInput, state.titles);

  // === QUICK TAGS ===
  document.querySelectorAll('.quick-tag').forEach(btn => {
    btn.addEventListener('click', () => {
      const field = btn.dataset.field;
      const value = btn.dataset.value;
      if (field === 'sectors') sectorsManager.addTag(value);
      if (field === 'titles') titlesManager.addTag(value);
    });
  });

  // === TARGET GROUPS ===
  function getSelectedGroups() {
    return [...document.querySelectorAll('input[name="group"]:checked')].map(el => el.value);
  }

  document.querySelectorAll('input[name="group"]').forEach(cb => {
    cb.addEventListener('change', updateQueryPreview);
  });

  // === QUERY CONSTRUCTION ===
  const GROUP_KEYWORDS = {
    SME: 'small business',
    Enterprise: 'enterprise company',
    MNC: 'multinational company',
    Startup: 'startup'
  };

  function buildSearchStrings(sectors, targetGroups) {
    const queries = [];

    if (sectors.length === 0 && targetGroups.length === 0) {
      queries.push('companies Singapore');
    } else if (sectors.length === 0) {
      targetGroups.forEach(g => queries.push(`${GROUP_KEYWORDS[g]} Singapore`));
    } else if (targetGroups.length === 0) {
      sectors.forEach(s => queries.push(`${s} companies Singapore`));
    } else {
      sectors.forEach(s => {
        targetGroups.forEach(g => {
          queries.push(`${s} ${GROUP_KEYWORDS[g]} Singapore`);
        });
      });
    }

    return [...new Set(queries)].slice(0, 10);
  }

  function updateQueryPreview() {
    const groups = getSelectedGroups();
    const queries = buildSearchStrings(state.sectors, groups);
    if (queries.length === 0) {
      queryPreview.classList.add('hidden');
      return;
    }
    queryPreview.classList.remove('hidden');
    queryPreviewText.textContent = queries.join(' · ');
  }

  // === SLEEP ===
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // === APIFY POLLING ===
  async function pollRunUntilDone(runId) {
    const POLL_MS = 3000;
    const TIMEOUT_MS = 300000;
    const start = Date.now();
    let fakeProgress = 5;

    const statusMessages = {
      READY: 'Search queued on Apify...',
      RUNNING: 'Scraping Google Maps — this takes 30–90 seconds...',
      SUCCEEDED: 'Processing results...'
    };

    while (true) {
      if (Date.now() - start > TIMEOUT_MS) {
        throw new Error('Search timed out after 5 minutes. Try reducing max results.');
      }

      const res = await fetch(`/api/poll/${runId}`);
      if (!res.ok) throw new Error('Failed to check search status');
      const { status, error } = await res.json();

      if (error) throw new Error(error);

      loadingStatus.textContent = statusMessages[status] || `Status: ${status}`;
      fakeProgress = Math.min(fakeProgress + 7, 88);
      setProgress(fakeProgress);

      if (status === 'SUCCEEDED') {
        setProgress(95);
        return;
      }

      if (['FAILED', 'TIMED-OUT', 'ABORTED'].includes(status)) {
        throw new Error(`Apify run ${status.toLowerCase()}. Please try again.`);
      }

      await sleep(POLL_MS);
    }
  }

  function setProgress(pct) {
    progressFill.style.width = `${pct}%`;
  }

  // === ERROR DISPLAY ===
  function showError(message) {
    loadingCard.classList.add('hidden');

    const isBillingError = message.includes('limit') || message.includes('credits') || message.includes('billing') || message.includes('upgrade');

    let html = `<p>${escapeHtml(message)}</p>`;
    if (isBillingError) {
      html += `<p class="error-help">Add billing at <a href="https://console.apify.com/billing/subscription" target="_blank" rel="noopener">apify.com/billing</a>, or use demo data below.</p>`;
    }
    html += `<div class="error-actions">
      <button id="retryBtn" class="btn-secondary">Try Again</button>
      ${isBillingError ? '<button id="demoBtn" class="btn-primary" style="margin-top:0">Load Demo Data</button>' : ''}
    </div>`;

    errorCard.querySelector('.error-icon').innerHTML = '&#9888;';
    errorCard.innerHTML = `<div class="error-icon">&#9888;</div>${html}`;

    errorCard.querySelector('#retryBtn')?.addEventListener('click', () => {
      errorCard.classList.add('hidden');
      runSearch();
    });
    errorCard.querySelector('#demoBtn')?.addEventListener('click', loadDemoData);

    errorCard.classList.remove('hidden');
  }

  // === DEMO MODE ===
  function loadDemoData() {
    errorCard.classList.add('hidden');
    state.results = DEMO_RESULTS.slice(0, parseInt(maxResultsSlider.value, 10));
    state.sortCol = null;
    state.sortDir = 'asc';
    renderResults(true);
  }

  // === MAIN SEARCH FLOW ===
  searchBtn.addEventListener('click', runSearch);

  async function runSearch() {
    const groups = getSelectedGroups();
    const searchStrings = buildSearchStrings(state.sectors, groups);
    const maxCrawledPlaces = parseInt(maxResultsSlider.value, 10);

    searchBtn.disabled = true;
    loadingCard.classList.remove('hidden');
    errorCard.classList.add('hidden');
    resultsCard.classList.add('hidden');
    setProgress(3);
    loadingStatus.textContent = 'Starting search...';

    try {
      const startRes = await fetch('/api/run-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchStrings, maxCrawledPlaces })
      });

      const startData = await startRes.json();
      if (!startRes.ok) throw new Error(startData.error || 'Failed to start search');

      const { runId, datasetId } = startData;
      setProgress(10);

      await pollRunUntilDone(runId);

      loadingStatus.textContent = 'Fetching results...';
      const resultsRes = await fetch(`/api/results/${datasetId}`);
      const resultsData = await resultsRes.json();
      if (!resultsRes.ok) throw new Error(resultsData.error || 'Failed to fetch results');

      setProgress(100);
      state.results = Array.isArray(resultsData) ? resultsData : [];
      state.sortCol = null;
      state.sortDir = 'asc';

      await sleep(300);
      loadingCard.classList.add('hidden');
      renderResults(false);

    } catch (err) {
      showError(err.message);
    } finally {
      searchBtn.disabled = false;
    }
  }

  // === RENDER RESULTS ===
  function renderResults(isDemo) {
    const count = state.results.length;
    resultCount.textContent = `${count} lead${count !== 1 ? 's' : ''} found${isDemo ? ' (demo data)' : ''}`;

    if (state.titles.length > 0) {
      targetingNote.textContent = `Targeting: ${state.titles.join(', ')}`;
    } else {
      targetingNote.textContent = '';
    }

    renderTable(state.results);
    resultsCard.classList.remove('hidden');
  }

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function truncate(str, max) {
    if (!str) return '';
    return str.length > max ? str.slice(0, max) + '…' : str;
  }

  function renderTable(data) {
    if (data.length === 0) {
      resultsBody.innerHTML = `
        <tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-hint)">
          No results found. Try different sectors or target groups.
        </td></tr>`;
      return;
    }

    resultsBody.innerHTML = data.map(item => {
      const rating = item.totalScore != null
        ? `<span class="rating-badge">★ ${item.totalScore}</span>`
        : '<span class="dash">—</span>';

      const phone = item.phone
        ? `<a href="tel:${escapeHtml(item.phone)}">${escapeHtml(item.phone)}</a>`
        : '<span class="dash">—</span>';

      const website = item.website
        ? `<a href="${escapeHtml(item.website)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(item.website)}">${escapeHtml(truncate(item.website.replace(/^https?:\/\/(www\.)?/, ''), 28))}</a>`
        : '<span class="dash">—</span>';

      return `<tr>
        <td class="td-name">${escapeHtml(item.title || item.name || '')}</td>
        <td>${escapeHtml(item.categoryName || item.category || '')}</td>
        <td>${escapeHtml(item.address || item.street || '')}</td>
        <td>${phone}</td>
        <td class="td-website">${website}</td>
        <td>${rating}</td>
        <td>${item.reviewsCount != null ? item.reviewsCount.toLocaleString() : '<span class="dash">—</span>'}</td>
      </tr>`;
    }).join('');
  }

  // === SORTING ===
  document.querySelectorAll('th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;

      if (state.sortCol === col) {
        state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortCol = col;
        state.sortDir = 'asc';
      }

      document.querySelectorAll('th.sortable').forEach(t => {
        t.classList.remove('sort-asc', 'sort-desc');
      });
      th.classList.add(state.sortDir === 'asc' ? 'sort-asc' : 'sort-desc');

      state.results.sort((a, b) => {
        let va = a[col] ?? '';
        let vb = b[col] ?? '';
        if (typeof va === 'string') va = va.toLowerCase();
        if (typeof vb === 'string') vb = vb.toLowerCase();
        if (va < vb) return state.sortDir === 'asc' ? -1 : 1;
        if (va > vb) return state.sortDir === 'asc' ? 1 : -1;
        return 0;
      });

      renderTable(state.results);
    });
  });

  // === CSV EXPORT ===
  exportBtn.addEventListener('click', exportCSV);

  function exportCSV() {
    const headers = ['Business Name', 'Category', 'Address', 'Phone', 'Website', 'Rating', 'Reviews'];

    const rows = state.results.map(item => [
      item.title || item.name || '',
      item.categoryName || item.category || '',
      item.address || item.street || '',
      item.phone || '',
      item.website || '',
      item.totalScore != null ? item.totalScore : '',
      item.reviewsCount != null ? item.reviewsCount : ''
    ]);

    function csvEscape(val) {
      const s = String(val ?? '');
      if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    }

    const csvLines = [
      headers.map(csvEscape).join(','),
      ...rows.map(row => row.map(csvEscape).join(','))
    ];

    const csvContent = '﻿' + csvLines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sg-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // === INIT ===
  updateQueryPreview();
})();
