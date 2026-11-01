import { InteractionContextType, SlashCommandBuilder } from 'discord.js';

import { announce } from '../music/actions.js';
import { checkMusicAccess } from '../music/guards.js';
import { respondError, trackLink } from '../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('move')
        .setDescription('Move a track to another position in the queue')
        .setContexts(InteractionContextType.Guild)
        .addIntegerOption(option => option
            .setName('from')
            .setDescription('Current position of the track in /queue')
            .setMinValue(1)
            .setRequired(true))
        .addIntegerOption(option => option
            .setName('to')
            .setDescription('New position of the track')
            .setMinValue(1)
            .setRequired(true)),

    async execute(interaction)
    {
        const access = await checkMusicAccess(interaction);
        if (!access) return;
        const { queue } = access;

        const from = interaction.options.getInteger('from', true);
        const to = Math.min(interaction.options.getInteger('to', true), queue.tracks.length);
        if (from > queue.tracks.length)
        {
            return respondError(interaction, `There are only ${queue.tracks.length} tracks in the queue.`);
        }

        const [track] = queue.tracks.splice(from - 1, 1);
        queue.tracks.splice(to - 1, 0, track);
        await announce(interaction, queue, `↕️ ${interaction.user} moved ${trackLink(track)} to position #${to}`);
    },
};
