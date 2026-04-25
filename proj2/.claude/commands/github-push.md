# /github-push

Push the current project to GitHub with a professional README, GitHub Actions Pages deployment, and live URL.

## Steps

### 1. Detect project context

Before doing anything, gather context by running these read-only commands:
- `git remote get-url origin` — extract the GitHub owner and repo name
- `git branch --show-current` — get the current branch name
- Read any existing `README.md`, `package.json`, `index.html`, or `CLAUDE.md` to understand what the project does

Derive:
- `OWNER` = GitHub username from the remote URL
- `REPO` = repository name from the remote URL  
- `BRANCH` = current branch (default: `main`)
- `PAGES_URL` = `https://${OWNER}.github.io/${REPO}`

### 2. Generate or update README.md

Write a professional `README.md` in the project root. Infer all content from the actual source files — do not invent features. Include these sections in order:

```markdown
# <repo name>

<One-sentence description of what the project does>

## Features
- <bullet list derived from actual UI/functionality>

## Tech Stack
- <list each technology actually used, e.g. Node.js, Express, Vanilla JS, Apify, etc.>

## Setup

### Prerequisites
- <list what needs to be installed, e.g. Node.js 18+, gh CLI>

### Installation
\`\`\`bash
<exact commands to clone and install>
\`\`\`

### Configuration
\`\`\`bash
<copy .env.example or describe required env vars>
\`\`\`

### Run
\`\`\`bash
<start command>
\`\`\`

## Screenshots

> _Add screenshots here_

## License
MIT
```

If a `README.md` already exists, update it in place — preserve any screenshots or custom sections the user has added.

### 3. Create GitHub Actions workflow

Create the file `.github/workflows/deploy.yml` with this exact content:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: public

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

> Note: if the site's static files are in the project root (not a `public/` subfolder), change `path: public` to `path: '.'` — check by looking at where `index.html` lives.

### 4. Stage and commit

```bash
git add README.md .github/workflows/deploy.yml
git add -A
git status
git commit -m "docs: add README and GitHub Pages deployment workflow"
```

### 5. Push to GitHub

```bash
git push
```

If the push fails because there is no upstream, run:
```bash
git push -u origin main
```

### 6. Enable GitHub Pages (GitHub Actions source)

Run these gh CLI commands in sequence:

```bash
# Try to create Pages (will fail if already exists — that's fine)
gh api repos/${OWNER}/${REPO}/pages \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  -f build_type=workflow 2>/dev/null || true

# Ensure build_type is set to workflow (idempotent)
gh api repos/${OWNER}/${REPO}/pages \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  -f build_type=workflow 2>/dev/null || true
```

### 7. Update repo description and topics

Infer a short description (under 100 chars) and 3–5 relevant topic tags from the project content.

```bash
gh repo edit ${OWNER}/${REPO} \
  --description "<inferred short description>" \
  --add-topic "<topic1>" \
  --add-topic "<topic2>" \
  --add-topic "<topic3>"
```

Example topics for a lead-gen tool: `singapore`, `lead-generation`, `google-maps`, `apify`, `javascript`

### 8. Print the result

Output this summary to the user:

```
✓ README.md updated
✓ GitHub Actions workflow created
✓ Changes committed and pushed
✓ GitHub Pages enabled (Actions source)
✓ Repo description and topics updated

Live URL: https://${OWNER}.github.io/${REPO}
(Pages usually goes live within 2–3 minutes of the workflow run completing)

Monitor deployment: https://github.com/${OWNER}/${REPO}/actions
```
