import { MessageFlags, SlashCommandBuilder } from 'discord.js';

import { baseEmbed } from '../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check the bot\'s latency'),

    async execute(interaction)
    {
        const response = await interaction.reply({ embeds: [baseEmbed(interaction.client).setTitle('🏓 Pinging…')], flags: MessageFlags.Ephemeral, withResponse: true });
        const roundTrip = response.resource.message.createdTimestamp - interaction.createdTimestamp;
        const gateway = interaction.client.ws.ping;

        await interaction.editReply({ embeds: [
            baseEmbed(interaction.client)
                .setTitle('🏓 Pong!')
                .addFields(
                    { name: 'Round trip', value: `${roundTrip}ms`, inline: true },
                    { name: 'Gateway', value: gateway >= 0 ? `${gateway}ms` : 'Unknown', inline: true },
                ),
        ] });
    },
};
