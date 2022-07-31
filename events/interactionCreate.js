const { logLevel } = require('../config.json');
const logger = require('log4js').getLogger();
logger.level = logLevel;

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction)
    {
        // interaction.type 2 is ApplicationCommand: https://discord-api-types.dev/api/discord-api-types-v10/enum/InteractionType
        if (interaction.type != 2) return;

        const client = interaction.client;

        if (!client.commands.has(interaction.commandName)) return;

        try
        {
            await client.commands.get(interaction.commandName).execute(interaction);
        }
        catch (error)
        {
            client.logger.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },
};