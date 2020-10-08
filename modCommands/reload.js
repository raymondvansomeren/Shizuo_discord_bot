const { ownerID } = require('../config.json');

module.exports =
{
    name: 'reload',
    description: 'Reloads a command',
    cooldown: 10,
    execute(bot, message, args)
    {
        // TODO change to var OWNER (or something like that)
        if (message.author.id === ownerID)
        {
            if (!args.length)
                return message.channel.send(`You didn't pass any command to reload, ${message.author}!`);

            const commandName = args[0].toLowerCase();
            const command = message.client.commands.get(commandName)
                || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

            if (!command)
                return message.channel.send(`There is no command with name or alias \`${commandName}\`, ${message.author}!`);

            delete require.cache[require.resolve(`./${command.name}.js`)];
            try
            {
                const newCommand = require(`./${command.name}.js`);
                message.client.commands.set(newCommand.name, newCommand);
            }
            catch (error)
            {
                console.error(error);
                message.channel.send(`There was an error while reloading a command \`${command.name}\`:\n\`${error.message}\``);
            }

            message.channel.send(`Command \`${command.name}\` was reloaded!`);
        }
        else
        {
            message.channel.send(`Wait, how can you see this command. That's kinda sus, let's vote ${message.author}!`);
        }
    },
};