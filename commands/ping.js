module.exports = {
    name: 'ping',
    cooldown: 5,
    execute(bot, message, args)
    {
        message.channel.send('Pong.');
    },
};