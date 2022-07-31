const baseCommand = require('../modules/base-command.js');
const baseEmbed = require('../modules/base-embed.js');

const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    name: 'remove',
    description: 'Removes a song from the queue',
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
            const index = interaction.options?.data.find(element => element.name === 'index')?.value;
            if (!index || index >= serverQueue.getSongs().length)
            {
                await interaction.editReply({ embeds: [
                    baseEmbed.get(interaction.client)
                        .setDescription('I don\'t have that many songs in the queue'),
                ] });
                return;
            }

            const song = serverQueue.getSongs(index);
            interaction.editReply({ embeds: [
                baseEmbed.get(interaction.client)
                    .setDescription(`Removing **[${song.title}](${song.url})** from the queue`)
                    .setThumbnail(song.thumbnail),
            ] });

            interaction.channel.send({ embeds: [
                baseEmbed.get(interaction.client)
                    .setDescription(`${interaction.user} removed [${song.title}](${song.url}) from the queue`)
                    .setThumbnail(song.thumbnail),
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
            const songs = serverQueue.getSongs();
            songs.splice(index, 1);
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
                    .setDescription('Index of song to remove')
                    .setMinValue(1)
                    .setRequired(true));
    },
};