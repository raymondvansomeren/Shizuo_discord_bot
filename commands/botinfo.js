const baseCommand = require('../modules/base-command.js');
const baseEmbed = require('../modules/base-embed.js');

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');

module.exports =
{
    name: 'botinfo',
    description: 'Shows info about this bot.',
    async execute(interaction)
    {
        try
        {
            const botembed = baseEmbed.get(interaction.client)
                .setTitle('Bot Information')
                .setFields([
                    { name: 'Bot Name', value: `${interaction.client.user.username}` },
                    { name: 'Created On', value: `${interaction.client.user.createdAt}` },
                    { name: 'Server amount', value: `${interaction.client.guilds.cache.size}` },
                    { name: 'Users', value: 'Unknown' },
                ])
                .setFooter({ text: 'Bot created by raymond570#2966', iconURL: `${interaction.client.users.cache.get('270871921137025024').displayAvatarURL({ format: 'png', dynamic: true })}` });

            await interaction.reply({ embeds: [botembed], ephemeral: false });

            const rest = new REST({ version: '10' }).setToken(interaction.client.config.token);

            let guilds = [];
            let userCount = 0;

            await rest.get(Routes.userGuilds())
                .then((g) =>
                {
                    guilds = g;
                });

            for (let i = 0; i < guilds.length; i++)
            {
                await rest.get(Routes.guildPreview(guilds[i].id))
                    .then((gg) =>
                    {
                        userCount += gg.approximate_member_count;
                    });
            }
            botembed.setFields([
                { name: 'Bot Name', value: `${interaction.client.user.username}` },
                { name: 'Created On', value: `${interaction.client.user.createdAt}` },
                { name: 'Server amount', value: `${interaction.client.guilds.cache.size}` },
                { name: 'Users', value: `${userCount}` },
            ]);

            interaction.editReply({ embeds: [botembed], ephemeral: false });
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