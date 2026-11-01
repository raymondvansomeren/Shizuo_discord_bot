import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import { baseEmbed, trackLink } from '../utils/embeds.js';
import { formatDuration, progressBar } from '../utils/format.js';

export const LOOP_LABELS = Object.freeze({
    off: '▶️ Not looping',
    track: '🔂 Looping the current track',
    queue: '🔁 Looping the whole queue',
});

export function nowPlayingEmbed(queue, { withProgress = false } = {})
{
    const track = queue.current;
    const embed = baseEmbed(queue.client)
        .setTitle(queue.paused ? '⏸️ Paused' : '🎶 Now playing')
        .setDescription(`**${trackLink(track, 200)}**${track.author ? `\nby ${track.author}` : ''}`)
        .addFields(
            { name: 'Duration', value: formatDuration(track.duration), inline: true },
            { name: 'Requested by', value: `<@${track.requestedBy}>`, inline: true },
            { name: 'Up next', value: queue.tracks[0] ? trackLink(queue.tracks[0], 40) : 'Nothing', inline: true },
        )
        .setFooter({ text: `${LOOP_LABELS[queue.loop]} • ${queue.tracks.length} track${queue.tracks.length === 1 ? '' : 's'} in queue` });

    if (withProgress)
    {
        const elapsed = queue.elapsed;
        embed.addFields({
            name: 'Progress',
            value: `${progressBar(elapsed, track.duration)}\n\`${formatDuration(elapsed)} / ${formatDuration(track.duration)}\``,
        });
    }
    if (track.thumbnail)
    {
        embed.setThumbnail(track.thumbnail);
    }
    return embed;
}

export function controlsRow(queue)
{
    const loopEmoji = { off: '➡️', track: '🔂', queue: '🔁' }[queue.loop];
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('music:toggle')
            .setEmoji(queue.paused ? '▶️' : '⏸️')
            .setStyle(queue.paused ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('music:skip').setEmoji('⏭️').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('music:loop').setEmoji(loopEmoji).setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('music:shuffle').setEmoji('🔀').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('music:stop').setEmoji('⏹️').setStyle(ButtonStyle.Danger),
    );
}
