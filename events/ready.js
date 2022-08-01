const { ActivityType } = require('discord.js');



module.exports = {
    name: 'ready',
    once: true,
    execute(client)
    {
        const updateSites = require('../modules/updateSites.js').execute;
        //setTimeout(() => updateSites(client), 5000);

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
