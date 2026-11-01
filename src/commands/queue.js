import { InteractionContextType, MessageFlags, SlashCommandBuilder } from 'discord.js';

import { baseEmbed, respondError, trackLink } from '../utils/embeds.js';
import { formatDuration } from '../utils/format.js';
import { LOOP_LABELS } from '../music/ui.js';

const PAGE_SIZE = 10;

export default {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Show the queue')
        .setContexts(InteractionContextType.Guild)
        .addIntegerOption(option => option
            .setName('page')
            .setDescription('Page of the queue')
            .setMinValue(1)),

    async execute(interaction)
    {
        const queue = interaction.client.queues.get(interaction.guildId);
        if (!queue?.current && !queue?.tracks.length)
        {
            return respondError(interaction, 'The queue is empty.');
        }

        const pages = Math.max(1, Math.ceil(queue.tracks.length / PAGE_SIZE));
        const page = Math.min(interaction.options.getInteger('page') ?? 1, pages);
        const start = (page - 1) * PAGE_SIZE;

        const lines = queue.tracks
            .slice(start, start + PAGE_SIZE)
            .map((track, i) => `\`${start + i + 1}.\` ${trackLink(track, 60)} \`${formatDuration(track.duration)}\` <@${track.requestedBy}>`);

        const hasLive = queue.tracks.some(track => track.duration === null);
        const total = queue.tracks.reduce((sum, track) => sum + (track.duration ?? 0), 0);

        const embed = baseEmbed(interaction.client)
            .setTitle('📜 Queue')
            .addFields(
                { name: 'Now playing', value: queue.current ? `${trackLink(queue.current)} \`${formatDuration(queue.current.duration)}\`` : 'Nothing' },
                { name: `Up next (${queue.tracks.length})`, value: lines.join('\n') || 'Nothing' },
            )
            .setFooter({ text: `Page ${page}/${pages} • Total: ${hasLive ? 'over ' : ''}${formatDuration(total)} • ${LOOP_LABELS[queue.loop]}` });

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    },
};
