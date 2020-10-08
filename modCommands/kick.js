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
            if (message.author === args[0])
                return message.channel.send('You can\'t kick yourself.');

            if (args.length === 1)
                args[0].kick();
            else if (args.length > 1)
                args[0].kick(args.shift.join(' '));
        }
    },
};