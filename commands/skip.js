module.exports =
{
    name: 'skip',
    description: 'Skips the current song.',
    aliases: ['next'],
    usage: '',
    cooldown: 3,
    async execute(bot, message, args)
    {
        if (message.member.roles.find(role => role.name.toLowerCase() === 'nomusic') || message.member.roles.find(role => role.name.toLowerCase() === 'incapacitated'))
            return message.channel.send('Seems like you aren\'t allowed to use the music features :confused:');

        const serverQueue = bot.queue.get(message.guild.id);
        if (!message.member.voice.channel)
            return message.channel.send('You have to be in a voice channel to skip music!');

        if (!serverQueue)
            return message.channel.send('There is no song that I could skip!');

        if (serverQueue.songs.length === 1)
            message.channel.send('No songs remaining in the queue. Disconnected from voice');
        else
            message.channel.send(`Skipped **${serverQueue.songs[0].title}**\n(${serverQueue.songs[0].url})`);

        serverQueue.connection.dispatcher.end();
    },
};