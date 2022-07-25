const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'base-embed',
    get(client)
    {
        return new EmbedBuilder()
            // .setThumbnail(client.user.displayAvatarURL())
            .setColor(client.config.color)
            .setFooter({ text: `${client.user.username}`, iconURL: client.user.defaultAvatarURL });
    },
};