import { respondError } from '../utils/embeds.js';

const BLOCKED_ROLES = ['nomusic', 'incapacitated'];

export function isMusicBlocked(member)
{
    return member?.roles?.cache?.some(role => BLOCKED_ROLES.includes(role.name.toLowerCase())) ?? false;
}

/**
 * Common checks for music commands and buttons. Replies with an error and returns null when a check fails.
 * @returns {Promise<{ queue: import('./GuildQueue.js').GuildQueue | undefined } | null>}
 */
export async function checkMusicAccess(interaction, { needsQueue = true } = {})
{
    if (isMusicBlocked(interaction.member))
    {
        await respondError(interaction, 'Seems like you aren\'t allowed to use the music features :confused:');
        return null;
    }

    const queue = interaction.client.queues.get(interaction.guildId);
    if (needsQueue && !queue)
    {
        await respondError(interaction, 'I\'m not playing anything right now.');
        return null;
    }
    if (queue && interaction.member.voice.channelId !== queue.voiceChannelId)
    {
        await respondError(interaction, `You need to be in <#${queue.voiceChannelId}> to do that.`);
        return null;
    }
    return { queue };
}
