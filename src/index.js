import { Client, Collection, GatewayIntentBits } from 'discord.js';

import { config } from './config.js';
import { loadCommands, loadEvents } from './loader.js';
import { logger } from './logger.js';
import { scheduleYtDlpUpdates } from './music/ytdlp.js';

if (!config.token)
{
    logger.fatal('DISCORD_TOKEN is not set. Copy .env.example to .env and fill in your bot token.');
    process.exit(1);
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

client.commands = await loadCommands();
/** @type {Collection<string, import('./music/GuildQueue.js').GuildQueue>} */
client.queues = new Collection();

await loadEvents(client);
scheduleYtDlpUpdates();

process.on('unhandledRejection', error => logger.error('Unhandled promise rejection:', error));

let shuttingDown = false;
async function shutdown(signal)
{
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info(`Received ${signal}, shutting down`);
    for (const queue of client.queues.values())
    {
        queue.destroy();
    }
    await client.destroy();
    process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

await client.login(config.token);
