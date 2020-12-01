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
            return message.channel.send('I have no songs playing right now');

        message.channel.send(`Currently playing **${serverQueue.songs[0].title}\n(${serverQueue.songs[0].url})**`);
    },
};