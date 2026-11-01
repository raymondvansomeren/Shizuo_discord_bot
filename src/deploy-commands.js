import { fileURLToPath } from 'node:url';

import { REST, Routes } from 'discord.js';

import { config } from './config.js';
import { logger } from './logger.js';

/**
 * Registers all slash commands with Discord.
 * Uses guild commands when DEV_GUILD_ID is set (instant), otherwise global commands.
 */
export async function deployCommands(commands, applicationId)
{
    const rest = new REST().setToken(config.token);
    const body = [...commands.values()].map(command => command.data.toJSON());

    if (config.devGuildId)
    {
        await rest.put(Routes.applicationGuildCommands(applicationId, config.devGuildId), { body });
        logger.info(`Registered ${body.length} commands in development server ${config.devGuildId}`);
    }
    else
    {
        await rest.put(Routes.applicationCommands(applicationId), { body });
        logger.info(`Registered ${body.length} global commands`);
    }
}

// Allow running this file directly: `npm run deploy`
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1])
{
    const { loadCommands } = await import('./loader.js');
    const rest = new REST().setToken(config.token);
    const application = await rest.get(Routes.currentApplication());
    await deployCommands(await loadCommands(), application.id);
}
