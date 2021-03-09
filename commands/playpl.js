const ytdl = require('ytdl-core');
const ytpl = require('ytpl');

const yt = require('youtube.get-video-info');

let now = new Date();

module.exports =
{
    name: 'playpl',
    description: 'Plays a playlist, takes a playlist id (the part in the link after "list=") or just the playlist name (but with a high chance that it won\'t work)',
    aliases: ['playlist', 'playplaylist'],
    usage: '[song url] / [search text]',
    cooldown: 3,
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
                .play(ytdl(song.url, { highWaterMark: 1 << 25, quality: 'highestaudio' }), { highWaterMark: 25, plp: 5 })
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

        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has('CONNECT') || !permissions.has('SPEAK'))
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
        let playlist = undefined;
        try
        {
            playlist = await ytpl(args[0], { limit: Infinity });
        }
        catch (e)
        {
            message.channel.send('Could not find ');
        }

        for (let i = 0; i < playlist.estimatedItemCount; i++)
        {
            const serverQueue = bot.queue.get(message.guild.id);
            const song =
            {
                title: '',
                url: '',
                duration: Infinity,
            };

            song.title = playlist.items[i].title;
            song.url = `https://www.youtube.com/watch?v=${playlist.items[i].id}`;
            yt.retrieve(playlist.items[i].id, function(err, res)
            {
                if (err) throw err;
                song.duration = JSON.parse(res.player_response).videoDetails.lengthSeconds;
            });

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
                // added++;

                try
                {
                    // Here we try to join the voicechat and save our connection into our object.
                    const connection = await voiceChannel.join();
                    queueContruct.connection = connection;
                    // Calling the play function to start a song
                    play(message.guild, queueContruct.songs[0]);
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
        return message.channel.send(`Added ${added} songs.`);
    },
};