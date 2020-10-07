const Discord = require('discord.js');

module.exports =
{
    name: 'botinfo',
    description: 'Shows info about this bot.',
    aliases: ['bot', 'info'],
    execute(bot, message, args)
    {
        const bicon = bot.user.displayAvatarURL;
        const botembed = new Discord.MessageEmbed()
            .setTitle('Bot Information')
            .setColor('#FFDF2A')
            .setThumbnail(bicon)
            .addField('Bot Name', bot.user.username)
            .addField('Created On', bot.user.createdAt)
            .setFooter('Bot created by raymond570#2966', 'https://cdn.discordapp.com/avatars/270871921137025024/a_fd2fefc0474534a4e2ff908af79be9d1.gif');

        // message.delete().catch(e=>{
        //     console.log('Error: ' + e);
        // });
        message.channel.send(botembed);
    },
};