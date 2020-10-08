module.exports =
{
    name: 'kick',
    alias: ['yeet', 'fuckoff'],
    description: 'Kicks a user from the server. A reason is optional.',
    usage: '[user] [reason]',
    cooldown: 5,
    execute(bot, message, args)
    {
        if (message.member.hasPermission('KICK_MEMBERS'))
        {
            const toKick = message.mentions.members.first();
            if (message.author.id === toKick.id)
            {
                return message.channel.send('You can\'t kick yourself.')
                    .then(msg =>
                    {
                        message.delete({ timeout: 5000 });
                        msg.delete({ timeout: 5000 });
                    });
            }

            if (args.length === 1)
            {
                toKick.kick();
                message.channel.send(`Succesfully kicked ${toKick}`)
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
                toKick.kick({ reason: reason });
                message.channel.send(`Succesfully kicked ${toKick} with reason \`${reason}\``)
                    .then(msg =>
                    {
                        message.delete({ timeout: 5000 });
                        msg.delete({ timeout: 5000 });
                    });
            }
        }
    },
};