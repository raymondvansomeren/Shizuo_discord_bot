const ytdl = require('ytdl-core');
const ytpl = require('ytpl');

// const yt = require('youtube.get-video-info');

const { HSID, SSID, SID, SIDCC, xyoutubeidentitytoken } = require('../config.json');

let now = new Date();

const play = require('../modules/play.js').execute;

module.exports =
{
    name: 'playpl',
    description: 'Plays a playlist, takes a playlist id (the part in the link after "list=") or just the playlist name (but with a high chance that it won\'t work)',
    aliases: ['playlist', 'playplaylist'],
    usage: '[song url] / [search text]',
    disabled: false,
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

        let added = 0;
        let notAdded = 0;
        let playlist = undefined;
        try
        {
            playlist = await ytpl(args[0], { limit: Infinity, requestOptions:
                {
                    headers:
                    {
                        'Cookie': `SID=${SID}; HSID=${HSID}; SSID=${SSID}; SIDCC=${SIDCC};`,
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

        if (playlist === undefined || playlist === null)
            return message.channel.send('Could not find');

        for (let i = 0; i < playlist.estimatedItemCount; i++)
        {
            const serverQueue = bot.queue.get(message.guild.id);
            const song =
            {
                title: '',
                url: '',
                duration: Infinity,
            };

            if (playlist.items[i] !== undefined && playlist.items[i] !== null)
            {
                song.title = playlist.items[i].title;
                song.url = `https://www.youtube.com/watch?v=${playlist.items[i].id}`;

                ytdl.getInfo(song.url)
                    .then((info) =>
                    {
                        // console.log('Duration in seconds: ', info.videoDetails.lengthSeconds);
                        song.duration = info.videoDetails.lengthSeconds;
                    });

                if (!serverQueue || serverQueue === undefined || serverQueue === null || serverQueue.songs.length <= 0)
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
                        loop: 'none',
                    };
                    // Setting the queue using our contract
                    bot.queue.set(message.guild.id, queueContruct);
                    // Pushing the song to our songs array
                    queueContruct.songs.push(song);
                    // added++;

                    try
                    {
                        // Here we try to join the voicechat and save our connection into our object.
                        const connection = await voiceChannel.join();
                        queueContruct.connection = connection;
                        // Calling the play function to start a song
                        play(bot, message, message.guild, queueContruct.songs[0]);
                        added++;
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
                    added++;
                }
            }
            else
            {
                notAdded++;
            }
        }
        if (notAdded === 0)
            return message.channel.send(`Added ${added} songs.`);
        else
            return message.channel.send(`Added ${added} songs. Not added ${notAdded} songs.`);
    },
};