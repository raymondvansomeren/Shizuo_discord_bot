import { createRequire } from 'node:module';

import { MessageFlags, SlashCommandBuilder, Team } from 'discord.js';

import { baseEmbed } from '../utils/embeds.js';
import { discordTimestamp } from '../utils/format.js';

const pkg = createRequire(import.meta.url)('../../package.json');

export default {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Show info about this bot'),

    async execute(interaction)
    {
        const { client } = interaction;
        const application = await client.application.fetch();
        const owner = application.owner instanceof Team ? application.owner.owner?.user : application.owner;
        const members = client.guilds.cache.reduce((sum, guild) => sum + (guild.memberCount ?? 0), 0);
        const startedAt = new Date(Date.now() - client.uptime);

        const embed = baseEmbed(client)
            .setTitle('Bot information')
            .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
            .addFields(
                { name: 'Name', value: client.user.username, inline: true },
                { name: 'Servers', value: `${client.guilds.cache.size}`, inline: true },
                { name: 'Users', value: `~${members.toLocaleString('en-US')}`, inline: true },
                { name: 'Playing music in', value: `${client.queues.size} server${client.queues.size === 1 ? '' : 's'}`, inline: true },
                { name: 'Created', value: discordTimestamp(client.user.createdAt, 'D'), inline: true },
                { name: 'Online since', value: discordTimestamp(startedAt), inline: true },
                { name: 'Version', value: `v${pkg.version}`, inline: true },
            );
        if (owner)
        {
            embed.setFooter({ text: `Bot created by ${owner.username}`, iconURL: owner.displayAvatarURL() });
        }

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    },
};
