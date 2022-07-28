const baseCommand = require('../modules/base-command.js');
const baseEmbed = require('../modules/base-embed.js');

const { queueObject } = require('../modules/queueConstruct.js');

const ytdl = require('ytdl-core');
const ytsr = require('ytsr');

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
                case 'youtube_url':
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
                case 'youtube_url':
                {
                    this.youtubeSongURL(interaction, options);
                    break;
                }
                case 'youtube_search':
                {
                    this.youtubeSongSearch(interaction, options);
                    break;
                }
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
        // TODO do something
        const embed = baseEmbed.get(interaction.client)
            .setDescription('This feature is not yet implemented');
        interaction.editReply({ embeds: [embed], ephemeral: true });
    },
    async youtubeSongURL(interaction, options)
    {
        const serverQueue = await getServerQueue(interaction);
        // If there still is no serverQueue; exit
        // This can be the case when the user isn't in a voice channel
        //   or the bot can't join their channel
        if (!serverQueue) return;
        interaction.editReply({ embeds: [baseEmbed.get(interaction.client).setDescription(`Trying to add ${options.value}`)] });

        const song =
        {
            title: '',
            url: '',
            duration: Infinity,
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

            song.title = results.items[0].title;
            song.url = options.value;
            await ytdl.getInfo(song.url)
                .then((info) =>
                {
                    // interaction.client.logger.debug('Duration in seconds: ', info.videoDetails.lengthSeconds);
                    song.duration = info.videoDetails.lengthSeconds;
                });

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

        // TODO do something
    },
    async youtubeSongSearch(interaction, options)
    {
        // TODO do something
        const embed = baseEmbed.get(interaction.client)
            .setDescription('This feature is not yet implemented');
        interaction.editReply({ embeds: [embed], ephemeral: true });
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
                        subcommand.setName('youtube_url')
                            .setDescription('Add a whole playlist by URL')
                            .addStringOption(option =>
                                option.setName('url')
                                    .setDescription('The URL of the playlist')
                                    .setRequired(true))))
            .addSubcommandGroup(group =>
                group.setName('song')
                    .setDescription('something')
                    .addSubcommand(subcommand =>
                        subcommand.setName('youtube_url')
                            .setDescription('Add a single song by URL')
                            .addStringOption(option =>
                                option.setName('url')
                                    .setDescription('The URL of the song')
                                    .setRequired(true)))
                    .addSubcommand(subcommand =>
                        subcommand.setName('spotify_url')
                            .setDescription('Add a single song by spotify URL')
                            .addStringOption(option =>
                                option.setName('url')
                                    .setDescription('The URL of the song')
                                    .setRequired(true)))
                    .addSubcommand(subcommand =>
                        subcommand.setName('youtube_search')
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