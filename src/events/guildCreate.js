import { Events } from 'discord.js';

import { logger } from '../logger.js';
import { updateBotLists, updatePresence } from '../utils/presence.js';

export default {
    name: Events.GuildCreate,
    async execute(guild)
    {
        logger.info(`Joined a new server: ${guild.name} (${guild.id})`);
        updatePresence(guild.client);
        await updateBotLists(guild.client);
    },
};
