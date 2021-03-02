module.exports =
{
    name: 'support',
    description: 'Bot support server on discord.',
    aliases: ['discord'],
    usage: '',
    cooldown: 3,
    execute(bot, message, args)
    {
        message.channel.send('Here is the link to the support server: ' + require('./config.json').discord);
    },
};