import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { GameDig } from 'gamedig';

const PORT = process.env.PORT || 8095;
const CONFIG_PATH = process.env.CONFIG_PATH || '/config/servers.json';
const CACHE_TTL = parseInt(process.env.CACHE_TTL || '30', 10) * 1000;

let cache = null;
let cacheTime = 0;

async function queryServers() {
  const now = Date.now();
  if (cache && (now - cacheTime) < CACHE_TTL) return cache;

  const raw = await readFile(CONFIG_PATH, 'utf-8');
  const config = JSON.parse(raw);

  const results = await Promise.all(config.servers.map(async (server) => {
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
    } catch {
      return {
        ...server,
        status: 'offline',
        players: null,
        maxPlayers: null,
        lastChecked: new Date().toISOString(),
      };
    }
  }));

  cache = { servers: results };
  cacheTime = now;
  return cache;
}

const server = createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/' || req.url === '/status') {
    try {
      const data = await queryServers();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    } catch (err) {
      console.error('Query failed:', err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to query servers' }));
    }
  } else if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Status service listening on port ${PORT}`);
});
