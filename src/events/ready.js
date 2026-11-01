import { Events } from 'discord.js';

import { deployCommands } from '../deploy-commands.js';
import { config } from '../config.js';
import { logger } from '../logger.js';
import { updateBotLists, updatePresence } from '../utils/presence.js';

export default {
    name: Events.ClientReady,
    once: true,
    async execute(client)
    {
        logger.info(`Logged in as ${client.user.tag} in ${client.guilds.cache.size} servers`);
        updatePresence(client);

        if (config.autoDeployCommands)
        {
            try
            {
                await deployCommands(client.commands, client.application.id);
            }
            catch (error)
            {
                logger.error('Registering slash commands failed:', error);
            }
        }

        await updateBotLists(client);
        logger.info('Fully started!');
    },
};
