import { InteractionContextType, SlashCommandBuilder } from 'discord.js';

import * as actions from '../music/actions.js';
import { checkMusicAccess } from '../music/guards.js';

export default {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop the music, clear the queue and leave the voice channel')
        .setContexts(InteractionContextType.Guild),

    async execute(interaction)
    {
        const access = await checkMusicAccess(interaction);
        if (!access) return;
        await actions.announce(interaction, access.queue, actions.stop(access.queue, interaction.user));
    },
};
