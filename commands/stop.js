const baseCommand = require('../modules/base-command.js');
const baseEmbed = require('../modules/base-embed.js');

const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    name: 'stop',
    description: 'Stops playing music and disconnects the bot',
    async execute(interaction)
    {
        await interaction.deferReply({ ephemeral: true });

        if (interaction.member?.roles?.cache?.find(role => role.name.toLowerCase() === 'nomusic')
        || interaction.member?.roles?.cache?.find(role => role.name.toLowerCase() === 'incapacitated'))
        {
            return interaction.editReply({ embeds: [baseEmbed.get(interaction.client).setDescription('Seems like you aren\'t allowed to use the music features :confused:')], ephemeral: true });
        }
        const serverQueue = interaction.client.queue.get(interaction.guild.id);
        // TODO can't find connection after restart
        interaction.client.logger.debug(getVoiceConnection(interaction.guild.id));
        if (serverQueue
            || getVoiceConnection(interaction.guild.id) !== undefined)
        {
            serverQueue.getMessage()?.delete()
                .catch(error =>
                {
                    // Nothing
                });
            interaction.editReply({ embeds: [
                baseEmbed.get(interaction.client)
                    .setDescription('Stopping the music and leaving the channel'),
            ] });

            interaction.channel.send({ embeds: [
                baseEmbed.get(interaction.client)
                    .setDescription(`${interaction.user} stopped the music`),
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
            serverQueue?.stop();
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
        return baseCommand.get(this);
    },
};