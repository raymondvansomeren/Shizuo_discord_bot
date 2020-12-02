module.exports =
{
    name: 'pause',
    description: 'Pause the song.',
    aliases: [''],
    usage: '',
    cooldown: 3,
    async execute(bot, message, args)
    {
        if (message.member.roles.find(role => role.name.toLowerCase() === 'nomusic') || message.member.roles.find(role => role.name.toLowerCase() === 'incapacitated'))
            return message.channel.send('Seems like you aren\'t allowed to use the music features :confused:');

        const serverQueue = bot.queue.get(message.guild.id);
        if (!message.member.voice.channel)
            return message.channel.send('You have to be in a voice channel to pause the music!');

        if (!serverQueue)
            return message.channel.send('There is no song that I could pause!');

        serverQueue.connection.dispatcher.pause();

        message.channel.send(`Paused song **${serverQueue.songs[0].title}\n(${serverQueue.songs[0].url})**`);
    },
};