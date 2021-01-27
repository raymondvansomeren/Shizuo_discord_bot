module.exports =
{
    name: 'kickvoice',
    description: 'Kick a user from a voice channel. Reason is optional.',
    aliases: ['kv', 'disconnect'],
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
        // message.mentions.members.first().voice.kick();
        if (message.member.hasPermission('KICK_MEMBERS'))
        {
            const toKick = message.mentions.members.first();
            if (message.author.id === toKick.id)
            {
                return message.channel.send('You can\'t kick yourself.')
                    .then(msg =>
                    {
                        if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                        {
                            message.delete({ timeout: 5000 });
                            msg.delete({ timeout: 5000 });
                        }
                    });
            }
            else if (message.member.voice.channelID === undefined || message.member.voice.channelID === null)
            {
                return message.channel.send(`${toKick} is not in a voice channel`)
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
                toKick.voice.kick()
                    .then(t =>
                    {
                        message.channel.send(`Succesfully kicked ${toKick} from the voice channel.`)
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
                        message.channel.send(`Failed to kick ${toKick} from the voice channel. Because ${e}`)
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
                toKick.voice.kick({ reason: reason })
                    .then(t =>
                    {
                        message.channel.send(`Succesfully kicked ${toKick} from the voice channel with reason \`${reason}\`.`)
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
                        message.channel.send(`Failed to kick ${toKick}. Because ${e}`)
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