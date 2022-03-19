const { ownerID } = require('../config.json');

module.exports =
{
    name: 'announce',
    description: 'Announces to every server I am in',
    usage: '[command] [announcement]',
    hide: true,
    execute(bot, message, args)
    {
        if (message.author.id === ownerID)
        {
            if (!args.length)
                return message.channel.send(`You didn't pass any command to reload, ${message.author}!`);

            bot.guilds.cache.forEach((guild) =>
            {
                guild.systemChannel.send(args.join(' '));
            });
        }
        else
        {
            message.channel.send(`Wait, how can you see this command. That's kinda sus, let's vote ${message.author}!`);
        }
    },
};