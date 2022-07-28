const baseCommand = require('../modules/base-command.js');
const baseEmbed = require('../modules/base-embed.js');

const { queueObject } = require('../modules/queueConstruct.js');

const ytdl = require('ytdl-core');
const ytsr = require('ytsr');
const ytpl = require('ytpl');

module.exports = {
    name: 'play',
    description: 'Starts playing a song/add to queue',
    async execute(interaction)
    {
        try
        {
            // interaction.type 2 is ApplicationCommand: https://discord-api-types.dev/api/discord-api-types-v10/enum/InteractionType
            // This is only checked for commands with options, because the options will only be available if the interaction type is ApplicationCommand
            if (interaction.type !== 2)
            {
                throw `WrongInteractionType: Interaction type should be 2, but was ${interaction.type}`;
            }

            await interaction.deferReply({ ephemeral: true });

            if (interaction.member?.roles?.cache?.find(role => role.name.toLowerCase() === 'nomusic')
                || interaction.member?.roles?.cache?.find(role => role.name.toLowerCase() === 'incapacitated'))
            {
                return interaction.editReply({ embeds: [baseEmbed.get(interaction.client).setDescription('Seems like you aren\'t allowed to use the music features :confused:')], ephemeral: true });
            }

            const group = interaction.options?.data[0];
            const subcommand = group.options[0];
            const options = subcommand.options[0];

            switch(group.name)
            {
            case 'playlist':
            {
                switch (subcommand.name)
                {
                // youtube_url
                case 'url':
                {
                    this.youtubePlaylistURL(interaction, options);
                    break;
                }
                }
                break;
            }
            case 'song':
            {
                switch (subcommand.name)
                {
                // youtube_url
                case 'url':
                {
                    this.youtubeSongURL(interaction, options);
                    break;
                }
                // youtube_search
                case 'search':
                {
                    this.youtubeSongSearch(interaction, options);
                    break;
                }
                // spotify_url
                case 'spotify_url':
                {
                    this.spotifySongURL(interaction, options);
                    break;
                }
                }
                break;
            }
            }
        }
        catch (error)
        {
            const embed = baseEmbed.get(interaction.client)
                .setDescription('Something went wrong, try again later');
            if (interaction.deferred || interaction.replied)
            {
                interaction.editReply({ embeds: [embed.data], ephemeral: true });
            }
            else
            {
                interaction.reply({ embeds: [embed.data], ephemeral: true });
            }
            interaction.client.logger.error(error);
        }
    },
    async youtubePlaylistURL(interaction, options)
    {
        const serverQueue = await getServerQueue(interaction);
        // If there still is no serverQueue; exit
        // This can be the case when the user isn't in a voice channel
        //   or the bot can't join their channel
        if (!serverQueue) return;
        interaction.editReply({ embeds: [baseEmbed.get(interaction.client).setDescription(`Trying to add **${options.value}**`)] });

        let added = 0;
        let notAdded = 0;
        let playlist = undefined;

        try
        {
            playlist = await ytpl(options.value, { limit: Infinity, requestOptions:
                {
                    headers:
                    {
                        'Cookie': `SID=${interaction.client.config.SID}; HSID=${interaction.client.config.xHSID}; SSID=${interaction.client.config.xSSID}; SIDCC=${interaction.client.config.xSIDCC};`,
                        'x-youtube-identity-token': `${interaction.client.config.xyoutubeidentitytoken}`,
                    },
                },
            })
                .catch(error =>
                {
                    return undefined;
                });

            if (!playlist || playlist === undefined || playlist === null)
            {
                return interaction.editReply({ embeds: [
                    baseEmbed.get(interaction.client)
                        .setDescription('Couldn\'t find that URL. Make sure to fill in an URL to a public/unlisted YouTube playlist'),
                ] });
            }

            for (let i = 0; i < playlist.items.length; i++)
            {
                const song =
                {
                    title: playlist.items[i]?.title,
                    url: playlist.items[i]?.shortUrl,
                    duration: playlist.items[i]?.durationSec ?? Infinity,
                    user: interaction.user,
                    thumbnail: playlist.items[i].bestThumbnail ?? undefined,
                };

                if (serverQueue.addSong(song, interaction, playlist))
                {
                    added++;
                }
                else
                {
                    notAdded++;
                }
            }
            if (notAdded === 0)
            {
                interaction.editReply({ embeds: [
                    baseEmbed.get(interaction.client)
                        .setDescription(`Added ${added} songs.`),
                ] });
            }
            else
            {
                interaction.editReply({ embeds: [
                    baseEmbed.get(interaction.client)
                        .setDescription(`Added ${added} songs. Couldn't add ${notAdded} songs.`),
                ] });
            }
        }
        catch (e)
        {
            interaction.client.logger.error(e);
            if (e.statusCode >= 400)
            {
                return interaction.editReply({ embeds: [
                    baseEmbed.get(interaction.client)
                        .setDescription(`Some error happened, status code ${e.statusCode}. Should be fixed shortly`),
                ] });
            }

            return interaction.editReply({ embeds: [
                baseEmbed.get(interaction.client)
                    .setDescription('Some error happened'),
            ] });
        }
    },
    async youtubeSongURL(interaction, options)
    {
        const serverQueue = await getServerQueue(interaction);
        // If there still is no serverQueue; exit
        // This can be the case when the user isn't in a voice channel
        //   or the bot can't join their channel
        if (!serverQueue) return;
        interaction.editReply({ embeds: [baseEmbed.get(interaction.client).setDescription(`Trying to add **${options.value}**`)] });

        const song =
        {
            title: '',
            url: '',
            duration: Infinity,
            user: interaction.user,
            thumbnail: undefined,
        };

        try
        {
            let filters = undefined;
            try
            {
                filters = await ytsr.getFilters(options.value, { requestOptions:
                    {
                        headers:
                        {
                            'Cookies': `SID=${interaction.client.config.SID}; HSID=${interaction.client.config.HSID}; SSID=${interaction.client.config.SSID}; SIDCC=${interaction.client.config.SIDCC};`,
                            'x-youtube-identity-token': `${interaction.client.config.xyoutubeidentitytoken}`,
                        },
                    },
                });
            }
            catch (error)
            {
                const embed = baseEmbed.get(interaction.client)
                    .setDescription(`Some error happened, status code ${error.statusCode}. Should be fixed shortly`);
                if (interaction.deferred || interaction.replied)
                {
                    interaction.editReply({ embeds: [embed.data], ephemeral: true });
                }
                else
                {
                    interaction.reply({ embeds: [embed.data], ephemeral: true });
                }
                interaction.client.logger.error(error);
            }
            const filterVideo = filters.get('Type').get('Video');
            if (filterVideo.url === undefined || filterVideo.url === null)
            {
                return interaction.editReply({ embeds: [baseEmbed.get(interaction.client).setDescription(`Could not find ${options.value}`)] });
            }
            const results = await ytsr(filterVideo.url, { pages: 1, requestOptions:
                {
                    headers:
                    {
                        'Cookies': `SID=${interaction.client.config.SID}; HSID=${interaction.client.config.HSID}; SSID=${interaction.client.config.SSID}; SIDCC=${interaction.client.config.SIDCC};`,
                        'x-youtube-identity-token': `${interaction.client.config.xyoutubeidentitytoken}`,
                    },
                },
            });
            if (results?.items?.length === 0)
            {
                return interaction.editReply({ embeds: [baseEmbed.get(interaction.client).setDescription(`Could not find ${options.value}`)] });

            }

            song.thumbnail = results.items[0].bestThumbnail?.url;

            song.title = results.items[0].title;
            song.url = options.value;
            const b = await ytdl.getInfo(song.url)
                .then((info) =>
                {
                    // interaction.client.logger.debug('Duration in seconds: ', info.videoDetails.lengthSeconds);
                    song.duration = info.videoDetails.lengthSeconds;
                    return true;
                })
                .catch(error =>
                {
                    // interaction.client.logger.debug(error);
                    return false;
                });

            if (!b)
            {
                return interaction.editReply({ embeds: [
                    baseEmbed.get(interaction.client)
                        .setDescription('Couldn\'t find that URL. Make sure to fill in an URL to a YouTube video'),
                ] });
            }
            serverQueue.addSong(song, interaction);
        }
        catch (error)
        {
            const embed = baseEmbed.get(interaction.client)
                .setDescription('Something went wrong, try again later');
            if (interaction.deferred || interaction.replied)
            {
                interaction.editReply({ embeds: [embed.data], ephemeral: true });
            }
            else
            {
                interaction.reply({ embeds: [embed.data], ephemeral: true });
            }
            interaction.client.logger.error(error);
        }
    },
    async youtubeSongSearch(interaction, options)
    {
        const serverQueue = await getServerQueue(interaction);
        // If there still is no serverQueue; exit
        // This can be the case when the user isn't in a voice channel
        //   or the bot can't join their channel
        if (!serverQueue) return;
        interaction.editReply({ embeds: [baseEmbed.get(interaction.client).setDescription(`Trying to add **${options.value}**`)] });

        const song =
        {
            title: '',
            url: '',
            duration: Infinity,
            user: interaction.user,
            thumbnail: undefined,
        };

        try
        {
            let filters = undefined;
            try
            {
                filters = await ytsr.getFilters(options.value, { requestOptions:
                    {
                        headers:
                        {
                            'Cookies': `SID=${interaction.client.config.SID}; HSID=${interaction.client.config.HSID}; SSID=${interaction.client.config.SSID}; SIDCC=${interaction.client.config.SIDCC};`,
                            'x-youtube-identity-token': `${interaction.client.config.xyoutubeidentitytoken}`,
                        },
                    },
                });
            }
            catch (error)
            {
                const embed = baseEmbed.get(interaction.client)
                    .setDescription(`Some error happened, status code ${error.statusCode}. Should be fixed shortly`);
                if (interaction.deferred || interaction.replied)
                {
                    interaction.editReply({ embeds: [embed.data], ephemeral: true });
                }
                else
                {
                    interaction.reply({ embeds: [embed.data], ephemeral: true });
                }
                interaction.client.logger.error(error);
            }
            const filterVideo = filters.get('Type').get('Video');
            if (filterVideo.url === undefined || filterVideo.url === null)
            {
                return interaction.editReply({ embeds: [baseEmbed.get(interaction.client).setDescription(`Could not find ${options.value}`)] });
            }
            const results = await ytsr(filterVideo.url, { pages: 1, requestOptions:
                {
                    headers:
                    {
                        'Cookies': `SID=${interaction.client.config.SID}; HSID=${interaction.client.config.HSID}; SSID=${interaction.client.config.SSID}; SIDCC=${interaction.client.config.SIDCC};`,
                        'x-youtube-identity-token': `${interaction.client.config.xyoutubeidentitytoken}`,
                    },
                },
            });
            if (results?.items?.length === 0)
            {
                return interaction.editReply({ embeds: [baseEmbed.get(interaction.client).setDescription(`Could not find ${options.value}`)] });

            }

            song.thumbnail = results.items[0].bestThumbnail.url;

            song.title = results.items[0].title;
            song.url = results.items[0].url;
            const b = await ytdl.getInfo(song.url)
                .then((info) =>
                {
                    // interaction.client.logger.debug('Duration in seconds: ', info.videoDetails.lengthSeconds);
                    song.duration = info.videoDetails.lengthSeconds;
                    return true;
                })
                .catch(error =>
                {
                    // interaction.client.logger.debug(error);
                    return false;
                });

            if (!b)
            {
                return interaction.editReply({ embeds: [
                    baseEmbed.get(interaction.client)
                        .setDescription('Couldn\'t find any video with that search term.'),
                ] });
            }
            serverQueue.addSong(song, interaction);
        }
        catch (error)
        {
            const embed = baseEmbed.get(interaction.client)
                .setDescription('Something went wrong, try again later');
            if (interaction.deferred || interaction.replied)
            {
                interaction.editReply({ embeds: [embed.data], ephemeral: true });
            }
            else
            {
                interaction.reply({ embeds: [embed.data], ephemeral: true });
            }
            interaction.client.logger.error(error);
        }
    },
    async spotifySongURL(interaction, options)
    {
        // TODO do something
        const embed = baseEmbed.get(interaction.client)
            .setDescription('This feature is not yet implemented');
        interaction.editReply({ embeds: [embed], ephemeral: true });
    },
    getCommand()
    {
        return baseCommand.get(this)
            .addSubcommandGroup(group =>
                group.setName('playlist')
                    .setDescription('something')
                    .addSubcommand(subcommand =>
                        // 'youtube_url'
                        subcommand.setName('url')
                            .setDescription('Add a whole playlist by URL')
                            .addStringOption(option =>
                                option.setName('url')
                                    .setDescription('The URL of the playlist')
                                    .setRequired(true))))
            .addSubcommandGroup(group =>
                group.setName('song')
                    .setDescription('something')
                    .addSubcommand(subcommand =>
                        // 'youtube_url
                        subcommand.setName('url')
                            .setDescription('Add a single song by URL')
                            .addStringOption(option =>
                                option.setName('url')
                                    .setDescription('The URL of the song')
                                    .setRequired(true)))
                    // .addSubcommand(subcommand =>
                    //     subcommand.setName('spotify_url')
                    //         .setDescription('Add a single song by spotify URL')
                    //         .addStringOption(option =>
                    //             option.setName('url')
                    //                 .setDescription('The URL of the song')
                    //                 .setRequired(true)))
                    .addSubcommand(subcommand =>
                        // 'youtube_search'
                        subcommand.setName('search')
                            .setDescription('Add a single song by a search query')
                            .addStringOption(option =>
                                option.setName('query')
                                    .setDescription('The search query for a single song')
                                    .setRequired(true))));
    },
};

async function getServerQueue(interaction)
{
    const serverQueue = interaction.client.queue.get(interaction.guild.id);
    if (!serverQueue)
    {
        const embed = baseEmbed.get(interaction.client)
            .setDescription('Trying to join you in a voice channel');

        await interaction.editReply({ embeds: [embed], ephemeral: false });
        // const message = await interaction.channel.send({ embeds: [embed], ephemeral: false });
        const q = new queueObject(interaction, undefined);
        if (!q.getVoiceChannel()?.joinable)
        {
            return undefined;
        }
        return q;
    }
    return serverQueue;
}