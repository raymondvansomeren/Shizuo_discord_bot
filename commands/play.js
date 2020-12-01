const ytdl = require('ytdl-core');

module.exports =
{
    name: 'play',
    description: 'Plays a song in your current channel (if I ain\'t in a channel yet). If there is already a song playing, add song to the queue',
    aliases: ['song'],
    usage: '[song url]',
    cooldown: 3,
    async execute(bot, message, args)
    {
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
                .play(ytdl(song.url, { highWaterMark: 1<<25, quality: 'highestaudio' }), { highWaterMark: 25, plp: 5})
                .on("finish", () => {
                    serverQueue.songs.shift();
                    play(guild, serverQueue.songs[0]);
                })
                .on("error", error => console.error(error));
            dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
            serverQueue.textChannel.send(`Now playing: **${song.title}**\n(${song.url})`);
        }

        serverQueue = bot.queue.get(message.guild.id);
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel)
            return message.channel.send('You need to be in a voice channel to play music!');

        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has('CONNECT') || !permissions.has('SPEAK'))
            return message.channel.send('I need the permissions to join and speak in your voice channel!');

        const songInfo = await ytdl.getInfo(args[0]);
        const song = {
            title: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url,
        };

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
                var connection = await voiceChannel.join();
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
            return message.channel.send(`**${song.title}** has been added to the queue!`);
        }
    },
};