import { ActivityType } from 'discord.js';

import { config } from '../config.js';
import { logger } from '../logger.js';

export function updatePresence(client)
{
    client.user.setPresence({
        status: 'online',
        activities: [{ name: `over ${client.guilds.cache.size} servers`, type: ActivityType.Watching }],
    });
}

/**
 * Posts the server count to the configured bot list sites.
 */
export async function updateBotLists(client)
{
    if (config.devGuildId) return;

    const id = client.user.id;
    const servers = client.guilds.cache.size;
    const sites = [
        { name: 'top.gg', token: config.botLists.topgg, url: `https://top.gg/api/bots/${id}/stats`, body: { server_count: servers } },
        { name: 'discord.bots.gg', token: config.botLists.discordbotsgg, url: `https://discord.bots.gg/api/v1/bots/${id}/stats`, body: { guildCount: servers } },
        { name: 'discordbotlist.com', token: config.botLists.discordbotlist, url: `https://discordbotlist.com/api/v1/bots/${id}/stats`, body: { guilds: servers } },
    ];

    await Promise.all(sites.filter(site => site.token).map(async site =>
    {
        try
        {
            const response = await fetch(site.url, {
                method: 'POST',
                headers: { 'Authorization': site.token, 'Content-Type': 'application/json' },
                body: JSON.stringify(site.body),
                signal: AbortSignal.timeout(10_000),
            });
            if (!response.ok)
            {
                logger.warn(`Updating ${site.name} failed: HTTP ${response.status}`);
            }
        }
        catch (error)
        {
            logger.warn(`Updating ${site.name} failed: ${error.message}`);
        }
    }));
}
