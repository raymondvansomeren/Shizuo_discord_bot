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
            .addField('Server amount', bot.guilds.cache.size)
            .addField('Users', bot.guilds.cache.reduce((a, g) => a + g.memberCount, 0))
            .setFooter('Bot created by raymond570#2966', 'https://cdn.discordapp.com/avatars/270871921137025024/02ef6122a25f41e3bc1c38398e17f26e.png');

        // message.delete().catch(e=>{
        //     console.log('Error: ' + e);
        // });
        message.channel.send(botembed);
    },
};