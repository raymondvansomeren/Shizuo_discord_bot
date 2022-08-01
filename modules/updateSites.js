const axios = require('axios');
const { siteTokens, inDevelopment } = require('../config.json');

module.exports = {
    name: 'updateSites',
    execute(client)
    {
        if (inDevelopment) return;
 
        //const guilds = parseInt(client?.guilds?.cache?.size);
        let guilds = client?.guilds?.cache?.size;

	if (guilds === undefined || guilds === null || guilds === "NaN") return console.log('guilds is undefined');
	guilds = parseInt(guilds);

        const topgg = siteTokens.topgg.token;
        axios.post(siteTokens.topgg.url,
            {
                'server_count': guilds,
		'shards': [],
            },
            {
                headers:
                {
                    'Authorization': `${topgg}`,
                },
            });

        const discord_bots_gg = siteTokens.discord_bots_gg.token;
        axios.post(siteTokens.discord_bots_gg.url,
            {
                'guildCount': guilds,
            },
            {
                headers:
                {
                    'Authorization': `${discord_bots_gg}`,
                },
            });

        const discordbotlist = siteTokens.discordbotlist.token;
        axios.post(siteTokens.discordbotlist.url,
            {
                'guilds': guilds,
            },
            {
                headers:
                {
                    'Authorization': `${discordbotlist}`,
                },
            });

        // const discordbots_gg = siteTokens.discordbots_gg.token;
        // axios.post(siteTokens.discordbots_gg.url,
        //     {
        //         '': `${guilds}`,
        //     },
        //     {
        //         headers:
        //         {
        //             'Authorization': `${discordbots_gg}`,
        //         },
        //     });
    },
};


module.exports.execute('something');
