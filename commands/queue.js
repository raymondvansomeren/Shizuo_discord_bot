const moment = require('moment');
const momentDurationFormatSetup = require('moment-duration-format');
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
        // To get rid of the eslint warning of unused vars
        const falseVar = false;
        if (falseVar === false)
            momentDurationFormatSetup;

        const serverQueue = bot.queue.get(message.guild.id);
        if (!serverQueue || serverQueue.songs.length === 1)
        {
            return message.channel.send('There are no songs in the queue')
                .then(msg =>
                {
                    if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                    {
                        message.delete({ timeout: 5000 });
                        msg.delete({ timeout: 5000 });
                    }
                });
        }

        const embeddedQueue = new Discord.MessageEmbed();
        embeddedQueue.setThumbnail(bot.user.avatarURL());
        embeddedQueue.setColor('#DE8422');
        embeddedQueue.setTitle('Music queue');

        let queueTime = 0;
        for (let i = 1; i < serverQueue.songs.length; i++)
            queueTime += Number(serverQueue.songs[i].duration);

        embeddedQueue.setDescription(`Total queue time: ${moment.duration(queueTime, 'seconds').format('h:mm:ss').padStart(4, '0:0')}`);

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
            {
                return message.channel.send(`I don't have that many queue pages. I only have ${pageAmount} pages`)
                    .then(msg =>
                    {
                        if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                        {
                            message.delete({ timeout: 5000 });
                            msg.delete({ timeout: 5000 });
                        }
                    });
            }
        }
        embeddedQueue.setFooter(`Page ${page}/${pageAmount}`, bot.user.avatarURL());

        for (let i = 0; i < songsPerPage; i++)
        {
            const songNumber = i + 1 + (songsPerPage * (page - 1));
            if (songNumber >= serverQueue.songs.length)
                break;
            embeddedQueue.addField(`[${songNumber}] ${serverQueue.songs[songNumber].title}`, `${serverQueue.songs[songNumber].url}`);
        }

        message.channel.send(embeddedQueue);
    },
};