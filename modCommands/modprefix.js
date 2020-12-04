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
    name: 'modprefix',
    description: 'Used to change the prefix for the moderation commands.',
    aliases: ['mprefix'],
    usage: '[prefix]',
    cooldown: 3,
    execute(bot, message, args)
    {
        if (!message.member.hasPermission('MANAGE_GUILD'))
            return message.channel.send('You don\'t have permission to use this command.');
        if (args[0].length > 5)
            return message.channel.send('The modPrefix may not surpass 5 characters.');

        // TODO set bot.modPrefix
        connection.query(`SELECT Prefix FROM guildsettings WHERE Guild = '${message.guild.id}'`,
            function(error, results, fields)
            {
                if (error)
                {
                    message.channel.send(error);
                    return console.log(error);
                }
                if (results[0].Prefix === args[0])
                    return message.channel.send('You can\'t have the same prefix for moderation commands as you have for default commands.');

                connection.query(`UPDATE guildsettings SET ModPrefix = '${args[0]}' WHERE Guild = '${message.guild.id}'`,
                    function(error2, results2, fields2)
                    {
                        if (error2)
                        {
                            message.channel.send(error2);
                            return console.log(error2);
                        }
                        message.channel.send(`Succesfully changed the moderation prefix to \`${args[0]}\``);
                    });
            });
    },
};