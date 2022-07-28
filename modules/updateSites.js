const axios = require('axios');
const { siteTokens } = require('../config.json');

module.exports = {
    name: 'updateSites',
    execute(client)
    {
        const guilds = client.guilds?.cache?.size;

        const topgg = siteTokens.topgg.token;
        axios.post(siteTokens.topgg.url,
            {
                server_count: guilds,
            },
            {
                headers:
                {
                    'Authorization': `${topgg}`,
                },
            });

        const discordbotsgg = siteTokens.discordbotsgg.token;
        axios.post(siteTokens.discordbotsgg.url,
            {
                guildCount: guilds,
            },
            {
                headers:
                {
                    'Authorization': `${discordbotsgg}`,
                },
            });

        const discordbotlist = siteTokens.discordbotlist.token;
        axios.post(siteTokens.discordbotlist.url,
            {
                guilds: `${guilds}`,
            },
            {
                headers:
                {
                    'Authorization': `${discordbotlist}`,
                },
            });
    },
};