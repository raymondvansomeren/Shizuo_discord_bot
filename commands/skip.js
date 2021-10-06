module.exports =
{
    name: 'skip',
    description: 'Skips the current song.',
    aliases: ['next'],
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

        if (!message.member.voice.channel)
        {
            return message.channel.send('You have to be in a voice channel to skip music!')
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
        if (!serverQueue)
        {
            return message.channel.send('There is no song that I could skip!')
                .then(msg =>
                {
                    if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                    {
                        message.delete({ timeout: 5000 });
                        msg.delete({ timeout: 5000 });
                    }
                });
        }

        if (serverQueue.songs.length === 1)
            message.channel.send(`Skipped **${serverQueue.songs[0].title}**\n(${serverQueue.songs[0].url}). No more songs in the queue`);
        else
            message.channel.send(`Skipped **${serverQueue.songs[0].title}**\n(${serverQueue.songs[0].url})`);

        if (serverQueue.loop === 'all')
        {
            serverQueue.connection.dispatcher.end();
        }
        else if (serverQueue.loop === 'single')
        {
            serverQueue.loop = 'all';
            serverQueue.connection.dispatcher.end();
            setTimeout(() =>
            {
                serverQueue.loop = 'single';
            }, 100);
        }
        else
        {
            serverQueue.connection.dispatcher.end();
        }
    },
};