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
    name: 'prefix',
    description: 'Used to change the prefix for the default commands. The prefix may not be any longer than 5 characters.',
    usage: '[prefix]',
    cooldown: 3,
    execute(bot, message, args)
    {
        if (!message.member.hasPermission('MANAGE_GUILD'))
            return message.channel.send('You don\'t have permission to use this command.');
        if (args[0].length > 5)
            return message.channel.send('The prefix may not surpass 5 characters.');

        connection.query(`SELECT ModPrefix FROM guildsettings WHERE Guild = '${message.guild.id}'`,
            function(error, results, fields)
            {
                if (error)
                {
                    message.channel.send(error);
                    return console.log(error);
                }
                if (results[0].ModPrefix === args[0])
                    return message.channel.send('You can\'t have the same prefix for default commands as you have for moderation commands.');

                connection.query(`UPDATE guildsettings SET Prefix = '${args[0]}' WHERE Guild = '${message.guild.id}'`,
                    function(error2, results2, fields2)
                    {
                        if (error2)
                        {
                            message.channel.send(error2);
                            return console.log(error2);
                        }
                        bot.prefixes.set(message.guild.id, args[0]);
                        message.channel.send(`Succesfully changed the prefix to \`${args[0]}\``);
                    });
            });
    },
};