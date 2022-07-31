const baseCommand = require('../modules/base-command.js');
const baseEmbed = require('../modules/base-embed.js');

const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    name: 'loop',
    description: 'Set the loopstate',
    async execute(interaction)
    {
        await interaction.deferReply({ ephemeral: true });

        if (interaction.member?.roles?.cache?.find(role => role.name.toLowerCase() === 'nomusic')
        || interaction.member?.roles?.cache?.find(role => role.name.toLowerCase() === 'incapacitated'))
        {
            return interaction.editReply({ embeds: [baseEmbed.get(interaction.client).setDescription('Seems like you aren\'t allowed to use the music features :confused:')], ephemeral: true });
        }
        const serverQueue = interaction.client.queue.get(interaction.guild.id);
        if (serverQueue
            && getVoiceConnection(interaction.guild.id) !== undefined)
        {
            const options = interaction.options.data;

            for (let i = 0; i < options.length; i++)
            {
                if (options[i].name === 'loop')
                {
                    switch (options[i].value)
                    {
                    case 'none':
                    {
                        interaction.editReply({ embeds: [
                            baseEmbed.get(interaction.client)
                                .setDescription('Not looping the queue :arrow_forward:'),
                        ] });

                        interaction.channel.send({ embeds: [
                            baseEmbed.get(interaction.client)
                                .setDescription(`${interaction.user} stopped looping the music :arrow_forward:`),
                        ] })
                            .then(msg =>
                            {
                                setTimeout(() =>
                                {
                                    msg?.delete()
                                        .catch(error =>
                                        {
                                            // Nothing
                                        });
                                }, 10000);
                            })
                            .catch(error =>
                            {
                                // Nothing
                            });
                        serverQueue?.loopNone();
                        break;
                    }
                    case 'single':
                    {
                        interaction.editReply({ embeds: [
                            baseEmbed.get(interaction.client)
                                .setDescription('Now looping this one song :repeat_one:'),
                        ] });

                        interaction.channel.send({ embeds: [
                            baseEmbed.get(interaction.client)
                                .setDescription(`${interaction.user} started looping this single song :repeat_one:`),
                        ] })
                            .then(msg =>
                            {
                                setTimeout(() =>
                                {
                                    msg?.delete()
                                        .catch(error =>
                                        {
                                            // Nothing
                                        });
                                }, 10000);
                            })
                            .catch(error =>
                            {
                                // Nothing
                            });
                        serverQueue?.loopSingle();
                        break;
                    }
                    case 'all':
                    {
                        interaction.editReply({ embeds: [
                            baseEmbed.get(interaction.client)
                                .setDescription('Now looping the whole queue :repeat:'),
                        ] });

                        interaction.channel.send({ embeds: [
                            baseEmbed.get(interaction.client)
                                .setDescription(`${interaction.user} started looping the whole queue :repeat:`),
                        ] })
                            .then(msg =>
                            {
                                setTimeout(() =>
                                {
                                    msg?.delete()
                                        .catch(error =>
                                        {
                                            // Nothing
                                        });
                                }, 10000);
                            })
                            .catch(error =>
                            {
                                // Nothing
                            });
                        serverQueue?.loopQueue();
                        break;
                    }
                    }
                    break;
                }
            }
        }
        else
        {
            interaction.editReply({ embeds: [
                baseEmbed.get(interaction.client)
                    .setDescription('I wasn\'t in a voice channel'),
            ] });
        }
    },
    getCommand()
    {
        return baseCommand.get(this)
            .addStringOption(option =>
                option.setName('loop')
                    .setDescription('Which type of looping to set')
                    .addChoices(
                        { name: 'No loop', value: 'none' },
                        { name: 'Loop single', value: 'single' },
                        { name: 'Loop all', value: 'all' },
                    )
                    .setRequired(true));
    },
};