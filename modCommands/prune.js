module.exports =
{
    name: 'prune',
    description: 'Deleted up to 100 message that are no older than 2 weeks.',
    aliases: ['delete'],
    usage: '[number of messages to delete]',
    cooldown: 0,
    execute(bot, message, args)
    {
        // Check if a member has a specific permission on the guild!
        if (!message.member.hasPermission('MANAGE_MESSAGES'))
            return message.channel.send('Well, this is awkwards. You don\'t have the permissions to use this command.');

        try
        {
            if (isNaN(args[0]))
            {
                message.channel.send('Ehm, you should give me a number of messages to delete.')
                    .then(msg =>
                    {
                        msg.delete({ timeout: 5000 });
                    });
                message.delete({ timeout: 5000 });
                return;
            }
            let messagecount = parseInt(args[0]);
            if (messagecount >= 100)
                messagecount = 99;
            else if (messagecount < 1)
                messagecount = 1;

            message.channel.bulkDelete(messagecount + 1, true);

            if (messagecount === 1)
            {
                message.reply(`${messagecount} message has been deleted succesfully.`)
                    .then(msg =>
                    {
                        msg.delete({ timeout: 5000 });
                    });
            }
            else
            {
                message.reply(`${messagecount} messages have been deleted succesfully.`)
                    .then(msg =>
                    {
                        msg.delete({ timeout: 5000 });
                    });
            }
        }
        catch(err)
        {
            message.channel.send('No messages got deleted.')
                .then(msg =>
                {
                    msg.delete({ timeout: 5000 });
                });
            message.delete({ timeout: 5000 });
        }
    },
};