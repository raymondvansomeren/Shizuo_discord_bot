import { InteractionContextType, MessageFlags, SlashCommandBuilder } from 'discord.js';

import { baseEmbed, respondError } from '../utils/embeds.js';
import { discordTimestamp } from '../utils/format.js';

export default {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Show info about yourself or another member')
        .setContexts(InteractionContextType.Guild)
        .addUserOption(option => option
            .setName('user')
            .setDescription('The member to show info about')),

    async execute(interaction)
    {
        const member = interaction.options.getUser('user')
            ? interaction.options.getMember('user')
            : interaction.member;
        if (!member)
        {
            return respondError(interaction, 'That user isn\'t a member of this server.');
        }

        const user = await member.user.fetch();
        const roles = member.roles.cache
            .filter(role => role.id !== interaction.guild.id)
            .sort((a, b) => b.position - a.position)
            .map(role => `${role}`);

        const embed = baseEmbed(interaction.client)
            .setTitle(`Info about ${member.displayName}`)
            .setThumbnail(member.displayAvatarURL({ size: 512 }))
            .addFields(
                { name: 'User', value: `${user} (${user.username})`, inline: true },
                { name: 'ID', value: user.id, inline: true },
                { name: 'Bot', value: user.bot ? 'Yes' : 'No', inline: true },
                { name: 'Account created', value: `${discordTimestamp(user.createdAt, 'F')} (${discordTimestamp(user.createdAt)})` },
                { name: 'Joined server', value: member.joinedAt ? `${discordTimestamp(member.joinedAt, 'F')} (${discordTimestamp(member.joinedAt)})` : 'Unknown' },
            );

        if (roles.length > 0)
        {
            let value = '';
            for (const role of roles)
            {
                if (value.length + role.length + 1 > 1000)
                {
                    value += '…';
                    break;
                }
                value += `${role} `;
            }
            embed.addFields({ name: `Roles (${roles.length})`, value });
        }
        if (user.banner)
        {
            embed.setImage(user.bannerURL({ size: 1024 }));
        }
        const color = user.accentColor || member.displayColor;
        if (color)
        {
            embed.setColor(color);
        }

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    },
};
