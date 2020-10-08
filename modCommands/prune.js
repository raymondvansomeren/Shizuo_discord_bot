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
            return message.channel.send('You don\'t have the permissions to use this command');

        if (!isNaN(args[0]))
        {
            let messagecount = parseInt(args[0]);
            try
            {
                if (messagecount >= 100)
                    messagecount = 99;

                message.channel.messages.fetch({ limit: (messagecount + 1) })
                    .then(messages =>
                    {
                        message.channel.bulkDelete(messages, true)
                            .then(() =>
                            {
                                if (messages.size - 1 > 0)
                                {
                                    message.reply(`${messages.size - 1} messages have been deleted succesfully.`)
                                        .then(msg =>
                                        {
                                            msg.delete({ timeout: 5000 });
                                        });
                                }
                                else
                                {
                                    message.reply('No messages were deleted.')
                                        .then(msg =>
                                        {
                                            msg.delete({ timeout: 5000 });
                                        });
                                }
                            })
                            .catch(e =>
                            {
                                console.err('Error: ' + e);
                            });
                    });
            }
            catch(err)
            {
                message.channel.send('No message got deleted')
                    .then(msg =>
                    {
                        console.log(err);
                        msg.delete({ timeout: 5000 });
                        message.delete({ timeout: 5000 });
                    });
            }
        }
        else
        {
            message.channel.send('You didn\'t send me a number.');
        }
    },
};