import { EmbedBuilder, MessageFlags, escapeMarkdown } from 'discord.js';

import { config } from '../config.js';

const ERROR_COLOR = 0xED4245;

export function baseEmbed(client)
{
    return new EmbedBuilder()
        .setColor(config.color)
        .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() });
}

export function infoEmbed(client, description)
{
    return baseEmbed(client).setDescription(description);
}

export function errorEmbed(client, description)
{
    return baseEmbed(client).setColor(ERROR_COLOR).setDescription(description);
}

/**
 * Masked markdown link that can't be broken by brackets/markdown in the title.
 */
export function trackLink(track, maxLength = 80)
{
    let title = track.title.replace(/[[\]]/g, '');
    if (title.length > maxLength)
    {
        title = `${title.slice(0, maxLength - 1)}…`;
    }
    return `[${escapeMarkdown(title)}](${track.url})`;
}

/**
 * Replies to (or edits the deferred reply of) an interaction, regardless of its state.
 */
export async function respond(interaction, payload)
{
    if (interaction.deferred || interaction.replied)
    {
        const { flags, ...rest } = payload;
        return interaction.replied ? interaction.followUp({ ...rest, flags }) : interaction.editReply(rest);
    }
    return interaction.reply(payload);
}

export function respondError(interaction, description)
{
    return respond(interaction, {
        embeds: [errorEmbed(interaction.client, description)],
        flags: MessageFlags.Ephemeral,
    });
}
