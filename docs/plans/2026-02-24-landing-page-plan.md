# saget.org Landing Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a cyberpunk-aesthetic static landing page for saget.org with live game server status powered by GitHub Actions.

**Architecture:** Single `index.html` with inline CSS/JS reads `servers.json` for server status. A GitHub Actions cron workflow runs a Node.js script using `gamedig` to query servers and commit status updates. No build step, no framework, no backend.

**Tech Stack:** HTML/CSS/JS (vanilla), GitHub Pages, GitHub Actions, gamedig (Node.js)

---

### Task 1: Create servers.json with Satisfactory entry

**Files:**
- Create: `servers.json`

**Step 1: Create the server config file**

```json
{
  "servers": [
    {
      "name": "Satisfactory",
      "game": "satisfactory",
      "address": "saget.org",
      "port": 7777,
      "queryPort": 15000,
      "visible": true,
      "status": "unknown",
      "players": null,
      "maxPlayers": null,
      "serverName": null,
      "lastChecked": null
    }
  ]
}
```

**Step 2: Commit**

```bash
git add servers.json
git commit -m "feat: add servers.json with Satisfactory server config"
```

---

### Task 2: Create the landing page

**Files:**
- Create: `index.html`

**Step 1: Create `index.html`**

Build a single self-contained HTML file with inline `<style>` and `<script>`. Use the frontend-design skill for implementation. The page must include:

**Head:**
- Google Fonts: Oxanium (display, weights 400/700) and Share Tech Mono (monospace)
- Viewport meta, title "SAGET.ORG", favicon (use a simple inline SVG data URI favicon in cyan)

**CSS — Variables & Base:**
```css
:root {
  --bg: #0a0a0f;
  --bg-panel: #12121a;
  --neon: #00ffd5;
  --accent: #ff2d6b;
  --text-dim: #4a4a5a;
  --text-light: #8a8a9a;
  --font-display: 'Oxanium', sans-serif;
  --font-mono: 'Share Tech Mono', monospace;
}
```
- Dark background (#0a0a0f), full viewport min-height
- No default margin/padding, box-sizing: border-box

**CSS — CRT Scanline Overlay:**
- A `::after` pseudo-element on `body` covering the full viewport
- Repeating linear gradient: transparent 50%, rgba(0,0,0,0.03) 50%, background-size 100% 4px
- pointer-events: none, z-index: 1000, fixed position

**CSS — Hero Section:**
- Centered vertically and horizontally (flexbox on a wrapper, or grid)
- Logo text: "SAGET.ORG" in Oxanium, bold, large (clamp for responsive, ~6-8vw)
- Neon glow: multiple layered text-shadows in --neon color with varying blur radii
- Subtle flicker animation: keyframes that occasionally (every ~4s) briefly dip the opacity to 0.8 and back, simulating a neon sign flicker. Keep it rare — not a strobe.
- Below the logo: a thin horizontal line (1px) in --neon with a gradient fade on both ends

**CSS — Background:**
- Subtle CSS grid pattern overlay using repeating-linear-gradient (thin lines every ~60px in a very dim color like rgba(0,255,213,0.03))
- A radial gradient glow centered behind the logo (very subtle --neon at ~5% opacity, fading to transparent)

**CSS — Server Status Panel:**
- Below the hero, centered, max-width ~700px
- Panel header: "SERVER STATUS" in Share Tech Mono, letter-spacing wide, --text-dim color, small font
- Each server card: --bg-panel background, subtle border (1px solid rgba(0,255,213,0.1)), border-radius 2px
- Layout inside each card (flexbox row, wrapping on mobile):
  - Left: status dot (8px circle, green glow when online, red when offline, gray when unknown) + server name in Oxanium
  - Middle: game type badge (small, uppercase, --text-dim, border pill)
  - Right: address in Share Tech Mono, --neon color
  - Below: player count ("3/8 players") and last checked timestamp in --text-dim, small
- Online status dot: pulsing animation (scale + opacity keyframes, subtle)
- Hidden entirely when no visible servers (JS adds a class)

**CSS — Footer:**
- Bottom of page, centered, padding
- "saget.org" in Share Tech Mono, --text-dim, small
- Thin top border line matching the hero divider style

**CSS — Responsive:**
- Logo scales down on mobile (clamp handles this)
- Server cards stack vertically on narrow screens
- Adequate padding on small viewports

**JS — Server Status Loader:**
```javascript
(async function() {
  const panel = document.getElementById('server-panel');
  const container = document.getElementById('server-list');
  try {
    const res = await fetch('servers.json');
    const data = await res.json();
    const visible = data.servers.filter(s => s.visible);
    if (visible.length === 0) {
      panel.style.display = 'none';
      return;
    }
    container.innerHTML = visible.map(server => {
      const statusClass = server.status === 'online' ? 'online' :
                          server.status === 'offline' ? 'offline' : 'unknown';
      const players = server.players !== null && server.maxPlayers !== null
        ? `${server.players}/${server.maxPlayers} players`
        : '';
      const checked = server.lastChecked
        ? `Last checked: ${new Date(server.lastChecked).toLocaleString()}`
        : '';
      const displayName = server.serverName || server.name;
      return `
        <div class="server-card">
          <div class="server-main">
            <div class="server-identity">
              <span class="status-dot ${statusClass}"></span>
              <span class="server-name">${displayName}</span>
              <span class="game-badge">${server.game}</span>
            </div>
            <span class="server-address">${server.address}:${server.port}</span>
          </div>
          <div class="server-meta">
            ${players ? `<span class="player-count">${players}</span>` : ''}
            ${checked ? `<span class="last-checked">${checked}</span>` : ''}
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    panel.style.display = 'none';
  }
})();
```

**HTML structure:**
```html
<body>
  <main class="hero">
    <h1 class="logo">SAGET.ORG</h1>
    <div class="hero-divider"></div>
  </main>
  <section id="server-panel" class="server-panel">
    <h2 class="panel-header">SERVER STATUS</h2>
    <div id="server-list" class="server-list"></div>
  </section>
  <footer class="footer">
    <span>saget.org</span>
  </footer>
  <script>/* inline JS above */</script>
