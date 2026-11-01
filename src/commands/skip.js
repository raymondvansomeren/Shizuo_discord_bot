import { InteractionContextType, SlashCommandBuilder } from 'discord.js';

import * as actions from '../music/actions.js';
import { checkMusicAccess } from '../music/guards.js';

export default {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the current track')
        .setContexts(InteractionContextType.Guild),

    async execute(interaction)
    {
        const access = await checkMusicAccess(interaction);
        if (!access) return;
        await actions.announce(interaction, access.queue, actions.skip(access.queue, interaction.user));
    },
};
