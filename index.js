const Discord = require('discord.js');
const fs = require('fs');
const mysql = require('mysql2');
const { token, defaultPrefix, defaultModPrefix, dbhost, dbuser, dbpassword, db } = require('./config.json');

// const connection = mysql.createConnection({
const pool = mysql.createPool({
    host     : dbhost,
    user     : dbuser,
    password : dbpassword,
    database : db,
});

const bot = new Discord.Client();
bot.commands = new Discord.Collection();
bot.modCommands = new Discord.Collection();
bot.prefixes = new Map();
const cooldowns = new Discord.Collection();
const modCooldowns = new Discord.Collection();

bot.queue = new Discord.Collection();

// Default (everyone) commands
fs.readdir('./commands/', (err, files) =>
{
    if (err)
        console.log(err);
    console.log('Loading default commands.');

    const jsfile = files.filter(f => f.split('.').pop() === 'js');

    if (jsfile.length <= 0)
    {
        console.log('Couldn\'t find commands.');
        return;
    }

    jsfile.forEach((f, i) =>
    {
        const props = require(`./commands/${f}`);
        console.log(`${f} loaded!`);
        bot.commands.set(props.name, props);
    });
});

// Moderation commands
fs.readdir('./modCommands/', (err, files) =>
{
    if (err)
        console.log(err);
    console.log('Loading moderation commands.');

    const jsfile = files.filter(f => f.split('.').pop() === 'js');

    if (jsfile.length <= 0)
    {
        console.log('Couldn\'t find modCommands.');
        return;
    }

    jsfile.forEach((f, i) =>
    {
        const props = require(`./modCommands/${f}`);
        console.log(`${f} loaded!`);
        bot.modCommands.set(props.name, props);
    });
});

bot.on('guildCreate', async guild =>
{
    console.log('New server joined!');
    bot.user.setPresence({
        status: 'online',
        activity: {
            name: `over ${bot.guilds.cache.size} servers`,
            // PLAYING: WATCHING: LISTENING: STREAMING:
            type: 'WATCHING',
        },
    });

    // connection.connect();
    // connection.query(`SELECT Guild FROM guildsettings WHERE Guild = '${guild.id}';`,
    //     (error, results) =>
    //     {
    //         if (error)
    //             return console.log(error);

    //         if (results.length < 1 || results == undefined)
    //         {
    //             connection.query(`INSERT INTO guildsettings (Guild, Prefix, ModPrefix) VALUES ('${guild.id}', '${defaultPrefix}', '${defaultModPrefix}');`,
    //                 (error2, results2) =>
    //                 {
    //                     if (error2)
    //                         return console.log(error2);
    //                 });
    //         }
    //         else
    //         {
    //             connection.query(`UPDATE guildsettings SET Prefix = '${defaultPrefix}', ModPrefix = '${defaultModPrefix}' WHERE Guild = '${guild.id}';`,
    //                 (error3, results3) =>
    //                 {
    //                     if (error3)
    //                         return console.log(error3);
    //                 });
    //         }
    //     });
    // connection.end();

    pool.query(`SELECT Guild FROM guildsettings WHERE Guild = '${guild.id}';`,
        function(error, results, fields)
        {
            if (error)
                return console.log('line: 111. file: index.js =>\n', error);

            // TODO change to use INSERT ON EXIST
            if (results.length < 1 || results == undefined)
            {
                pool.query(`INSERT INTO guildsettings (Guild, Prefix, ModPrefix) VALUES ('${guild.id}', '${defaultPrefix}', '${defaultModPrefix}');`,
                    function(error2, results2)
                    {
                        if (error2)
                            return console.log(error2);
                    });
            }
            else
            {
                pool.query(`UPDATE guildsettings SET Prefix = '${defaultPrefix}', ModPrefix = '${defaultModPrefix}' WHERE Guild = '${guild.id}';`,
                    function(error3, results3)
                    {
                        if (error3)
                            return console.log(error3);
                    });
            }
        });
});

