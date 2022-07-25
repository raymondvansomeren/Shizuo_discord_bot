const baseCommand = require('../modules/base-command.js');
const baseEmbed = require('../modules/base-embed.js');

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
                    // interaction.client.logger.debug(`playlist url ${options.value}`);
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
                    // interaction.client.logger.debug(`song url youtube ${options.value}`);
                    this.youtubeSongURL(interaction, options);
                    break;
                }
                case 'youtube_search':
                {
                    // interaction.client.logger.debug(`song search youtube ${options.value}`);
                    this.youtubeSongSearch(interaction, options);
                    break;
                }
                case 'spotify_url':
                {
                    // interaction.client.logger.debug(`song url spotify ${options.value}`);
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
        // TODO do something
        const embed = baseEmbed.get(interaction.client)
            .setDescription('This feature is not yet implemented');
        interaction.editReply({ embeds: [embed], ephemeral: true });
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