const ytdl = require('ytdl-core');

const { HSID, SSID, SID, SIDCC, xyoutubeidentitytoken } = require('../config.json');

let now = new Date();

module.exports = {
    execute(bot, message, guild, song)
    {
        const serverQueue = bot.queue.get(guild.id);

        if (!song)
        {
            serverQueue.songs = [];
            setTimeout(() =>
            {
                const serverQueue2 = bot.queue.get(guild.id);
                if (serverQueue2 === undefined || serverQueue2.songs.length <= 0)
                {
                    message.channel.send('No more songs to play, leaving voice channel');
                    if (serverQueue2 !== undefined)
                    {
                        // Leave only when there is no queue
                        serverQueue2.voiceChannel.leave();
                    }
                    bot.queue.delete(guild.id);
                }
            }, 15000);
            return;
        }

        const video = ytdl(song.url,
            {
                filter: 'audioonly',
                highWaterMark: 1 << 25, quality: 'highestaudio', requestOptions:
                {
                    headers:
                    {
                        'Cookies': `SID=${SID}; HSID=${HSID}; SSID=${SSID}; SIDCC=${SIDCC};`,
                        // 'cookies': `${cookies}`,
                        'x-youtube-identity-token': `${xyoutubeidentitytoken}`,
                    },
                },
            });

        const dispatcher = serverQueue.connection
            .play(video,
                { highWaterMark: 25, plp: 5 })
            .on('finish', () =>
            {
                if (serverQueue.loop === 'all')
                {
                    const temp = serverQueue.songs.shift();
                    serverQueue.songs.push(temp);
                }
                else if (serverQueue.loop === 'single')
                {
                    // do nothing
                }
                else
                {
                    serverQueue.songs.shift();
                }

                this.execute(bot, message, guild, serverQueue.songs[0]);
            })
            .on('error', (error) =>
            {
                now = new Date();
                console.error(now.toUTCString(), ':', error);
                serverQueue.songs.shift();
                serverQueue.textChannel.send(`Could not play: **${song.title}**\n<${song.url}>`);
                this.execute(bot, message, guild, serverQueue.songs[0]);
            });

        dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
        serverQueue.textChannel.send(`Now playing: **${song.title}**\n(${song.url})`);
    },
};