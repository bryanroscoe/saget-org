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

  const updated = await Promise.all(config.servers.map(checkServer));
  const status = { servers: updated };

  await mkdir(SITE_DIR, { recursive: true });

  // Write live status data
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
