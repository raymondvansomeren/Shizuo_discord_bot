const { ownerID } = require('../config.json');

module.exports =
{
    name: 'reload',
    description: 'Reloads a command',
    cooldown: 0.1,
    usage: '[command]',
    execute(bot, message, args)
    {
        if (message.author.id === ownerID)
        {
            if (!args.length)
                return message.channel.send(`You didn't pass any command to reload, ${message.author}!`);

            const commandName = args[0].toLowerCase();

            // Default commands
            for (;;)
            {
                const commands = message.client.commands;
                const command = commands.get(commandName)
                    || commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

                if (!command)
                {
                    message.channel.send(`There is no default command with name or alias \`${commandName}\`!`);
                    break;
                }

                delete require.cache[require.resolve(`../commands/${command.name}.js`)];
                try
                {
                    const newCommand = require(`../commands/${command.name}.js`);
                    commands.set(newCommand.name, newCommand);
                    message.channel.send(`Default command \`${command.name}\` was reloaded!`);
                }
                catch (error)
                {
                    console.error(error);
                    message.channel.send(`There was an error while reloading a default command \`${command.name}\`:\n\`${error.message}\`\nPlease contact the dev: \`raymond570#2966\``);
                }
                break;
            }

            // Moderation commands
            for (;;)
            {
                const commands = message.client.modCommands;
                const command = commands.get(commandName)
                    || commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

                if (!command)
                {
                    message.channel.send(`There is no moderation command with name or alias \`${commandName}\`!`);
                    break;
                }

                delete require.cache[require.resolve(`../modCommands/${command.name}.js`)];
                try
                {
                    const newCommand = require(`../modCommands/${command.name}.js`);
                    commands.set(newCommand.name, newCommand);
                    message.channel.send(`Moderation command \`${command.name}\` was reloaded!`);
                }
                catch (error)
                {
                    console.error(error);
                    message.channel.send(`There was an error while reloading a moderation command \`${command.name}\`:\n\`${error.message}\`\nPlease contact the dev: \`raymond570#2966\``);
                }
                break;
            }
        }
        else
        {
            message.channel.send(`Wait, how can you see this command. That's kinda sus, let's vote ${message.author}!`);
        }
    },
};