module.exports =
{
    name: 'loop',
    description: 'Toggle loop from "no loop" to "loop all" to "loop single"',
    aliases: [''],
    usage: '',
    execute(bot, message, args)
    {
        const serverQueue = bot.queue.get(message.guild.id);

        if (serverQueue.loop === 'all')
        {
            serverQueue.loop = 'single';
            message.channel.send('Now looping this single song');
        }
        else if (serverQueue.loop === 'single')
        {
            serverQueue.loop = 'none';
            message.channel.send('No longer looping any songs');
        }
        else
        {
            serverQueue.loop = 'all';
            message.channel.send('Now looping the whole queue');
        }
    },
};