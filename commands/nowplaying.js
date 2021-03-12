const moment = require('moment');
const momentDurationFormatSetup = require('moment-duration-format');

module.exports =
{
    name: 'nowplaying',
    description: 'Shows the currently playing song',
    aliases: ['playing', 'currentsong', 'np', 'cs'],
    usage: '',
    async execute(bot, message, args)
    {
        // To get rid of the eslint warning of unused vars
        const falseVar = false;
        if (falseVar === false)
            momentDurationFormatSetup;

        const serverQueue = bot.queue.get(message.guild.id);
        if (!serverQueue)
        {
            return message.channel.send('I have no songs playing right now')
                .then(msg =>
                {
                    if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                    {
                        message.delete({ timeout: 5000 });
                        msg.delete({ timeout: 5000 });
                    }
                });
        }

        message.channel.send(`Currently playing **${serverQueue.songs[0].title}**\nCurrently at **${moment.duration(serverQueue.connection.dispatcher.streamTime, 'milliseconds').format('h:mm:ss').padStart(4, '0:0')}/${moment.duration(serverQueue.songs[0].duration, 'seconds').format('h:mm:ss').padStart(4, '0:0')}**\n(${serverQueue.songs[0].url})`);
    },
};