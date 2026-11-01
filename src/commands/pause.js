import { InteractionContextType, SlashCommandBuilder } from 'discord.js';

import * as actions from '../music/actions.js';
import { checkMusicAccess } from '../music/guards.js';
import { respondError } from '../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause the music')
        .setContexts(InteractionContextType.Guild),

    async execute(interaction)
    {
        const access = await checkMusicAccess(interaction);
        if (!access) return;
        if (access.queue.paused)
        {
            return respondError(interaction, 'The music is already paused. Use `/resume` to continue.');
        }
        await actions.announce(interaction, access.queue, actions.togglePause(access.queue, interaction.user));
    },
};
