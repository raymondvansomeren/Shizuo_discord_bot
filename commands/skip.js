const baseCommand = require('../modules/base-command.js');
const baseEmbed = require('../modules/base-embed.js');

const moment = require('moment');
const momentDurationFormatSetup = require('moment-duration-format');

const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    name: 'skip',
    description: 'Skips the current song',
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
            serverQueue.getMessage()?.delete()
                .catch(error =>
                {
                    // Nothing
                });
            interaction.editReply({ embeds: [
                baseEmbed.get(interaction.client)
                    .setDescription('Skipping the current song'),
            ] });

            momentDurationFormatSetup;
            const song = serverQueue.getSongs(0);
            const embed = baseEmbed.get(interaction.client)
                .setDescription(`${interaction.user} skipped the current song`)
                .setFields([
                    { name: 'Title', value: `[${song.title}](${song.url})`, inline: true },
                    { name: 'Duration', value: `${moment.duration(song.duration, 'seconds').format('h:mm:ss').padStart(4, '0:0')}`, inline: true },
                    { name: 'Added by', value: `${song.user}`, inline: true },
                ]);

            if (song.thumbnail !== undefined)
            {
                embed.setThumbnail(song.thumbnail);
            }
            interaction.channel.send({ embeds: [embed] })
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
                });
            serverQueue?.getPlayer().stop();
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