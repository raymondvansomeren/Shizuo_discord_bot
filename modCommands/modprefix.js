const { dbhost, dbuser, dbpassword, db } = require('../config.json');
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host     : dbhost,
    user     : dbuser,
    password : dbpassword,
    database : db,
});

// const log = require('../modules/log').log;
const error = require('../modules/log').error;

module.exports =
{
    name: 'modprefix',
    description: 'Used to change the prefix for the moderation commands.',
    aliases: ['mprefix'],
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
            return message.channel.send('The modPrefix may not surpass 5 characters.')
                .then(msg =>
                {
                    if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                    {
                        message.delete({ timeout: 5000 });
                        msg.delete({ timeout: 5000 });
                    }
                });
        }

        connection.query(`SELECT Prefix FROM guildsettings WHERE Guild = '${message.guild.id}'`,
            function(e, results, fields)
            {
                if (e)
                {
                    message.channel.send(e);
                    return error(e);
                }
                if (results[0].Prefix === args[0])
                {
                    return message.channel.send('You can\'t have the same prefix for moderation commands as you have for default commands.')
                        .then(msg =>
                        {
                            if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                            {
                                message.delete({ timeout: 5000 });
                                msg.delete({ timeout: 5000 });
                            }
                        });
                }

                connection.query(`UPDATE guildsettings SET ModPrefix = '${args[0]}' WHERE Guild = '${message.guild.id}'`,
                    function(ee, results2, fields2)
                    {
                        if (ee)
                        {
                            message.channel.send(ee);
                            return error(ee);
                        }
                        bot.modPrefixes.set(message.guild.id, args[0]);
                        message.channel.send(`Succesfully changed the moderation prefix to \`${args[0]}\``)
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