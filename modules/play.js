const baseEmbed = require('../modules/base-embed.js');

const { createAudioPlayer, NoSubscriberBehavior, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');

const moment = require('moment');
const momentDurationFormatSetup = require('moment-duration-format');

const ytdl = require('ytdl-core');

module.exports = {
    play: async function play(interaction, song)
    {
        const serverQueue = interaction.client.queue.get(interaction.guild.id);

        if (serverQueue === undefined) return;

        if (!song)
        {
            serverQueue.setSongs([]);
            serverQueue.getMessage()?.delete()
                .catch(error =>
                {
                    // Nothing
                });
            const d = Math.round(Date.now() / 1000) + 15;
            serverQueue.setMessage(await serverQueue.interaction.channel.send({ embeds: [
                baseEmbed.get(interaction.client)
                    .setDescription(`No more songs to play, leaving voice channel <t:${d}:R>`),
            ] })
                .catch(error =>
                {
                    // Nothing
                }));
            setTimeout(() =>
            {
                const serverQueue2 = interaction.client.queue.get(interaction.guild.id);
                // Leave only when there is no queue
                if (serverQueue2 === undefined || serverQueue2.getSongs().length <= 0)
                {
                    serverQueue.getMessage()?.delete()
                        .catch(error =>
                        {
                            // Nothing
                        });
                    serverQueue.interaction.channel.send({ embeds: [
                        baseEmbed.get(interaction.client)
                            .setDescription('No more songs to play, leaving voice channel'),
                    ] })
                        .then(msg =>
                        {
                            setTimeout(() =>
                            {
                                msg?.delete()
                                    .catch(error =>
                                    {
                                        // Nothing
                                    });
                            }, 5000);
                        })
                        .catch(error =>
                        {
                            // Nothing
                        });

                    // serverQueue2?.getConnection()?.disconnect();
                    serverQueue2.stop();
                    interaction.client.queue.delete(interaction.guild.id);
                }
            }, 15000);
            return;
        }

        let video = undefined;
        try
        {
            video = ytdl(song.url,
                {
                    filter: 'audioonly',
                    highWaterMark: 1 << 27,
                    quality: 'highestaudio',
                    requestOptions:
                    {
                        headers:
                        {
                            'Cookies': `SID=${interaction.client.config.SID}; HSID=${interaction.client.config.HSID}; SSID=${interaction.client.config.SSID}; SIDCC=${interaction.client.config.SIDCC};`,
                            // 'cookies': `${cookies}`,
                            'x-youtube-identity-token': `${interaction.client.config.xyoutubeidentitytoken}`,
                        },
                    },
                    liveBuffer: 5000,
                });
        }
        catch (error)
        {
            return interaction.client.logger.error(error);
        }

        // const dispatcher = serverQueue.connection
        //     .play(video,
        //     { highWaterMark: 25, plp: 5 })
        //     .on('finish', () =>
        //     {
        //         if (serverQueue.loop === 'all')
        //         {
        //             const temp = serverQueue.songs.shift();
        //             serverQueue.songs.push(temp);
        //         }
        //         else if (serverQueue.loop === 'single')
        //         {
        //             // do nothing
        //         }
        //         else
        //         {
        //             serverQueue.songs.shift();
        //         }
        //         // this.execute is not a function!!
        //         module.exports.execute(interaction, serverQueue.songs[0]);
        //     })
        //     .on('error', (e) =>
        //     {
        //         interaction.client.logger.error(e);
        //         serverQueue.songs.shift();
        //         serverQueue.textChannel.send(`Could not play: **${song.title}**\n<${song.url}>`);
        //         module.exports.execute(interaction, serverQueue.songs[0]);
        //     });
        //
        // dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

        // TODO crashed here (cannot read property of undefined (reading 'setPlayer'))
        serverQueue.setPlayer(createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Play,
            },
        }));

        serverQueue.getConnection()?.subscribe(serverQueue.getPlayer());

        const resource = createAudioResource(video);
        serverQueue.setAudioResource(resource);
        // serverQueue.play(serverQueue.getAudioResource());    // This is done whenever the audioresource is set

        serverQueue.getPlayer()
            .addListener('stateChange', (oldState, newState) =>
            {
                if (newState.status === AudioPlayerStatus.Idle)
                {
                    if (serverQueue.getLoopState() === 'all')
                    {
                        serverQueue.addSong(serverQueue.getSongs().shift());
                    }
                    else if (serverQueue.getLoopState() === 'single')
                    {
                        // do nothing
                    }
                    else
                    {
                        serverQueue.getSongs().shift();
                    }
                    if (serverQueue.getSongs().length === 0
                        && serverQueue.isPlaying())
                    {
                        // No songs left
                        module.exports.play(interaction);
                    }
                    else if (serverQueue.getFullStop())
                    {
                        return;
                    }
                    else
                    {
                        module.exports.play(interaction, serverQueue.getSongs(0));
                    }
                }
            });

        if (!serverQueue || !serverQueue.getPlayer())
        {
            return;
        }
        serverQueue.getPlayer()
            .on('error', (error) =>
            {
                interaction.client.logger.error(error);
                serverQueue.getSongs().shift();
                interaction.editReply({ embeds: [
                    baseEmbed.get(interaction.client)
                        .setDescription(`Could not play: **${song.title}**\n<${song.url}>`),
                ] });
                module.exports.play(interaction, serverQueue.getSongs(0));
            });

        await serverQueue.getMessage()?.delete()
            .catch(error =>
            {
                // Nothing
            });
        momentDurationFormatSetup;
        const d = Math.round(Date.now() / 1000) + parseInt(song.duration);
        serverQueue.setMessage(await serverQueue.interaction.channel.send({ embeds: [
            baseEmbed.get(interaction.client)
                .setDescription(`Now playing: **[${song.title}](${song.url})**`)
                .addFields([
                    { name: 'Duration', value: `${moment.duration(song.duration, 'seconds').format('h:mm:ss').padStart(4, '0:0')} minutes`, inline: true },
                    { name: 'Added by', value: `${song.user}`, inline: true },
                    // TODO edit/renew based on pause/play commands
                    { name: 'Ends', value: `<t:${d}:R>`, inline: true },
                ])
                .setThumbnail(song.thumbnail),
        ] })
            .catch(error =>
            {
                // Nothing
            }));
    },
};
