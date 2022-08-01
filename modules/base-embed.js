const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'base-embed',
    get(client)
    {
        return new EmbedBuilder()
            // .setThumbnail(client.user.displayAvatarURL())
            .setColor(client.config.color)
            .setAuthor({ name: `${client.user.username}`, iconURL: client.user.displayAvatarURL() });
    },
};
