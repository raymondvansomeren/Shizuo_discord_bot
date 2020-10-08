module.exports =
{
    name: 'template',
    description: 'This is a template.',
    aliases: ['temp'],
    usage: '',
    cooldown: 3,
    execute(bot, message, args)
    {
        message.channel.send('This is a template command.');
    },
};