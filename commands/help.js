// const { defaultPrefix } = require('../config.json');

module.exports =
{
    name: 'help',
    description: 'List all of my commands or info about a specific command.',
    aliases: ['commands'],
    usage: '[command name]',
    execute(bot, message, args)
    {
        const data = [];
        const { commands } = message.client;

        if (!args.length)
        {
            data.push('Here\'s a list of all my commands:');
            for (const cmd of commands.map(command => command.name))
                data.push(`:white_small_square: **${cmd}**`);
            data.push(`\nYou can send \`${bot.prefixes.get(message.guild.id)}help [command name]\` to get info on a specific command!`);

            return message.channel.send(data, { split: true });
        }

        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command)
        {
            return message.reply('that\'s not a valid command!')
                .then(msg =>
                {
                    if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                    {
                        message.delete({ timeout: 5000 });
                        msg.delete({ timeout: 5000 });
                    }
                });
        }

        data.push(`**Name:** ${command.name}`);

        if (command.aliases)
            data.push(`**Aliases:** ${command.aliases.join(', ')}`);
        if (command.description)
            data.push(`**Description:** ${command.description}`);
        if (command.usage)
            data.push(`**Usage:** ${bot.prefixes.get(message.guild.id)}${command.name} ${command.usage}`);

        data.push(`**Cooldown:** ${command.cooldown || 1} second(s)`);

        message.channel.send(data, { split: true });
    },
};