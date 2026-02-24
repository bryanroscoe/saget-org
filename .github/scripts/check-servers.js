import { readFile, writeFile } from 'fs/promises';
import Gamedig from 'gamedig';

const SERVERS_PATH = new URL('../../servers.json', import.meta.url);

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
  } else {
    console.log('No changes');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
