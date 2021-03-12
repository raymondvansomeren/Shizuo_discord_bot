const { dbhost, dbuser, dbpassword, db } = require('../config.json');
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host     : dbhost,
    user     : dbuser,
    password : dbpassword,
    database : db,
});

let now = new Date();

module.exports =
{
    name: 'prefix',
    description: 'Used to change the prefix for the default commands. The prefix may not be any longer than 5 characters.',
    usage: '[prefix]',
    execute(bot, message, args)
    {
        if (!message.member.hasPermission('MANAGE_GUILD'))
        {
            return message.channel.send('You don\'t have permission to use this command.')
                .then(msg =>
                {
                    if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                    {
                        message.delete({ timeout: 5000 });
                        msg.delete({ timeout: 5000 });
                    }
                });
        }
        if (args[0].length > 5)
        {
            return message.channel.send('The prefix may not surpass 5 characters.')
                .then(msg =>
                {
                    if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                    {
                        message.delete({ timeout: 5000 });
                        msg.delete({ timeout: 5000 });
                    }
                });
        }

        connection.query(`SELECT ModPrefix FROM guildsettings WHERE Guild = '${message.guild.id}'`,
            function(error, results, fields)
            {
                if (error)
                {
                    message.channel.send(error);
                    now = new Date();
                    return console.error(now.toUTCString(), ':', error);
                }
                if (results[0].ModPrefix === args[0])
                {
                    return message.channel.send('You can\'t have the same prefix for default commands as you have for moderation commands.')
                        .then(msg =>
                        {
                            if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                            {
                                message.delete({ timeout: 5000 });
                                msg.delete({ timeout: 5000 });
                            }
                        });
                }

                connection.query(`UPDATE guildsettings SET Prefix = '${args[0]}' WHERE Guild = '${message.guild.id}'`,
                    function(error2, results2, fields2)
                    {
                        if (error2)
                        {
                            message.channel.send(error2);
                            now = new Date();
                            return console.error(now.toUTCString(), ':', error2);
                        }
                        bot.prefixes.set(message.guild.id, args[0]);
                        message.channel.send(`Succesfully changed the prefix to \`${args[0]}\``)
                            .then(msg =>
                            {
                                if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                                {
                                    message.delete({ timeout: 5000 });
                                    msg.delete({ timeout: 5000 });
                                }
                            });
                    });
            });
    },
};