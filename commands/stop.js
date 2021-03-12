module.exports =
{
    name: 'stop',
    description: 'Stop playing songs.',
    aliases: ['fuckoff', 'quit', 'exit'],
    usage: '',
    async execute(bot, message, args)
    {
        if (message.member.roles.cache.find(role => role.name.toLowerCase() === 'nomusic') || message.member.roles.cache.find(role => role.name.toLowerCase() === 'incapacitated'))
        {
            return message.channel.send('Seems like you aren\'t allowed to use the music features :confused:')
                .then(msg =>
                {
                    if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                    {
                        message.delete({ timeout: 5000 });
                        msg.delete({ timeout: 5000 });
                    }
                });
        }

        const serverQueue = bot.queue.get(message.guild.id);
        if (!message.member.voice.channel)
        {
            return message.channel.send('You have to be in a voice channel to stop the music!')
                .then(msg =>
                {
                    if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                    {
                        message.delete({ timeout: 5000 });
                        msg.delete({ timeout: 5000 });
                    }
                });
        }

        if (!serverQueue)
        {
            message.guild.me.voice.setChannel(null);
        }
        else
        {
            serverQueue.songs = [];
            serverQueue.connection.dispatcher.end();
        }

        message.channel.send('Disconnected from voice');
    },
};