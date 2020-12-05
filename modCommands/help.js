// const { defaultModPrefix } = require('../config.json');

module.exports =
{
    name: 'help',
    description: 'List all of my moderation commands or info about a specific command.',
    aliases: ['commands'],
    usage: '[command name]',
    cooldown: 3,
    execute(bot, message, args)
    {
        const data = [];
        const { modCommands } = message.client;

        if (!args.length)
        {
            data.push('Here\'s a list of all my commands:');
            for (const cmd of modCommands.map(command => command.name))
            {
                if (cmd !== 'reload')
                    data.push(`:white_small_square: **${cmd}**`);
            }
            data.push(`\nYou can send \`${bot.modPrefixes.get(message.guild.id)}help [command name]\` to get info on a specific command!`);

            return message.channel.send(data, { split: true });
        }

        const name = args[0].toLowerCase();
        const command = modCommands.get(name) || modCommands.find(c => c.aliases && c.aliases.includes(name));

        if (!command)
            return message.reply('that\'s not a valid command!');

        data.push(`**Name:** ${command.name}`);

        if (command.aliases)
            data.push(`**Aliases:** ${command.aliases.join(', ')}`);
        if (command.description)
            data.push(`**Description:** ${command.description}`);
        if (command.usage)
            data.push(`**Usage:** ${bot.modPrefixes.get(message.guild.id)}${command.name} ${command.usage}`);

        data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

        message.channel.send(data, { split: true });
    },
};