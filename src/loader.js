import { readdir } from 'node:fs/promises';

import { Collection } from 'discord.js';

import { logger } from './logger.js';

async function importDirectory(dir)
{
    const files = (await readdir(dir)).filter(file => file.endsWith('.js'));
    const modules = [];
    for (const file of files)
    {
        const { default: mod } = await import(new URL(file, dir));
        modules.push({ file, mod });
    }
    return modules;
}

export async function loadCommands()
{
    const commands = new Collection();
    for (const { file, mod } of await importDirectory(new URL('./commands/', import.meta.url)))
    {
        if (!mod?.data || typeof mod.execute !== 'function')
        {
            logger.warn(`Skipping command file ${file}: missing "data" or "execute"`);
            continue;
        }
        commands.set(mod.data.name, mod);
    }
    logger.info(`Loaded ${commands.size} commands`);
    return commands;
}

export async function loadEvents(client)
{
    for (const { file, mod } of await importDirectory(new URL('./events/', import.meta.url)))
    {
        if (!mod?.name || typeof mod.execute !== 'function')
        {
            logger.warn(`Skipping event file ${file}: missing "name" or "execute"`);
            continue;
        }
        const listener = async (...args) =>
        {
            try
            {
                await mod.execute(...args);
            }
            catch (error)
            {
                logger.error(`Error in ${mod.name} handler:`, error);
            }
        };
        client[mod.once ? 'once' : 'on'](mod.name, listener);
        logger.debug(`Event ${mod.name} loaded`);
    }
}
