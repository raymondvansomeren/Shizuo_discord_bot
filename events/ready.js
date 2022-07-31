const { ActivityType } = require('discord.js');

const updateSites = require('../modules/updateSites').execute;

module.exports = {
    name: 'ready',
    once: true,
    execute(client)
    {
        updateSites(client);

        require('../deploy-commands.js');

        client.user.setPresence({
            status: 'online',
            activities: [{
                name: `over ${client.guilds.cache.size} servers`,
                // PLAYING: WATCHING: LISTENING: STREAMING:
                type: ActivityType.Watching,
            }],
        });
        client.logger.info('Fully started!');
    },
};