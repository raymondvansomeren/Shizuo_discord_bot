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
                return message.channel.send('Well, this ends the prefix');
            });

        connection.query(`UPDATE guildsettings SET Prefix = '${args[0]}' WHERE Guild = '${message.guild.id}'`,
            function(error, results, fields)
            {
                if (error)
                {
                    message.channel.send(error);
                    return console.log(error);
                }
                message.channel.send(`Succesfully changed the prefix to \`${args[0]}\``);
            });
    },
};