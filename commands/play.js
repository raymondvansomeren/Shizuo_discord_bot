const ytdl = require('ytdl-core');
const ytsr = require('ytsr');

// const yt = require('youtube.get-video-info');

const { HSID, SSID, SID, SIDCC, xyoutubeidentitytoken } = require('../config.json');

let now = new Date();

module.exports =
{
    name: 'play',
    description: 'Plays a song in your current channel (if I ain\'t in a channel yet). If there is already a song playing, add song to the queue',
    aliases: ['song', 'p', 'addsong'],
    usage: '[song url] / [search text]',
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

        if (args.length === 0)
        {
            return message.channel.send('You didn\'t pass me a song')
                .then(msg =>
                {
                    if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                    {
                        message.delete({ timeout: 5000 });
                        msg.delete({ timeout: 5000 });
                    }
                });
        }

        function play(guild, song)
        {
            const serverQueue = bot.queue.get(guild.id);

            if (!song)
            {
                message.channel.send('No more songs to play, leaving voice channel');
                serverQueue.voiceChannel.leave();
                bot.queue.delete(guild.id);
                return;
            }
            const dispatcher = serverQueue.connection
                .play(ytdl(song.url,
                    {
                        highWaterMark: 1 << 25, quality: 'highestaudio', requestOptions:
                        {
                            headers:
                            {
                                Cookie: `SID=${SID}; HSID=${HSID}; SSID=${SSID}; SIDCC=${SIDCC};`,
                                'x-youtube-identity-token': `${xyoutubeidentitytoken}`,
                            },
                        },
                    }), { highWaterMark: 25, plp: 5 })
                .on('finish', () =>
                {
                    serverQueue.songs.shift();
                    play(guild, serverQueue.songs[0]);
                })
                .on('error', (error) =>
                {
                    now = new Date();
                    console.error(now.toUTCString(), ':', error);
                });

            dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
            serverQueue.textChannel.send(`Now playing: **${song.title}**\n(${song.url})`);
        }

        const serverQueue = bot.queue.get(message.guild.id);
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel)
        {
            return message.channel.send('You need to be in a voice channel to play music!')
                .then(msg =>
                {
                    if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                    {
                        message.delete({ timeout: 5000 });
                        msg.delete({ timeout: 5000 });
                    }
                });
        }

        const permissions = voiceChannel.permissionsFor(message.guild.me);
        if (!permissions.has('VIEW_CHANNEL') || !permissions.has('CONNECT') || !permissions.has('SPEAK'))
        {
            return message.channel.send('I need the permissions to join and speak in your voice channel!')
                .then(msg =>
                {
                    if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                    {
                        message.delete({ timeout: 5000 });
                        msg.delete({ timeout: 5000 });
                    }
                });
        }


        const song =
        {
            title: '',
            url: '',
            duration: Infinity,
        };
        let fullArgs = '';
        for (let i = 0; i < args.length; i++)
        {
            if (i !== 0)
                fullArgs += ' ';
            fullArgs += `${args[i]}`;
        }

        let filters = undefined;
        try
        {
            filters = await ytsr.getFilters(fullArgs, { requestOptions:
                {
                    headers:
                    {
                        Cookie: `SID=${SID}; HSID=${HSID}; SSID=${SSID}; SIDCC=${SIDCC};`,
                        'x-youtube-identity-token': `${xyoutubeidentitytoken}`,
                    },
                },
            });
        }
        catch (e)
        {
            now = new Date();
            console.log(now.toUTCString(), ' :', e);
            if (e.statusCode >= 400)
                return message.channel.send(`Some error happened, status code ${e.statusCode}. Should be fixed shortly`);

            return message.channel.send('Some error happened');
        }
        const filterVideo = filters.get('Type').get('Video');
        if (filterVideo.url === undefined || filterVideo.url === null)
        {
            return message.channel.send(`Could not find ${fullArgs}`)
                .then(msg =>
                {
                    if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                    {
                        message.delete({ timeout: 5000 });
                        msg.delete({ timeout: 5000 });
                    }
                });
        }
        const results = await ytsr(filterVideo.url, { pages: 1, requestOptions:
            {
                headers:
                {
                    Cookie: `SID=${SID}; HSID=${HSID}; SSID=${SSID}; SIDCC=${SIDCC};`,
                    'x-youtube-identity-token': `${xyoutubeidentitytoken}`,
                },
            },
        });

        if (results.items.length === 0 || results.items === undefined || results === undefined)
        {
            return message.channel.send(`Could not find ${fullArgs}`)
                .then(msg =>
                {
                    if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                    {
                        message.delete({ timeout: 5000 });
                        msg.delete({ timeout: 5000 });
                    }
                });
        }

        song.title = results.items[0].title;
        song.url = `https://www.youtube.com/watch?v=${results.items[0].id}`;

        // TODO needs fixing
        // yt.retrieve(results.items[0].id, function(err, res)
        // {
        //     if (err) throw err;
        //     song.duration = JSON.parse(res.player_response).videoDetails.lengthSeconds;
        // });
        song.duration = 0;

        if (!serverQueue || serverQueue === undefined || serverQueue === null)
        {
            // Creating the contract for our queue
            const queueContruct =
            {
                textChannel: message.channel,
                voiceChannel: voiceChannel,
                connection: null,
                songs: [],
                volume: 5,
                playing: true,
            };
            // Setting the queue using our contract
            bot.queue.set(message.guild.id, queueContruct);
            // Pushing the song to our songs array
            queueContruct.songs.push(song);

            try
            {
                // Here we try to join the voicechat and save our connection into our object.
                const connection = await voiceChannel.join();
                queueContruct.connection = connection;
                // Calling the play function to start a song
                play(message.guild, queueContruct.songs[0]);
            }
            catch (err)
            {
                // Printing the error message if the bot fails to join the voicechat
                now = new Date();
                console.error(now.toUTCString(), ':', err);
                bot.queue.delete(message.guild.id);
                return message.channel.send(err)
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
        else
        {
            serverQueue.songs.push(song);
            return message.channel.send(`**${song.title}** has been added to the queue!\n(${song.url})`);
        }
    },
};
