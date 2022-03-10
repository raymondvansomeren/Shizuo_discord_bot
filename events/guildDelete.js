const log = require('../modules/log').log;
// const error = require('../modules/log').error;

const updateSites = require('../modules/updateSites').execute;

module.exports = {
    name: 'guildDelete',
    once: false,
    execute(client, guild)
    {
        if (client === undefined || client.user === undefined || client.connection === undefined || guild === undefined)
        {
            return;
        }
        log(`Left a server! (${guild.name})`);

        updateSites(client);

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