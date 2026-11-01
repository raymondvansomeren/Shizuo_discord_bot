import { SlashCommandBuilder } from 'discord.js';

import { baseEmbed } from '../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Show your avatar or the avatar of another user')
        .addUserOption(option => option
            .setName('user')
            .setDescription('The user to get the avatar from')),

    async execute(interaction)
    {
        const user = interaction.options.getUser('user') ?? interaction.user;
        // Prefer the server-specific avatar when there is one
        const member = interaction.options.getMember('user') ?? (user.id === interaction.user.id ? interaction.member : null);
        const url = (member?.displayAvatarURL ? member : user).displayAvatarURL({ size: 1024 });

        await interaction.reply({ embeds: [
            baseEmbed(interaction.client)
                .setTitle(`Avatar of ${user.displayName}`)
                .setURL(url)
                .setImage(url),
        ] });
    },
};
