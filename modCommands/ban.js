module.exports =
{
    name: 'ban',
    description: 'Ban a user. Reason is optional.',
    usage: '[mention] [reason]',
    cooldown: 3,
    execute(bot, message, args)
    {
        if (message.member.hasPermission('BAN_MEMBERS'))
        {
            const toBan = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
            if (!toBan)
                return message.channel.send('Invalid User');
            if (message.author.id === toBan.id)
            {
                return message.channel.send('You can\'t ban yourself.')
                    .then(msg =>
                    {
                        message.delete({ timeout: 5000 });
                        msg.delete({ timeout: 5000 });
                    });
            }

            if (args.length === 1)
            {
                toBan.ban({ reason: 'None' });
                message.channel.send(`Succesfully banned ${toBan}.`)
                    .then(msg =>
                    {
                        message.delete({ timeout: 5000 });
                        msg.delete({ timeout: 5000 });
                    });
            }
            else if (args.length > 1)
            {
                args.shift();
                const reason = args.join(' ');
                toBan.ban({ reason: reason });
                message.channel.send(`Succesfully banned ${toBan} with reason \`${reason}\`.`)
                    .then(msg =>
                    {
                        message.delete({ timeout: 5000 });
                        msg.delete({ timeout: 5000 });
                    });
            }
        }
    },
};