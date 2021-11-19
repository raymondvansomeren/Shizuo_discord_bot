const Discord = require('discord.js');

// const log = require('../modules/log').log;
const error = require('../modules/log').error;

let now = new Date();

function escapeRegex(str)
{
    if (str === undefined)
    {
        return;
    }
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
    name: 'message',
    once: false,
    execute(message)
    {
        const client = message.client;

        if (message.author.bot || message.channel.type === 'dm')
        {
            return;
        }
        const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(client.prefixes.get(message.guild.id))}|${escapeRegex(client.modPrefixes.get(message.guild.id))})\\s*`);

        if (!prefixRegex.test(message.content.toLowerCase()))
        {
            return;
        }

        const [, matchedPrefix] = message.content.toLowerCase().match(prefixRegex);
        const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        // Moderation  commands
        if (message.content.toLowerCase().startsWith(client.modPrefixes.get(message.guild.id)))
        {
            const command = client.modCommands.get(commandName)
                || client.modCommands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

            if (!command)
            {
                return;
            }

            if (!client.modCooldowns.has(command.name))
            {
                client.modCooldowns.set(command.name, new Discord.Collection());
            }

            // //TODO Moderation cooldowns removed
            // now = Date.now();
            // const timestamps = client.modCooldowns.get(command.name);
            // const cooldownAmount = (command.cooldown || 1) * 1000;

            // if (timestamps.has(message.author.id))
            // {
            //     const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

            //     if (now < expirationTime)
            //     {
            //         const timeLeft = (expirationTime - now) / 1000;
            //         return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
            //     }
            // }
            // timestamps.set(message.author.id, now);
            // setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

            const commandDisabled = (command.disabled || false);
            if (commandDisabled)
            {
                return message.reply(`I am sorry, \`${command.name}\` is currently disabled.`)
                    .then(msg =>
                    {
                        if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                        {
                            message.delete({ timeout: 5000 });
                            msg.delete({ timeout: 5000 });
                        }
                    });
            }

            try
            {
                command.execute(client, message, args);
            }
            catch (e)
            {
                error(e);
                message.reply('there was an error trying to execute that command!')
                    .then(msg =>
                    {
                        if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                        {
                            message.delete({ timeout: 10000 });
                            msg.delete({ timeout: 10000 });
                        }
                    });
            }
        }
        // Default (everyone) commands
        else
        {
            const command = client.commands.get(commandName)
                || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

            if (!command)
            {
                return;
            }

            if (!client.cooldowns.has(command.name))
            {
                client.cooldowns.set(command.name, new Discord.Collection());
            }

            now = Date.now();
            const timestamps = client.cooldowns.get(command.name);
            const cooldownAmount = (command.cooldown || 1) * 1000;

            if (timestamps.has(message.author.id))
            {
                const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

                if (now < expirationTime)
                {
                    const timeLeft = (expirationTime - now) / 1000;
                    return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`)
                        .then(msg =>
                        {
                            if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                            {
                                message.delete({ timeout: 5000 });
                                msg.delete({ timeout: 5000 });
                            }
                        });
                }
            }
            timestamps.set(message.author.id, now);
            setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

            const commandDisabled = (command.disabled || false);
            if (commandDisabled)
            {
                return message.reply(`I am sorry, \`${command.name}\` is currently disabled.`)
                    .then(msg =>
                    {
                        if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                        {
                            message.delete({ timeout: 5000 });
                            msg.delete({ timeout: 5000 });
                        }
                    });
            }

            try
            {
                command.execute(client, message, args);
            }
            catch (e)
            {
                error(e);
                message.reply('there was an error trying to execute that command!')
                    .then(msg =>
                    {
                        if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                        {
                            message.delete({ timeout: 10000 });
                            msg.delete({ timeout: 10000 });
                        }
                    });
            }
        }
    },
};