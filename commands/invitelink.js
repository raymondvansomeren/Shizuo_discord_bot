const baseCommand = require('../modules/base-command.js');
const baseEmbed = require('../modules/base-embed.js');

const { invitelink } = require('../config.json');

module.exports =
{
    name: 'invitelink',
    description: 'This command will return the invite link for the bot.',
    execute(interaction)
    {
        interaction.reply({ embeds: [
            baseEmbed.get(interaction.client)
                .setDescription(`Invite me from [here](${invitelink})`),
        ], ephemeral: true });
    },
    getCommand()
    {
        return baseCommand.get(this);
    },
};