import { InteractionContextType, SlashCommandBuilder } from 'discord.js';

import { announce } from '../music/actions.js';
import { checkMusicAccess } from '../music/guards.js';
import { respondError, trackLink } from '../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove a track from the queue')
        .setContexts(InteractionContextType.Guild)
        .addIntegerOption(option => option
            .setName('position')
            .setDescription('Position of the track in /queue')
            .setMinValue(1)
            .setRequired(true)),

    async execute(interaction)
    {
        const access = await checkMusicAccess(interaction);
        if (!access) return;
        const { queue } = access;

        const position = interaction.options.getInteger('position', true);
        if (position > queue.tracks.length)
        {
            return respondError(interaction, `There are only ${queue.tracks.length} tracks in the queue.`);
        }

        const [track] = queue.tracks.splice(position - 1, 1);
        await announce(interaction, queue, `🗑️ ${interaction.user} removed ${trackLink(track)} from the queue`);
    },
};
