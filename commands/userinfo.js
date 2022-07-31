const baseCommand = require('../modules/base-command.js');
const baseEmbed = require('../modules/base-embed.js');

module.exports = {
    name: 'userinfo',
    description: 'Shows info about specified user',
    async execute(interaction)
    {
        try
        {
            // interaction.type 2 is ApplicationCommand: https://discord-api-types.dev/api/discord-api-types-v10/enum/InteractionType
            // This is only checked for commands with options, because the options will only be available if the interaction type is ApplicationCommand
            if (interaction.type !== 2)
            {
                throw `WrongInteractionType: Interaction type should be 2, but was ${interaction.type}`;
            }
            const options = interaction.options?.data;

            const embed = baseEmbed.get(interaction.client);

            let member = undefined;

            // Is there a user defined or are we going to use the command caller?
            if (options?.length <= 0)
            {
                member = interaction.member;
            }
            else
            {
                let found = false;
                for (let i = 0; i < options.length; i++)
                {
                    if (options[i].name === 'user')
                    {
                        member = options[i].member;
                        found = true;
                        break;
                    }
                }
                if (!found)
                {
                    throw 'UndefinedOption: Requested option not found!';
                }
            }

            // Fill the embed with userdata
            embed
                .setTitle(`Info about user ${member.user.username}`)
                .setFields([
                    { name: 'User', value: `<@${member.user.id}>`, inline: true },
                    { name: 'Created at', value: `<t:${Math.round(member.user.createdTimestamp / 1000)}:F> (<t:${Math.round(member.user.createdTimestamp / 1000)}:R>)`, inline: true },
                    { name: 'Joined at', value: `<t:${Math.round(member.joinedTimestamp / 1000)}:F> (<t:${Math.round(member.joinedTimestamp / 1000)}:R>)`, inline: true },
                    { name: 'ID', value: `${member.id}`, inline: true },
                    { name: 'Avatar', value: `<${member.user.displayAvatarURL({ format: 'png', dynamic: true })}>`, inline: false },
                ])
                .setImage(`${member.user.displayAvatarURL({ format: 'png', dynamic: true })}`);

            // Only add roles to the fields if the user has some roles
            if (member._roles.length > 0)
            {
                let roles = '';
                for (const role of member._roles)
                {
                    roles += `<@&${role}> `;
                }
                embed.addFields([{ name: 'Roles', value: roles, inline: true }]);
            }

            interaction.reply({ embeds: [embed.data], ephemeral: false });
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