</body>
```

**Step 2: Verify in browser**

Open `index.html` directly in browser. Confirm:
- Logo renders with neon glow and flicker
- Scanlines visible on close inspection
- Background grid visible on close inspection
- Server panel shows Satisfactory with "unknown" status (gray dot)
- Responsive at different widths

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add cyberpunk landing page with server status panel"
```

---

### Task 3: Create the server status checker script

**Files:**
- Create: `.github/scripts/check-servers.js`
- Create: `.github/scripts/package.json`

**Step 1: Create package.json for the script**

`.github/scripts/package.json`:
```json
{
  "name": "server-status-checker",
  "private": true,
  "type": "module",
  "dependencies": {
    "gamedig": "^5.3.2"
  }
}
```

**Step 2: Create the checker script**

`.github/scripts/check-servers.js`:
```javascript
import { readFile, writeFile } from 'fs/promises';
import Gamedig from 'gamedig';

const SERVERS_PATH = '../../servers.json';

async function checkServer(server) {
  if (!server.visible) return server;

  try {
    const result = await Gamedig.query({
      type: server.game,
      host: server.address,
      port: server.queryPort || server.port,
      givenPortOnly: true,
    });

    return {
      ...server,
      status: 'online',
      players: result.players ? result.players.length : 0,
      maxPlayers: result.maxplayers || null,
      serverName: result.name || null,
      lastChecked: new Date().toISOString(),
    };
  } catch (err) {
    return {
      ...server,
      status: 'offline',
      players: null,
      maxPlayers: null,
      lastChecked: new Date().toISOString(),
    };
  }
}

async function main() {
  const raw = await readFile(SERVERS_PATH, 'utf-8');
  const data = JSON.parse(raw);

  const updated = await Promise.all(data.servers.map(checkServer));
  data.servers = updated;

  const output = JSON.stringify(data, null, 2) + '\n';

  if (output !== raw) {
    await writeFile(SERVERS_PATH, output);
    console.log('servers.json updated');
    process.exit(0);
  } else {
    console.log('No changes');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
```

**Step 3: Test locally (optional)**

```bash
cd .github/scripts && npm install && node check-servers.js
```

This will attempt to query saget.org — if the server is running, `servers.json` will update to show online status. If not, it'll show offline. Either is correct.

**Step 4: Commit**

```bash
git add .github/scripts/package.json .github/scripts/check-servers.js
git commit -m "feat: add gamedig server status checker script"
```

---

### Task 4: Create the GitHub Actions workflow

**Files:**
- Create: `.github/workflows/server-status.yml`

**Step 1: Create the workflow**

`.github/workflows/server-status.yml`:
```yaml
name: Update Server Status

on:
  schedule:
    - cron: '*/5 * * * *'
  workflow_dispatch:

permissions:
  contents: write

jobs:
  check-servers:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: cd .github/scripts && npm ci

      - name: Check server status
        run: cd .github/scripts && node check-servers.js

      - name: Commit changes
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git diff --quiet servers.json || (git add servers.json && git commit -m "chore: update server status" && git push)
```

**Step 2: Commit**

```bash
git add .github/workflows/server-status.yml
git commit -m "feat: add GitHub Actions workflow for server status cron"
```

---

### Task 5: Add GitHub Pages CNAME and README

**Files:**
- Create: `CNAME`

**Step 1: Create CNAME**

```
saget.org
```

**Step 2: Commit**

```bash
git add CNAME
git commit -m "feat: add CNAME for saget.org custom domain"
```

---

### Task 6: DNS & GitHub Pages setup instructions

This task is manual — no code. After pushing to GitHub:

1. Create repo `saget-org/saget-org.github.io` on GitHub (or push this repo there)
2. Enable GitHub Pages in repo Settings > Pages > Source: "Deploy from a branch" > Branch: main, folder: / (root)
3. DNS: Add these records for `saget.org`:
   - A record: `185.199.108.153`
   - A record: `185.199.109.153`
   - A record: `185.199.110.153`
   - A record: `185.199.111.153`
   - (Or a CNAME from `www.saget.org` to `saget-org.github.io`)
4. Wait for DNS propagation and GitHub's SSL certificate provisioning
5. Verify at https://saget.org

---
