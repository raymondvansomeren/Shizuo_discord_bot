module.exports =
{
    name: 'remove',
    description: 'Removes a song from the queue',
    aliases: ['delete'],
    usage: '[queue index (optional)]',
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
        if (args.length === 0 || args === undefined || args === null)
        {
            const temp = serverQueueSongs[serverQueueSongs.length - 1];
            serverQueueSongs.splice(serverQueueSongs.length - 1, 1);
            return message.channel.send(`Removed song at index ${serverQueueSongs.length} (${temp.url})`);
        }
        else if (!isNaN(args[0]) && !isNaN(parseFloat(args[0])))
        {
            const args0AsNumber = Number(args[0]);
            const temp = serverQueueSongs[args0AsNumber];
            serverQueueSongs.splice(args0AsNumber, 1);
            return message.channel.send(`Removed song at index ${args0AsNumber} (${temp.url})`);
        }
        else
        {
            return message.channel.send('I can\t handle text, please give me the number of the song in the queue');
        }

    },
};