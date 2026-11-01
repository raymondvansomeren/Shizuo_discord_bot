import { Events } from 'discord.js';

import { logger } from '../logger.js';
import { handleMusicButton } from '../music/buttons.js';
import { respondError } from '../utils/embeds.js';

export default {
    name: Events.InteractionCreate,
    async execute(interaction)
    {
        try
        {
            if (interaction.isChatInputCommand())
            {
                const command = interaction.client.commands.get(interaction.commandName);
                if (!command) return;
                logger.debug(`/${interaction.commandName} used by ${interaction.user.tag} in ${interaction.guild?.name ?? 'DMs'}`);
                await command.execute(interaction);
            }
            else if (interaction.isButton() && interaction.customId.startsWith('music:'))
            {
                await handleMusicButton(interaction);
            }
        }
        catch (error)
        {
            logger.error(`Error while handling interaction ${interaction.commandName ?? interaction.customId}:`, error);
            if (interaction.isRepliable())
            {
                await respondError(interaction, 'Something went wrong, try again later.').catch(() => undefined);
            }
        }
    },
};
