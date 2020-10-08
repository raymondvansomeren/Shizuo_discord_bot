const Discord = require('discord.js');
const colors = require('../colors.json');

module.exports =
{
    name: 'color',
    description: 'When used without any arguments, this shows all available colors. When used with (an) argument(s), it will try to assign the colored role to you (if that color exists in the bot\'s database).',
    aliases: ['colour'],
    execute(bot, message, args)
    {
        if (args.length === 0)
        {
            const botembed = new Discord.MessageEmbed()
                .setTitle('Available colors')
                .setColor('#FFDE2C')
                .setFooter('Bot created by raymond570#2966', 'https://cdn.discordapp.com/avatars/270871921137025024/a_fd2fefc0474534a4e2ff908af79be9d1.gif');

            for (const i in colors)
            {
                if (colors[i].color.toLowerCase() !== 'none')
                    botembed.addField(colors[i].color, `#${colors[i].value}`);
                else
                    botembed.addField(colors[i].color, colors[i].value);
            }

            message.channel.send(botembed);
        }
        else
        {
            let chosenColor = '';
            for (const c in colors)
            {
                if (c.color.toLowerCase() === args[0].toLowerCase())
                {
                    chosenColor = c.value;
                    break;
                }
            }
            if (chosenColor === '')
            {
                console.log('Not a valid color chosen.');
                return;
            }
        }
    },
};