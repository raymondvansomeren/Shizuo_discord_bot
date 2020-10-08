module.exports =
{
    name: 'temp',
    description: 'Reloads a command',
    cooldown: 10,
    execute(bot, message, args)
    {
        message.channel.send('test');
    },
};