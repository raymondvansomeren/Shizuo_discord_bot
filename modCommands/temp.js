module.exports =
{
    name: 'temp',
    description: 'This is just a temporary test command',
    cooldown: 5,
    execute(bot, message, args)
    {
        message.channel.send('test');
    },
};