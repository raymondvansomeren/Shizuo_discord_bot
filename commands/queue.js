const { DiscordAPIError } = require('discord.js');
// const ytdl = require('ytdl-core');
const Discord = require('discord.js');

module.exports =
{
    name: 'queue',
    description: 'Shows the current queue',
    aliases: ['q', 'songs'],
    usage: '[page (not required)]',
    cooldown: 3,
    async execute(bot, message, args)
    {
        serverQueue = bot.queue.get(message.guild.id);
        if (serverQueue.songs.length === 1)
            return message.channel.send('There are no songs in the queue');
        
        const embeddedQueue = new Discord.MessageEmbed();
        embeddedQueue.setThumbnail(bot.user.avatarURL());
        embeddedQueue.setColor('#DE8422');
        embeddedQueue.setTitle('Music queue');

        let page = undefined;
        const songsPerPage = 10;
        const pageAmount = Math.ceil((serverQueue.songs.length - 1) / songsPerPage);
        if (args.length === 0 || args[0] === '1')
        {
            page = 1;
            // embeddedQueue.setFooter(`Page 1/${Math.ceil(serverQueue.songs.length / 10)}`, bot.user.avatarURL());
        }
        else
        {
            page = args[0];
            if (page > pageAmount)
                return message.channel.send(`I don\'t have that many queue pages. I only have ${pageAmount} pages`);
        }
        embeddedQueue.setFooter(`Page ${page}/${pageAmount}`, bot.user.avatarURL());

        for (let i = 0; i < songsPerPage; i++)
        {
            let songNumber = i + 1 + (songsPerPage * (page - 1));
            if (songNumber >= serverQueue.songs.length)
                break;
            embeddedQueue.addField(`[${songNumber}] ${serverQueue.songs[songNumber].title}`, `${serverQueue.songs[songNumber].url}`);
        }

        message.channel.send(embeddedQueue);
    },
};