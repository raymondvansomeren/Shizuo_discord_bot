const baseCommand = require('../modules/base-command.js');
const baseEmbed = require('../modules/base-embed.js');

const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    name: 'shuffle',
    description: 'Shuffles the queue',
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
            interaction.editReply({ embeds: [
                baseEmbed.get(interaction.client)
                    .setDescription('Shuffling the queue :twisted_rightwards_arrows:'),
            ] });

            serverQueue.setSongs(this.shuffle(serverQueue.getSongs()));

            interaction.channel.send({ embeds: [
                baseEmbed.get(interaction.client)
                    .setDescription(`${interaction.user} shuffled the queue :twisted_rightwards_arrows:`),
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
                });
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
    shuffle(playlist)
    {
        const temp = playlist.shift();
        for (let i = 0; i < playlist.length; i++)
        {
            const randomIndex = Math.floor(Math.random() * playlist.length);

            const temporaryValue = playlist[i];
            playlist[i] = playlist[randomIndex];
            playlist[randomIndex] = temporaryValue;
        }
        playlist.unshift(temp);
        return playlist;
    },
};