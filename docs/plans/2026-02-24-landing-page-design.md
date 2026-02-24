# saget.org Landing Page Design

## Overview

A cyberpunk-aesthetic calling card and game server status page for saget.org. Static site hosted on GitHub Pages with GitHub Actions providing automated server status checks.

## Architecture

Single static site with three files:

- `index.html` — self-contained landing page (HTML + CSS + inline JS)
- `servers.json` — server list config + live status data
- `.github/workflows/server-status.yml` — cron job that queries servers and commits status updates

No build step. No framework. No backend.

## Page Layout

### Hero

Large "SAGET.ORG" logotype with neon glow animation. Dark atmospheric background with subtle grid lines and gradient glow. No tagline — let the aesthetic speak.

### Server Status Panel

Styled like a terminal/HUD readout. Renders from `servers.json`. Each server shows:

- Name and game type
- Address
- Online/offline indicator (green/red dot with glow)
- Player count (when available from query)
- Last checked timestamp

When `servers.json` has no entries or all entries are hidden, the panel is hidden entirely.

### Footer

Minimal. Subtle "saget.org" text. CRT scanline overlay spans the full page.

## Visual Direction

### Palette

- Background: near-black (#0a0a0f)
- Primary neon: cyan/teal (#00ffd5)
- Accent: hot pink (#ff2d6b)
- Secondary text: dim gray (#4a4a5a)
- Panel backgrounds: slightly lighter dark (#12121a)

### Typography

- Display: "Oxanium" (tech/geometric display font)
- Mono: "Share Tech Mono" (server status, addresses, timestamps)
- Both from Google Fonts

### Effects

- CRT scanline overlay (CSS, subtle opacity)
- Neon text-shadow glow on logotype
- Gentle flicker animation on logo (occasional, not constant)
- Status dots pulse when online
- Retro gaming nod: server panel styled like a classic server browser / console HUD

### Restraint

Cyberpunk atmosphere without theme park overkill. Effects are subtle and atmospheric. Dark, moody, confident.

## Server Configuration

`servers.json` format:

```json
{
  "servers": [
    {
      "name": "Satisfactory",
      "game": "satisfactory",
      "address": "saget.org",
      "port": 7777,
      "queryPort": 15777,
      "visible": true,
      "status": "offline",
      "players": null,
      "maxPlayers": null,
      "lastChecked": null
    }
  ]
}
```

To add a server: add an entry with `visible: true`. To remove: set `visible: false` or delete the entry. The GitHub Action updates `status`, `players`, `maxPlayers`, and `lastChecked` fields.

## GitHub Actions Status Checker

- Runs on cron (every 5 minutes)
- Uses `gamedig` npm package to query game servers
- Satisfactory: queries UDP port 15777 for server info, player count
- Writes results back to `servers.json` and commits if changed
- Supports multiple game types via gamedig's protocol library

## Hosting

- Repository: `saget-org/saget-org.github.io` (or current repo with Pages enabled)
- GitHub Pages serves from main branch root
- CNAME record: `saget.org` -> GitHub Pages
- CNAME file in repo for custom domain
- GitHub Actions cron: free tier is sufficient

## Initial Server

Satisfactory dedicated server:
- Host: saget.org
- Game port: 7777 (UDP)
- Query port: 15777 (UDP)
- Protocol: satisfactory (gamedig)
