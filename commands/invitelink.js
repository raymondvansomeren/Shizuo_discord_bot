const { invitelink } = require('../config.json');

module.exports =
{
    name: 'invitelink',
    description: 'This command will return the invite link for the bot.',
    aliases: ['invite', 'botinvite', 'link'],
    usage: '',
    execute(bot, message, args)
    {
        message.channel.send(`Here is my link: ${invitelink}`);
    },
};