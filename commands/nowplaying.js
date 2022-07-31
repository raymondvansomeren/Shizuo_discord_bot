// TODO add loop status to reply

const baseCommand = require('../modules/base-command.js');
const baseEmbed = require('../modules/base-embed.js');

const { getVoiceConnection } = require('@discordjs/voice');

const moment = require('moment');
const momentDurationFormatSetup = require('moment-duration-format');

module.exports = {
    name: 'nowplaying',
    description: 'Shows which song is currently playing with extra info',
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
            serverQueue.getSongs(0).remaining = parseInt(serverQueue.getSongs(0).duration - (serverQueue.getAudioResource().playbackDuration / 1000));
            const song = serverQueue.getSongs(0);

            momentDurationFormatSetup;
            const embed = baseEmbed.get(interaction.client)
                .setDescription(`[${song?.title}](${song?.url})`)
                .setFields([
                    { name: 'Full duration', value: `${moment.duration(song.duration, 'seconds').format('h:mm:ss').padStart(4, '0:0')}`, inline: true },
                    { name: 'Added by', value: `${song.user}`, inline: true },
                    { name: 'Ends', value: `<t:${Math.round(Date.now() / 1000) + song.remaining}:R>`, inline: true },
                    { name: 'Time since start', value: `${moment.duration(parseInt(serverQueue.getAudioResource().playbackDuration / 1000), 'seconds').format('h:mm:ss').padStart(4, '0:0')}`, inline: true },
                ]);

            if (song.thumbnail !== undefined)
            {
                embed.setThumbnail(song.thumbnail);
            }
            switch(serverQueue.getLoopState())
            {
            case 'none':
            {
                embed.addFields([{ name: 'Repeat?', value: ':arrow_forward: Not repeating any songs' }]);
                break;
            }
            case 'single':
            {
                embed.addFields([{ name: 'Repeat?', value: ':repeat_one: Repeating current song' }]);
                break;
            }
            case 'all':
            {
                embed.addFields([{ name: 'Repeat?', value: ':arrow_forward: Repeating the whole queue' }]);
                break;
            }
            }
            interaction.editReply({ embeds: [embed] });
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