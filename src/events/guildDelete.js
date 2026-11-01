import { Events } from 'discord.js';

import { logger } from '../logger.js';
import { updateBotLists, updatePresence } from '../utils/presence.js';

export default {
    name: Events.GuildDelete,
    async execute(guild)
    {
        logger.info(`Left a server: ${guild.name} (${guild.id})`);
        guild.client.queues.get(guild.id)?.destroy();
        updatePresence(guild.client);
        await updateBotLists(guild.client);
    },
};
