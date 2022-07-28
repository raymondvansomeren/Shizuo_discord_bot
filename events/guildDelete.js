const { logLevel } = require('../config.json');
const logger = require('log4js').getLogger();
logger.level = logLevel;

const updateSites = require('../modules/updateSites').execute;

module.exports = {
    name: 'guildDelete',
    once: false,
    execute(guild)
    {
        const client = guild.client;
        logger.info(`Left a server! (${guild.name})`);

        updateSites(guild.client);

        client.user.setPresence({
            status: 'online',
            activity: {
                name: `over ${client.guilds.cache.size} servers`,
                // PLAYING: WATCHING: LISTENING: STREAMING:
                type: 'WATCHING',
            },
        });
    },
};