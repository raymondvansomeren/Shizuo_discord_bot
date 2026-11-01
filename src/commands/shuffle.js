import { InteractionContextType, SlashCommandBuilder } from 'discord.js';

import * as actions from '../music/actions.js';
import { checkMusicAccess } from '../music/guards.js';
import { respondError } from '../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Shuffle the queue')
        .setContexts(InteractionContextType.Guild),

    async execute(interaction)
    {
        const access = await checkMusicAccess(interaction);
        if (!access) return;
        if (access.queue.tracks.length < 2)
        {
            return respondError(interaction, 'There aren\'t enough tracks in the queue to shuffle.');
        }
        await actions.announce(interaction, access.queue, actions.shuffle(access.queue, interaction.user));
    },
};
