const ytdl = require('ytdl-core');

module.exports =
{
    name: 'stop',
    description: 'Stop playing songs.',
    aliases: ['fuckoff', 'quit', 'exit'],
    usage: '',
    cooldown: 3,
    async execute(bot, message, args)
    {
        serverQueue = bot.queue.get(message.guild.id);
        if (!message.member.voice.channel)
            return message.channel.send('You have to be in a voice channel to stop the music!');

        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end();
        
        message.channel.send(`Disconnected from voice`);
    },
};