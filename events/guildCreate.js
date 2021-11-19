const log = require('../modules/log').log;
const error = require('../modules/log').error;

const updateSites = require('../modules/updateSites').execute;

const { defaultPrefix, defaultModPrefix } = require('../config.json');

module.exports = {
    name: 'guildDelete',
    once: false,
    execute(client, guild)
    {
        if (client === undefined || guild === undefined)
        {
            return;
        }
        log(`New server joined! (${guild.name})`);

        updateSites(client);

        client.user.setPresence({
            status: 'online',
            activity: {
                name: `over ${client.guilds.cache.size} servers`,
                // PLAYING: WATCHING: LISTENING: STREAMING:
                type: 'WATCHING',
            },
        });

        client.connection.query(`SELECT Guild FROM guildsettings WHERE Guild = '${guild.id}';`,
            function(e, results, fields)
            {
                if (e)
                {
                    return error('line: 208. file: index.js =>\n', e);
                }

                // TODO change to use INSERT ON EXIST
                if (results.length < 1 || results == undefined)
                {
                    client.connection.query(`INSERT INTO guildsettings (Guild, Prefix, ModPrefix) VALUES ('${guild.id}', '${defaultPrefix}', '${defaultModPrefix}');`,
                        function(ee, results2)
                        {
                            if (ee)
                            {
                                return error(ee);
                            }
                        });
                }
                else
                {
                    client.connection.query(`UPDATE guildsettings SET Prefix = '${defaultPrefix}', ModPrefix = '${defaultModPrefix}' WHERE Guild = '${guild.id}';`,
                        function(eee, results3)
                        {
                            if (eee)
                            {
                                return error(eee);
                            }
                        });
                }
            });
        client.prefixes.set(guild.id, defaultPrefix);
        client.modPrefixes.set(guild.id, defaultModPrefix);
    },
};