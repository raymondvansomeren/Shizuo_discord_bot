const log = require('../modules/log').log;
const error = require('../modules/log').error;

module.exports = {
    name: 'ready',
    once: true,
    execute(client)
    {
        // updateSites();

        client.connection.get('db').query('SELECT Guild, Prefix, ModPrefix FROM guildsettings;',
            function(e, results)
            {
                if (e)
                {
                    return error(e);
                }

                results.forEach(function(r)
                {
                    client.prefixes.set(r.Guild, r.Prefix);
                    client.modPrefixes.set(r.Guild, r.ModPrefix);
                });
            });

        log('Ready!');
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