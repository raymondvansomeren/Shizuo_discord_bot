import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
    OAuth2Scopes,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from 'discord.js';

import { config } from '../config.js';
import { infoEmbed } from '../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Get the link to invite this bot to your server'),

    async execute(interaction)
    {
        const url = config.inviteUrl ?? interaction.client.generateInvite({
            scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
            permissions: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.EmbedLinks,
                PermissionFlagsBits.ReadMessageHistory,
                PermissionFlagsBits.Connect,
                PermissionFlagsBits.Speak,
            ],
        });

        await interaction.reply({
            embeds: [infoEmbed(interaction.client, 'Want me in your own server? Use the button below!')],
            components: [new ActionRowBuilder().addComponents(
                new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Invite me').setURL(url),
            )],
            flags: MessageFlags.Ephemeral,
        });
    },
};
