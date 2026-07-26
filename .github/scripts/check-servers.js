import { readFile, writeFile, mkdir, copyFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { GameDig } from 'gamedig';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const SERVERS_PATH = resolve(ROOT, 'servers.json');
const SITE_DIR = resolve(ROOT, '_site');

async function checkServer(server) {
  if (!server.visible) return server;

  try {
    const result = await GameDig.query({
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
  const config = JSON.parse(raw);

  let status = null;

  try {
    console.log('Fetching live status from http://home.saget.org:8095/status...');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch('http://home.saget.org:8095/status', { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.servers)) {
        status = data;
        console.log('Successfully fetched live status from home.saget.org:8095');
      }
    }
  } catch (err) {
    console.log('Live status API unreachable, falling back to GameDig query:', err.message);
  }

  if (!status || !Array.isArray(status.servers)) {
    const updated = await Promise.all(config.servers.map(checkServer));
    status = { servers: updated };
  }

  await mkdir(SITE_DIR, { recursive: true });

  // Write status data
  await writeFile(resolve(SITE_DIR, 'status.json'), JSON.stringify(status, null, 2) + '\n');
  console.log('status.json written to _site/');

  // Copy static files
  const staticFiles = ['index.html', 'CNAME', 'servers.json'];
  for (const file of staticFiles) {
    try {
      await copyFile(resolve(ROOT, file), resolve(SITE_DIR, file));
      console.log(`Copied ${file} to _site/`);
    } catch {
      console.log(`Skipping ${file} (not found)`);
    }
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
