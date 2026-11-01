import { InteractionContextType, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

import { config } from '../config.js';
import { logger } from '../logger.js';
import { GuildQueue } from '../music/GuildQueue.js';
import { checkMusicAccess } from '../music/guards.js';
import { resolve } from '../music/ytdlp.js';
import { baseEmbed, errorEmbed, respondError, trackLink } from '../utils/embeds.js';
import { formatDuration } from '../utils/format.js';

export default {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song or playlist from YouTube / YouTube Music')
        .setContexts(InteractionContextType.Guild)
        .addStringOption(option => option
            .setName('query')
            .setDescription('A video or playlist URL, or search terms')
            .setMaxLength(500)
            .setRequired(true))
        .addBooleanOption(option => option
            .setName('shuffle')
            .setDescription('Shuffle a playlist before adding it'))
        .addBooleanOption(option => option
            .setName('next')
            .setDescription('Add to the front of the queue instead of the back')),

    async execute(interaction)
    {
        const access = await checkMusicAccess(interaction, { needsQueue: false });
        if (!access) return;

        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel)
        {
            return respondError(interaction, 'Join a voice channel first, then try again.');
        }
        const permissions = voiceChannel.permissionsFor(interaction.guild.members.me);
        if (!voiceChannel.joinable || !permissions?.has(PermissionFlagsBits.Speak))
        {
            return respondError(interaction, `I don't have permission to join and speak in ${voiceChannel}.`);
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const query = interaction.options.getString('query', true);
        let result;
        try
        {
            result = await resolve(query);
        }
        catch (error)
        {
            logger.warn(`Could not resolve "${query}": ${error.message}`);
            return interaction.editReply({ embeds: [errorEmbed(interaction.client, `Couldn't load that: ${error.message}`)] });
        }

        const tracks = result.tracks.map(track => ({ ...track, requestedBy: interaction.user.id }));
        if (tracks.length === 0)
        {
            return interaction.editReply({ embeds: [errorEmbed(interaction.client, `Nothing found for **${query}**.`)] });
        }
        if (interaction.options.getBoolean('shuffle'))
        {
            for (let i = tracks.length - 1; i > 0; i--)
            {
                const j = Math.floor(Math.random() * (i + 1));
                [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
            }
        }

        // Look the queue up again: another /play may have created one while we were searching
        let queue = interaction.client.queues.get(interaction.guildId);
        if (queue && queue.voiceChannelId !== voiceChannel.id)
        {
            return interaction.editReply({ embeds: [errorEmbed(interaction.client, `I'm already playing in <#${queue.voiceChannelId}>.`)] });
        }
        if (!queue)
        {
            queue = new GuildQueue(voiceChannel, interaction.channel);
            interaction.client.queues.set(interaction.guildId, queue);
            try
            {
                await queue.connect();
            }
            catch (error)
            {
                logger.warn(`Could not connect to voice in ${interaction.guild.name}: ${error.message}`);
                return interaction.editReply({ embeds: [errorEmbed(interaction.client, `I couldn't connect to ${voiceChannel}, try again later.`)] });
            }
        }

        const room = config.music.maxQueueSize - queue.tracks.length;
        if (room <= 0)
        {
            return interaction.editReply({ embeds: [errorEmbed(interaction.client, `The queue is full (max ${config.music.maxQueueSize} tracks).`)] });
        }
        const added = tracks.slice(0, room);
        const position = queue.add(added, { next: interaction.options.getBoolean('next') ?? false });

        const embed = baseEmbed(interaction.client);
        if (result.playlist)
        {
            const total = added.reduce((sum, track) => sum + (track.duration ?? 0), 0);
            embed
                .setTitle('📃 Playlist added')
                .setDescription(`Added **${added.length}** tracks from **${trackLink(result.playlist)}**`
                    + (added.length < tracks.length ? `\n(${tracks.length - added.length} skipped because the queue is full)` : ''))
                .addFields({ name: 'Total duration', value: formatDuration(total), inline: true });
        }
        else
        {
            const [track] = added;
            embed
                .setTitle(position === 0 ? '🎶 Starting playback' : '➕ Added to the queue')
                .setDescription(`**${trackLink(track)}**`)
                .addFields(
                    { name: 'Duration', value: formatDuration(track.duration), inline: true },
                    { name: 'Position', value: position === 0 ? 'Now' : `#${position}`, inline: true },
                );
        }
        if (added[0].thumbnail)
        {
            embed.setThumbnail(added[0].thumbnail);
        }
        return interaction.editReply({ embeds: [embed] });
    },
};
