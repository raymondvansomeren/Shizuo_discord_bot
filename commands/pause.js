const baseCommand = require('../modules/base-command.js');
const baseEmbed = require('../modules/base-embed.js');

const { getVoiceConnection } = require('@discordjs/voice');

const moment = require('moment');
const momentDurationFormatSetup = require('moment-duration-format');

module.exports = {
    name: 'pause',
    description: 'Pause the currently playing song/playlist',
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
                    .setDescription('Pausing the music'),
            ] });

            const embed = baseEmbed.get(interaction.client)
                .setDescription(`${interaction.user} paused the music`)
                .setFields([
                    { name: 'Song', value: `[${serverQueue.getSongs(0)?.title}](${serverQueue.getSongs(0)?.url})` },
                ]);

            if (serverQueue.getSongs(0).thumbnail !== undefined)
            {
                embed.setThumbnail(serverQueue.getSongs(0).thumbnail);
            }

            if (serverQueue.getSongs(0).duration !== Infinity)
            {
                momentDurationFormatSetup;
                serverQueue.getSongs(0).remaining = parseInt(serverQueue.getSongs(0).duration - (serverQueue.getAudioResource().playbackDuration / 1000));
                embed.addFields([
                    { name: 'Remaining time', value: `${moment.duration(serverQueue.getSongs(0).remaining, 'seconds').format('h:mm:ss').padStart(4, '0:0')} minutes` },
                ]);
            }

            serverQueue.setMessage(await interaction.channel.send({ embeds: [embed] }));

            serverQueue?.pause();
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