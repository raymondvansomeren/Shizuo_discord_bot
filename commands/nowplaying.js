module.exports =
{
    name: 'nowplaying',
    description: 'Shows the currently playing song',
    aliases: ['playing', 'currentsong', 'np', 'cs'],
    usage: '',
    cooldown: 3,
    async execute(bot, message, args)
    {
        const serverQueue = bot.queue.get(message.guild.id);
        if (!serverQueue)
        {
            return message.channel.send('I have no songs playing right now')
                .then(msg =>
                {
                    if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                    {
                        message.delete({ timeout: 5000 });
                        msg.delete({ timeout: 5000 });
                    }
                });
        }

        message.channel.send(`Currently playing **${serverQueue.songs[0].title}\n(${serverQueue.songs[0].url})**`);
    },
};