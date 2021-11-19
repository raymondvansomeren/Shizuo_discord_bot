const ytdl = require('ytdl-core');

const { HSID, SSID, SID, SIDCC, xyoutubeidentitytoken } = require('../config.json');

const error = require('../modules/log').error;

module.exports = {
    execute(message, song)
    {
        const client = message.client;
        const guild = message.guild;

        const serverQueue = client.queue.get(guild.id);

        if (!song)
        {
            serverQueue.songs = [];
            setTimeout(() =>
            {
                const serverQueue2 = client.queue.get(guild.id);
                if (serverQueue2 === undefined || serverQueue2.songs.length <= 0)
                {
                    message.channel.send('No more songs to play, leaving voice channel');
                    if (serverQueue2 !== undefined)
                    {
                        // Leave only when there is no queue
                        serverQueue2.voiceChannel.leave();
                    }
                    client.queue.delete(guild.id);
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

                // this.execute is not a function!!
                module.exports.execute(message, serverQueue.songs[0]);
            })
            .on('error', (e) =>
            {
                error(e);
                serverQueue.songs.shift();
                serverQueue.textChannel.send(`Could not play: **${song.title}**\n<${song.url}>`);
                module.exports.execute(message, serverQueue.songs[0]);
            });

        dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
        serverQueue.textChannel.send(`Now playing: **${song.title}**\n(${song.url})`);
    },
};