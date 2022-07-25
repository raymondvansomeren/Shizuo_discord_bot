const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'base-embed',
    get(t)
    {
        return new SlashCommandBuilder()
            .setName(t.name)
            .setDescription(t.description);
    },
};