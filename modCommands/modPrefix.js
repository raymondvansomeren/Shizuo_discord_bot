const { dbhost, dbuser, dbpassword, db } = require('../config.json');
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host     : dbhost,
    user     : dbuser,
    password : dbpassword,
    database : db,
});

module.exports =
{
    name: 'modPrefix',
    description: 'Used to change the prefix for the moderation commands.',
    aliases: ['mPrefix'],
    usage: '[prefix]',
    cooldown: 3,
    execute(bot, message, args)
    {
        if (args[0].length > 5)
            return message.channel.send('The modPrefix may not surpass 5 characters.');

        connection.query(`UPDATE guildsettings SET modPrefix = '${args[0]}'`,
            function(error, results, fields)
            {
                if (error)
                {
                    message.channel.send(error);
                    return console.log(error);
                }
                message.channel.send(`Succesfully changed the moderation prefix to '${args[0]}'`);
            });
    },
};