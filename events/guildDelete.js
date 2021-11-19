const log = require('../modules/log').log;
// const error = require('../modules/log').error;

const updateSites = require('../modules/updateSites').execute;

module.exports = {
    name: 'guildDelete',
    once: false,
    execute(client, guild)
    {
        updateSites();

        log(`Left a server! (${guild})`);
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