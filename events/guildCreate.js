const { logLevel } = require('../config.json');
const logger = require('log4js').getLogger();
logger.level = logLevel;

const updateSites = require('../modules/updateSites').execute;

// const { defaultPrefix, defaultModPrefix } = require('../config.json');

module.exports = {
    name: 'guildCreate',
    once: false,
    execute(guild)
    {
        logger.info(`New server joined! (${guild.name})`);

        updateSites(guild.client);
        const client = guild.client;

        client.user.setPresence({
            status: 'online',
            activity: {
                name: `over ${client.guilds.cache.size} servers`,
                // PLAYING: WATCHING: LISTENING: STREAMING:
                type: 'WATCHING',
            },
        });

        // client.connection.query(`SELECT Guild FROM guildsettings WHERE Guild = '${guild.id}';`,
        //     function(e, results, fields)
        //     {
        //         if (e)
        //         {
        //             return logger.error('line: 208. file: index.js =>\n', e);
        //         }

        //         // TODO change to use INSERT ON EXIST
        //         if (results.length < 1 || results == undefined)
        //         {
        //             client.connection.query(`INSERT INTO guildsettings (Guild, Prefix, ModPrefix) VALUES ('${guild.id}', '${defaultPrefix}', '${defaultModPrefix}');`,
        //                 function(ee, results2)
        //                 {
        //                     if (ee)
        //                     {
        //                         return logger.error(ee);
        //                     }
        //                 });
        //         }
        //         else
        //         {
        //             client.connection.query(`UPDATE guildsettings SET Prefix = '${defaultPrefix}', ModPrefix = '${defaultModPrefix}' WHERE Guild = '${guild.id}';`,
        //                 function(eee, results3)
        //                 {
        //                     if (eee)
        //                     {
        //                         return logger.error(eee);
        //                     }
        //                 });
        //         }
        //     });
        // client.prefixes.set(guild.id, defaultPrefix);
        // client.modPrefixes.set(guild.id, defaultModPrefix);
    },
};