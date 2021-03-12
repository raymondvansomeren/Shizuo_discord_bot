module.exports =
{
    name: 'shuffle',
    description: 'Shuffles the queue',
    aliases: ['random'],
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

        const serverQueueSongs = bot.queue.get(message.guild.id).songs;
        // console.log(serverQueueSongs);
        // console.log('------------');
        // Skip the first song (current song)
        // const startIndex = 1;
        const temp = serverQueueSongs.shift();
        for (let i = 0; i < serverQueueSongs.length; i++)
        {
            const randomIndex = Math.floor(Math.random() * serverQueueSongs.length);

            const temporaryValue = serverQueueSongs[i];
            serverQueueSongs[i] = serverQueueSongs[randomIndex];
            serverQueueSongs[randomIndex] = temporaryValue;
        }
        // console.log(serverQueueSongs);
        serverQueueSongs.unshift(temp);
        bot.queue.get(message.guild.id).songs = serverQueueSongs;

        return message.channel.send('Shuffled the queue');
    },
};