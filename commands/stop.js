module.exports =
{
    name: 'stop',
    description: 'Stop playing songs.',
    aliases: ['fuckoff', 'quit', 'exit'],
    usage: '',
    cooldown: 3,
    async execute(bot, message, args)
    {
        if (message.member.roles.find(role => role.name.toLowerCase() === 'nomusic') || message.member.roles.find(role => role.name.toLowerCase() === 'incapacitated'))
            return message.channel.send('Seems like you aren\'t allowed to use the music features :confused:');

        const serverQueue = bot.queue.get(message.guild.id);
        if (!message.member.voice.channel)
            return message.channel.send('You have to be in a voice channel to stop the music!');

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