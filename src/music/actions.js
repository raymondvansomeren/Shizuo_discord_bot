import { infoEmbed, trackLink } from '../utils/embeds.js';
import { LoopMode } from './GuildQueue.js';
import { LOOP_LABELS } from './ui.js';

/*
 * Actions shared by the slash commands and the now playing buttons.
 * Each returns the description of a public announcement.
 */

export function togglePause(queue, user)
{
    if (queue.paused)
    {
        queue.resume();
        return `▶️ ${user} resumed the music`;
    }
    queue.pause();
    return `⏸️ ${user} paused the music`;
}

export function skip(queue, user)
{
    const track = queue.current;
    queue.skip();
    return `⏭️ ${user} skipped ${track ? trackLink(track) : 'the current track'}`;
}

export function setLoop(queue, user, mode)
{
    const order = [LoopMode.Off, LoopMode.Track, LoopMode.Queue];
    queue.loop = mode ?? order[(order.indexOf(queue.loop) + 1) % order.length];
    return `${LOOP_LABELS[queue.loop]} (set by ${user})`;
}

export function shuffle(queue, user)
{
    queue.shuffle();
    return `🔀 ${user} shuffled the queue (${queue.tracks.length} tracks)`;
}

export function stop(queue, user)
{
    queue.stop();
    return `⏹️ ${user} stopped the music`;
}

/** Sends a public announcement as the interaction reply and refreshes the now playing message. */
export async function announce(interaction, queue, description)
{
    await interaction.reply({ embeds: [infoEmbed(interaction.client, description)] });
    if (!queue.destroyed)
    {
        await queue.refreshNowPlaying();
    }
}
