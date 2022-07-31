const baseCommand = require('../modules/base-command.js');
const baseEmbed = require('../modules/base-embed.js');

const { getVoiceConnection } = require('@discordjs/voice');

const moment = require('moment');
const momentDurationFormatSetup = require('moment-duration-format');

module.exports = {
    name: 'resume',
    description: 'Resume playing where paused',
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
            await serverQueue.getMessage()?.delete()
                .catch(error =>
                {
                    // Nothing
                });
            interaction.editReply({ embeds: [
                baseEmbed.get(interaction.client)
                    .setDescription('Resuming the music'),
            ] });

            momentDurationFormatSetup;

            const song = serverQueue.getSongs(0);
            const embed = baseEmbed.get(interaction.client)
                .setDescription(`${interaction.user} resumed the music`)
                .setFields([
                    { name: 'Song', value: `[${song?.title}](${song?.url})` },
                    { name: 'Duration', value: `${moment.duration(song.duration, 'seconds').format('h:mm:ss').padStart(4, '0:0')}` },
                    { name: 'Added by', value: `${song.user}` },
                    { name: 'Ends', value: `<t:${Math.round(Date.now() / 1000) + song?.remaining}:R>` },
                ]);
            if (song.thumbnail !== undefined)
            {
                embed.setThumbnail(song.thumbnail);
            }
            serverQueue.setMessage(await interaction.channel.send({ embeds: [embed] })
                .catch(error =>
                {
                    // Nothing
                }));
            serverQueue?.play();
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