bot.on('guildDelete', async guild =>
{
    console.log('Left a server!');
    bot.user.setPresence({
        status: 'online',
        activity: {
            name: `over ${bot.guilds.cache.size} servers`,
            // PLAYING: WATCHING: LISTENING: STREAMING:
            type: 'WATCHING',
        },
    });
});

const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

bot.on('message', async message =>
{
    if (message.author.bot || message.channel.type === 'dm')
        return;

    // connection.connect();
    // TODO change so the prefix gets loaded into bot.prefixes and there no longer will be a need to request the prefix from the database at each message
    // connection.query(`SELECT Prefix, ModPrefix FROM guildsettings WHERE Guild = '${message.guild.id}';`,
    //     (error, results) =>
    pool.query(`SELECT Prefix, ModPrefix FROM guildsettings WHERE Guild = '${message.guild.id}';`,
        function(error, results)
        {
            if (error)
                return console.log(error);

            const prefix = results[0].Prefix;
            const modPrefix = results[0].ModPrefix;

            const prefixRegex = new RegExp(`^(<@!?${bot.user.id}>|${escapeRegex(prefix)}|${escapeRegex(modPrefix)})\\s*`);

            if (!prefixRegex.test(message.content))
                return;

            const [, matchedPrefix] = message.content.match(prefixRegex);
            const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            // Default (everyone) commands
            if (message.content.startsWith(modPrefix))
            {
                const command = bot.modCommands.get(commandName)
                    || bot.modCommands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

                if (!command)
                    return;

                if (!modCooldowns.has(command.name))
                    modCooldowns.set(command.name, new Discord.Collection());

                const now = Date.now();
                const timestamps = modCooldowns.get(command.name);
                const cooldownAmount = (command.cooldown || 3) * 1000;

                if (timestamps.has(message.author.id))
                {
                    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

                    if (now < expirationTime)
                    {
                        const timeLeft = (expirationTime - now) / 1000;
                        return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
                    }
                }
                timestamps.set(message.author.id, now);
                setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

                try
                {
                    command.execute(bot, message, args);
                }
                catch (e)
                {
                    console.error(e);
                    message.reply('there was an error trying to execute that command!');
                }
            }
            else
            {
                const command = bot.commands.get(commandName)
                    || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

                if (!command)
                    return;

                if (!cooldowns.has(command.name))
                    cooldowns.set(command.name, new Discord.Collection());

                const now = Date.now();
                const timestamps = cooldowns.get(command.name);
                const cooldownAmount = (command.cooldown || 3) * 1000;

                if (timestamps.has(message.author.id))
                {
                    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

                    if (now < expirationTime)
                    {
                        const timeLeft = (expirationTime - now) / 1000;
                        return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
                    }
                }
                timestamps.set(message.author.id, now);
                setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

                try
                {
                    command.execute(bot, message, args);
                }
                catch (e)
                {
                    console.error(e);
                    message.reply('there was an error trying to execute that command!');
                }
            }
        });
    // connection.end();
});

// KICKING TJEERD RANDOMLY EVERY 5 MINUTES (CHANCE)
function kickTjeerd()
{
    bot.guilds.fetch('702080138925441068')
        .then(guild =>
        {
            guild.members.fetch('300577196106448898')
                .then(tjeerd =>
                {
                    if (tjeerd.voice.channel !== undefined && tjeerd.voice.channel !== null)
                    {
                        const randomNumber = Math.floor(Math.random() * 100);
                        console.log('Kick Tjeerd?');
                        // console.log(tjeerd.voice.channel);
                        // In 5% of the tests, it should kick
                        if (randomNumber < 5)
                        {
                            console.log('Kicked Tjeerd! ', randomNumber);
                            tjeerd.voice.setChannel(null);
                        }
                        else
                        {
                            console.log('Not kicked Tjeerd! ', randomNumber);
                        }
                    }
                    setTimeout(kickTjeerd, 300000);
                });
        });
}

bot.once('ready', () =>
{
    console.log('Ready!');
    kickTjeerd();
    bot.user.setPresence({
        status: 'online',
        activity: {
            name: `over ${bot.guilds.cache.size} servers`,
            // PLAYING: WATCHING: LISTENING: STREAMING:
            type: 'WATCHING',
        },
    });
});

bot.login(token);