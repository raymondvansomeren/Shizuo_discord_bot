const baseEmbed = require('../modules/base-embed.js');
const baseCommand = require('../modules/base-command.js');

const { getVoiceConnection } = require('@discordjs/voice');

const moment = require('moment');
const momentDurationFormatSetup = require('moment-duration-format');

module.exports = {
    name: 'queue',
    description: 'Lists the current queue',
    async execute(interaction)
    {
        await interaction.deferReply({ ephemeral: true });
        const serverQueue = interaction.client.queue.get(interaction.guild.id);
        if (serverQueue !== undefined
            && getVoiceConnection(interaction.guild.id) !== undefined)
        {
            const embed = baseEmbed.get(interaction.client);
            if (serverQueue.getSongs().length > 1)
            {
                let queueTime = 0;
                let extraText = '';
                for (let i = 0; i < serverQueue.getSongs().length; i++)
                {
                    if (serverQueue.getSongs(i).duration === Infinity)
                    {
                        extraText = 'over';
                        continue;
                    }
                    queueTime += parseInt(serverQueue.getSongs(i).duration);
                }

                momentDurationFormatSetup;
                embed.setDescription(`Total queue time: ${extraText}${moment.duration(queueTime, 'seconds').format('h:mm:ss').padStart(4, '0:0')}`);

                let page = 1;
                const songsPerPage = 10;
                const pageAmount = Math.ceil((serverQueue.getSongs().length - 1) / songsPerPage);

                let options = interaction.options?.data;
                for (let i = 0; i < options.length; i++)
                {
                    if (options[i].name === 'page')
                    {
                        options = options[i];
                        break;
                    }
                }

                if (options !== undefined
                    && options.value <= pageAmount)
                {
                    page = options.value;
                }

                embed.setFooter({ text: `Page ${page}/${pageAmount}` });

                for (let i = 0; i < songsPerPage; i++)
                {
                    const songNumber = i + 1 + (songsPerPage * (page - 1));
                    if (songNumber >= serverQueue.getSongs().length) break;

                    embed.addFields([
                        {
                            name: `[${songNumber}] ${serverQueue.getSongs(songNumber).title}`,
                            value: `[Duration: ${moment.duration(serverQueue.getSongs(songNumber).duration, 'seconds').format('h:mm:ss').padStart(4, '0:0')}](${serverQueue.getSongs(songNumber).url})`,
                        },
                    ]);
                }

                interaction.editReply({ embeds: [embed], ephemeral: true });
            }
            else
            {
                embed.setDescription('There are no songs in the queue');
            }

            interaction.editReply({ embeds: [embed], ephemeral: true });
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
                option.setName('page')
                    .setDescription('The page of the queue')
                    .setMinValue(1)
                    .setRequired(false));
    },
};