const ytdl = require('ytdl-core');

module.exports =
{
    name: 'resume',
    description: 'Resumes the song.',
    aliases: [''],
    usage: '',
    cooldown: 3,
    async execute(bot, message, args)
    {
        serverQueue = bot.queue.get(message.guild.id);
        if (!message.member.voice.channel)
            return message.channel.send('You have to be in a voice channel to resume the music!');

        if (!serverQueue)
            return message.channel.send('There is no song that I could resume!');

        serverQueue.connection.dispatcher.resume();
        
        message.channel.send(`Resumed song **${serverQueue.songs[0].title}\n(${serverQueue.songs[0].url})**`);
    },
};