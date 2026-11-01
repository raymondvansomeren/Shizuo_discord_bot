import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, SlashCommandBuilder } from 'discord.js';

import { config } from '../config.js';
import { infoEmbed } from '../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('support')
        .setDescription('Get a link to the bot\'s support server'),

    async execute(interaction)
    {
        await interaction.reply({
            embeds: [infoEmbed(interaction.client, 'Need help or found a bug? Join the support server!')],
            components: [new ActionRowBuilder().addComponents(
                new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Support server').setURL(config.supportUrl),
            )],
            flags: MessageFlags.Ephemeral,
        });
    },
};
