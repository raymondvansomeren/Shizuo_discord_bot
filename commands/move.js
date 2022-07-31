const baseCommand = require('../modules/base-command.js');
const baseEmbed = require('../modules/base-embed.js');

const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    name: 'move',
    description: 'Moves a song from index to new_index',
    async execute(interaction)
    {
        await interaction.deferReply({ ephemeral: true });

        if (interaction.member?.roles?.cache?.find(role => role.name.toLowerCase() === 'nomusic')
        && interaction.member?.roles?.cache?.find(role => role.name.toLowerCase() === 'incapacitated'))
        {
            return interaction.editReply({ embeds: [baseEmbed.get(interaction.client).setDescription('Seems like you aren\'t allowed to use the music features :confused:')], ephemeral: true });
        }
        const serverQueue = interaction.client.queue.get(interaction.guild.id);
        if (serverQueue
            || getVoiceConnection(interaction.guild.id) !== undefined)
        {
            serverQueue.getMessage()?.delete()
                .catch(error =>
                {
                    // Nothing
                });

            const indexOld = interaction.options?.data.find(element => element.name === 'index')?.value;
            const indexNew = interaction.options?.data.find(element => element.name === 'new_index')?.value;
            if (indexOld === undefined || indexNew === undefined)
            {
                return interaction.editReply({ embeds: [
                    baseEmbed.get(interaction.client)
                        .setDescription('Something went wrong, try again later'),
                ] });
            }
            const song = serverQueue.getSongs(indexOld);
            interaction.editReply({ embeds: [
                baseEmbed.get(interaction.client)
                    .setDescription(`Moved ${indexOld} to ${indexNew}`),
            ] });

            interaction.channel.send({ embeds: [
                baseEmbed.get(interaction.client)
                    .setDescription(`${interaction.user} moved [${song.title}](${song.url}) to index ${indexNew}`),
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
            // serverQueue?.stop();
            const songs = serverQueue.getSongs();
            songs.splice(indexOld, 1);
            songs.splice(indexNew, 0, song);
            serverQueue.setSongs(songs);
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
            .addNumberOption(option =>
                option.setName('index')
                    .setDescription('Index of song to move')
                    .setMinValue(1)
                    .setRequired(true))
            .addNumberOption(option =>
                option.setName('new_index')
                    .setDescription('New index of song')
                    .setMinValue(1)
                    .setRequired(true));
    },
};