const { ipcMain } = require('electron');

/**
 * Discord Rich Presence integration via discord-rpc. Wrapped defensively so
 * the app still runs fine if Discord isn't installed/running or the
 * dependency isn't present — RPC is a nice-to-have, not a hard requirement.
 *
 * Requires a Discord Application client ID from https://discord.com/developers/applications
 * and the `discord-rpc` package (`npm install discord-rpc` in /electron).
 */
let rpcClient = null;

async function init() {
  const clientId = process.env.DISCORD_CLIENT_ID;
  if (!clientId) {
    console.log('[discordRpc] DISCORD_CLIENT_ID not set — skipping Rich Presence.');
    return;
  }

  try {
    // eslint-disable-next-line global-require
    const RPC = require('discord-rpc');
    rpcClient = new RPC.Client({ transport: 'ipc' });

    rpcClient.on('ready', () => {
      console.log('[discordRpc] Connected to Discord.');
      setActivity({ details: 'Browsing Phonkify', state: 'Idle' });
    });

    await rpcClient.login({ clientId });
  } catch (err) {
    console.warn('[discordRpc] Discord RPC unavailable:', err.message);
  }

  ipcMain.on('discord-activity', (_event, activity) => {
    setActivity(activity);
  });
}

function setActivity({ details, state, largeImageKey = 'phonkify_logo' }) {
  if (!rpcClient) return;
  rpcClient
    .setActivity({
      details,
      state,
      startTimestamp: Date.now(),
      largeImageKey,
      largeImageText: 'Phonkify',
      instance: false,
    })
    .catch(() => {});
}

module.exports = { init, setActivity };
