module.exports =
{
    name: 'ban',
    description: 'Ban a user. Reason is optional.',
    usage: '[mention] [reason]',
    cooldown: 3,
    execute(bot, message, args)
    {
        if (args.length === 0)
        {
            return message.channel.send('You need to mention someone.')
                .then(msg =>
                {
                    if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                    {
                        message.delete({ timeout: 5000 });
                        msg.delete({ timeout: 5000 });
                    }
                });
        }
        if (message.member.hasPermission('BAN_MEMBERS'))
        {
            const toBan = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
            if (!toBan)
            {
                return message.channel.send('Invalid User')
                    .then(msg =>
                    {
                        if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                        {
                            message.delete({ timeout: 5000 });
                            msg.delete({ timeout: 5000 });
                        }
                    });
            }
            if (message.author.id === toBan.id)
            {
                return message.channel.send('You can\'t ban yourself.')
                    .then(msg =>
                    {
                        if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                        {
                            message.delete({ timeout: 5000 });
                            msg.delete({ timeout: 5000 });
                        }
                    });
            }
            else if (!toBan.kickable)
            {
                return message.channel.send(`I can't ban ${toBan}`)
                    .then(msg =>
                    {
                        if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                        {
                            message.delete({ timeout: 5000 });
                            msg.delete({ timeout: 5000 });
                        }
                    });
            }

            if (args.length === 1)
            {
                toBan.ban()
                    .then(t =>
                    {
                        message.channel.send(`Succesfully banned ${toBan}.`)
                            .then(msg =>
                            {
                                if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                                {
                                    message.delete({ timeout: 5000 });
                                    msg.delete({ timeout: 5000 });
                                }
                            });
                    })
                    .catch(e =>
                    {
                        message.channel.send(`Failed to ban ${toBan}. Because ${e}`)
                            .then(msg =>
                            {
                                if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                                {
                                    message.delete({ timeout: 5000 });
                                    msg.delete({ timeout: 5000 });
                                }
                            });
                    });
            }
            else if (args.length > 1)
            {
                args.shift();
                const reason = args.join(' ');
                toBan.ban({ reason: reason })
                    .then(t =>
                    {
                        message.channel.send(`Succesfully banned ${toBan} with reason \`${reason}\`.`)
                            .then(msg =>
                            {
                                if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                                {
                                    message.delete({ timeout: 5000 });
                                    msg.delete({ timeout: 5000 });
                                }
                            });
                    })
                    .catch(e =>
                    {
                        message.channel.send(`Failed to ban ${toBan}. Because ${e}`)
                            .then(msg =>
                            {
                                if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                                {
                                    message.delete({ timeout: 5000 });
                                    msg.delete({ timeout: 5000 });
                                }
                            });
                    });
            }
        }
    },
};