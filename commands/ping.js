const baseCommand = require('../modules/base-command.js');
const baseEmbed = require('../modules/base-embed.js');

module.exports = {
    name: 'ping',
    description: 'Replies with Pong!',
    async execute(interaction)
    {
        try
        {
            const embed = baseEmbed.get(interaction.client)
                .setTitle('Ping')
                .setDescription('---ms');

            // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
            const t = new Date();
            interaction.reply({ embeds: [embed.data], ephemeral: false })
                .then(() =>
                {
                    const tt = new Date();
                    const ping = tt - t;
                    embed.setDescription(`${ping}ms`);
                    interaction.editReply({ embeds: [embed.data], ephemeral: false });
                });
        }
        catch (error)
        {
            const embed = baseEmbed.get(interaction.client)
                .setDescription('Something went wrong, try again later');
            if (interaction.deferred || interaction.replied)
            {
                interaction.editReply({ embeds: [embed.data], ephemeral: true });
            }
            else
            {
                interaction.reply({ embeds: [embed.data], ephemeral: true });
            }
            interaction.client.logger.error(error);
        }
    },
    getCommand()
    {
        return baseCommand.get(this);
    },
};