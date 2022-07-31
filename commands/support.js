const baseEmbed = require('../modules/base-embed.js');
const baseCommand = require('../modules/base-command.js');

module.exports =
{
    name: 'support',
    description: 'Bot support server on discord.',
    execute(interaction)
    {
        // Send a message containing the invite link to the discord server
        interaction.reply({ content: `${require('../config.json').discord}`, embeds: [
            baseEmbed.get(interaction.client)
                .setDescription(`Join the discord server [here](${require('../config.json').discord})`),
        ], ephemeral: true });
    },
    getCommand()
    {
        return baseCommand.get(this);
    },
};