import { InteractionContextType, MessageFlags, SlashCommandBuilder } from 'discord.js';

import { nowPlayingEmbed } from '../music/ui.js';
import { respondError } from '../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Show the track that is playing right now')
        .setContexts(InteractionContextType.Guild),

    async execute(interaction)
    {
        const queue = interaction.client.queues.get(interaction.guildId);
        // Anyone may look, even from outside the voice channel
        if (!queue?.current)
        {
            return respondError(interaction, 'Nothing is playing right now.');
        }
        await interaction.reply({ embeds: [nowPlayingEmbed(queue, { withProgress: true })], flags: MessageFlags.Ephemeral });
    },
};
