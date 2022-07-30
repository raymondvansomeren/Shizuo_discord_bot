const baseCommand = require('../modules/base-command.js');
const baseEmbed = require('../modules/base-embed.js');

module.exports = {
    name: 'avatar',
    description: 'Returns the avatar of you or a specified user',
    async execute(interaction)
    {
        try
        {
            await interaction.deferReply({ ephemeral: true });
            // interaction.type 2 is ApplicationCommand: https://discord-api-types.dev/api/discord-api-types-v10/enum/InteractionType
            if (interaction.type !== 2)
            {
                throw `WrongInteractionType: Interaction type should be 2, but was ${interaction.type}`;
            }
            const options = interaction.options?.data;

            const embed = baseEmbed.get(interaction.client);

            if (options?.length <= 0)
            {
                embed
                    .setTitle(`Avatar of ${interaction.user.username}`)
                    .setDescription(`Link to avatar: <${interaction.user.displayAvatarURL({ format: 'png', dynamic: true })}>`)
                    .setImage(`${interaction.user.displayAvatarURL({ format: 'png', dynamic: true })}`);
            }
            else
            {
                let found = false;
                for (let i = 0; i < options.length; i++)
                {
                    if (options[i].name === 'user')
                    {
                        const user = options[i].user;
                        embed
                            .setTitle(`Avatar of ${user.username}`)
                            .setDescription(`Link to avatar: <${user.displayAvatarURL({ format: 'png', dynamic: true })}>`)
                            .setImage(`${user.displayAvatarURL({ format: 'png', dynamic: true })}`);
                        found = true;
                        break;
                    }
                }
                if (!found)
                {
                    throw 'UndefinedOption: Requested option not found!';
                }
            }

            interaction.editReply({ embeds: [embed.data], ephemeral: true });
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
        return baseCommand.get(this)
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('The user to get the avatar from')
                    .setRequired(false));
    },
};