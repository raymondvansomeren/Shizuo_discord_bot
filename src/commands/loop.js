import { InteractionContextType, SlashCommandBuilder } from 'discord.js';

import * as actions from '../music/actions.js';
import { LoopMode } from '../music/GuildQueue.js';
import { checkMusicAccess } from '../music/guards.js';

export default {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Set the loop mode (cycles through the modes when left empty)')
        .setContexts(InteractionContextType.Guild)
        .addStringOption(option => option
            .setName('mode')
            .setDescription('What to loop')
            .addChoices(
                { name: 'Off', value: LoopMode.Off },
                { name: 'Current track', value: LoopMode.Track },
                { name: 'Whole queue', value: LoopMode.Queue },
            )),

    async execute(interaction)
    {
        const access = await checkMusicAccess(interaction);
        if (!access) return;
        const mode = interaction.options.getString('mode') ?? undefined;
        await actions.announce(interaction, access.queue, actions.setLoop(access.queue, interaction.user, mode));
    },
};
