const ytdl = require('ytdl-core');
const youtube_node = require('youtube-node');
const youtube = new youtube_node();
const { youtubeKey } = require('../config.json');

youtube.setKey(youtubeKey);

module.exports =
{
    name: 'play',
    description: 'Plays a song in your current channel (if I ain\'t in a channel yet). If there is already a song playing, add song to the queue',
    aliases: ['song'],
    usage: '[song url] / [search text]',
    cooldown: 3,
    async execute(bot, message, args)
    {
        if (message.member.roles.cache.find(role => role.name.toLowerCase() === 'nomusic') || message.member.roles.cache.find(role => role.name.toLowerCase() === 'incapacitated'))
            return message.channel.send('Seems like you aren\'t allowed to use the music features :confused:');

        if (args.length === 0)
            return message.channel.send('You didn\'t pass me a song');

        function play(guild, song)
        {
            const serverQueue = bot.queue.get(guild.id);

            if (!song)
            {
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
                    console.error(error);
                });

            dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
            serverQueue.textChannel.send(`Now playing: **${song.title}**\n(${song.url})`);
        }

        const serverQueue = bot.queue.get(message.guild.id);
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel)
            return message.channel.send('You need to be in a voice channel to play music!');

        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has('CONNECT') || !permissions.has('SPEAK'))
            return message.channel.send('I need the permissions to join and speak in your voice channel!');


        const song =
        {
            title: '',
            url: '',
        };
        let fullArgs = '';
        for (let i = 0; i < args.length; i++)
        {
            if (i !== 0)
                fullArgs += ' ';
            fullArgs += `${args[i]}`;
        }
        // let songInfo = undefined;
        youtube.search(fullArgs, 2, async function(error, result)
        {
            if (error)
                return console.log(error);

            if (result.items[0].id.kind === 'youtube#video')
            {
                song.title = result.items[0].snippet.title;
                song.url = `https://www.youtube.com/watch?v=${result.items[0].id.videoId}`;
            }
            else
            {
                song.title = result.items[1].snippet.title;
                song.url = `https://www.youtube.com/watch?v=${result.items[1].id.videoId}`;
            }

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
                    console.log(err);
                    bot.queue.delete(message.guild.id);
                    return message.channel.send(err);
                }
            }
            else
            {
                serverQueue.songs.push(song);
                // console.log(serverQueue.songs);
                return message.channel.send(`**${song.title}** has been added to the queue!\n(${song.url})`);
            }
        });
        /*
        // console.log(songInfo);

        // if (songInfo.items[0].id.kind === 'youtube#video')
        // {
        //     song.title = songInfo.items[0].snippet.title;
        //     song.url = `https://www.youtube.com/watch?v=${songInfo.items[0].id.videoId}`;
        // }
        // else
        // {
        //     song.title = songInfo.items[1].snippet.title;
        //     song.url = `https://www.youtube.com/watch?v=${songInfo.items[1].id.videoId}`;
        // }
        */


        // ///////////////////////////////////////////////////////////////////////////////

        // const songInfo = await ytdl.getInfo(args[0]);
        // const song =
        // {
        //     title: songInfo.videoDetails.title,
        //     url: songInfo.videoDetails.video_url,
        // };

        // if (!serverQueue || serverQueue === undefined || serverQueue === null)
        // {
        //     // Creating the contract for our queue
        //     const queueContruct =
        //     {
        //         textChannel: message.channel,
        //         voiceChannel: voiceChannel,
        //         connection: null,
        //         songs: [],
        //         volume: 5,
        //         playing: true,
        //     };
        //     // Setting the queue using our contract
        //     bot.queue.set(message.guild.id, queueContruct);
        //     // Pushing the song to our songs array
        //     queueContruct.songs.push(song);

        //     try
        //     {
        //         // Here we try to join the voicechat and save our connection into our object.
        //         const connection = await voiceChannel.join();
        //         queueContruct.connection = connection;
        //         // Calling the play function to start a song
        //         play(message.guild, queueContruct.songs[0]);
        //     }
        //     catch (err)
        //     {
        //         // Printing the error message if the bot fails to join the voicechat
        //         console.log(err);
        //         bot.queue.delete(message.guild.id);
        //         return message.channel.send(err);
        //     }
        // }
        // else
        // {
        //     serverQueue.songs.push(song);
        //     // console.log(serverQueue.songs);
        //     return message.channel.send(`**${song.title}** has been added to the queue!`);
        // }
    },
};