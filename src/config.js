import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const envFile = path.join(rootDir, '.env');
if (existsSync(envFile))
{
    process.loadEnvFile(envFile);
}

const env = process.env;

function int(value, fallback)
{
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function bool(value, fallback)
{
    if (value === undefined || value === '') return fallback;
    return !['false', '0', 'no', 'off'].includes(value.toLowerCase());
}

export const config = Object.freeze({
    token: env.DISCORD_TOKEN,
    devGuildId: env.DEV_GUILD_ID || null,
    autoDeployCommands: bool(env.AUTO_DEPLOY_COMMANDS, true),
    logLevel: env.LOG_LEVEL || 'info',
    color: env.EMBED_COLOR || '#5E202E',
    supportUrl: env.SUPPORT_URL || 'https://discord.gg/ZQ23K2AkJz',
    inviteUrl: env.INVITE_URL || null,
    music: Object.freeze({
        idleTimeout: int(env.IDLE_TIMEOUT_SECONDS, 120) * 1000,
        aloneTimeout: int(env.ALONE_TIMEOUT_SECONDS, 60) * 1000,
        maxPlaylistSize: int(env.MAX_PLAYLIST_SIZE, 500),
        maxQueueSize: int(env.MAX_QUEUE_SIZE, 1000),
    }),
    ytdlp: Object.freeze({
        path: env.YTDLP_PATH || null,
        cookies: env.YTDLP_COOKIES || null,
        autoUpdate: bool(env.YTDLP_AUTO_UPDATE, true),
    }),
    botLists: Object.freeze({
        topgg: env.TOPGG_TOKEN || null,
        discordbotsgg: env.DISCORDBOTSGG_TOKEN || null,
        discordbotlist: env.DISCORDBOTLIST_TOKEN || null,
    }),
});
