module.exports =
{
    name: 'kickVoice',
    description: 'Kick a user from a voice channel. Reason is optional.',
    aliases: ['kv'],
    usage: '[mention] [reason]',
    cooldown: 3,
    execute(bot, message, args)
    {
        // message.mentions.members.first().voice.kick();
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
                toKick.voice.kick();
                message.channel.send(`Succesfully kicked ${toKick} from the voice channel.`)
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
                toKick.voice.kick(reason);
                message.channel.send(`Succesfully kicked ${toKick} from the voice channel with reason \`${reason}\`.`)
                    .then(msg =>
                    {
                        message.delete({ timeout: 5000 });
                        msg.delete({ timeout: 5000 });
                    });
            }
        }
    },
};