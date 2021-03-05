const Discord = require('discord.js');
const fs = require('fs');
const mysql = require('mysql2');
const axios = require('axios');
const { token, defaultPrefix, defaultModPrefix, dbhost, dbuser, dbpassword, db } = require('./config.json');

const bot = new Discord.Client();
bot.commands = new Discord.Collection();
bot.modCommands = new Discord.Collection();
bot.prefixes = new Discord.Collection();
bot.modPrefixes = new Discord.Collection();
const cooldowns = new Discord.Collection();
const modCooldowns = new Discord.Collection();

bot.queue = new Discord.Collection();

let now = new Date();

const db_config =
{
    host     : dbhost,
    user     : dbuser,
    password : dbpassword,
    database : db,
    enableKeepAlive: true,
    // debug    : true,
};
let connection;

function handleDisconnect()
{
    // Recreate the connection, since the old one cannot be reused.
    connection = mysql.createConnection(db_config);

    // The server is either down or restarting (takes a while sometimes).
    connection.connect(function(err)
    {
        if(err)
        {
            now = new Date();
            console.error(now.toUTCString(), ': Error when connecting to db:', err);
            // We introduce a delay before attempting to reconnect, to avoid a hot loop, and to allow our node script to process asynchronous requests in the meantime.
            setTimeout(handleDisconnect, 2000);
        }
    });

    connection.on('error', function(err)
    {
        now = new Date();
        console.error(now.toUTCString(), ': db error', err);
        // Connection to the MySQL server is usually lost due to either server restart, or a connnection idle timeout (the wait_timeout server variable configures this)
        if (err.code === 'PROTOCOL_CONNECTION_LOST')
            handleDisconnect();
        else
            throw err;
    });
}
handleDisconnect();


// Default (everyone) commands
fs.readdir('./commands/', (err, files) =>
{
    if (err)
    {
        now = new Date();
        console.log(now.toUTCString(), ':', err);
    }
    now = new Date();
    console.log(now.toUTCString(), ': Loading default commands.');

    const jsfile = files.filter(f => f.split('.').pop() === 'js');

    if (jsfile.length <= 0)
    {
        now = new Date();
        console.log(now.toUTCString(), ': Couldn\'t find commands.');
        return;
    }

    jsfile.forEach((f, i) =>
    {
        const props = require(`./commands/${f}`);
        now = new Date();
        console.log(now.toUTCString(), `: ${f} loaded!`);
        bot.commands.set(props.name, props);
    });
});

// Moderation commands
fs.readdir('./modCommands/', (err, files) =>
{
    if (err)
    {
        now = new Date();
        return console.error(now.toUTCString(), ':', err);
    }
    now = new Date();
    console.log(now.toUTCString(), ': Loading moderation commands.');

    const jsfile = files.filter(f => f.split('.').pop() === 'js');

    if (jsfile.length <= 0)
    {
        now = new Date();
        console.log(now.toUTCString(), ': Couldn\'t find modCommands.');
        return;
    }

    jsfile.forEach((f, i) =>
    {
        const props = require(`./modCommands/${f}`);
        now = new Date();
        console.log(now.toUTCString(), `: ${f} loaded!`);
        bot.modCommands.set(props.name, props);
    });
});

function updateSites()
{
    const guilds = bot.guilds.cache.size;
    // const guilds = 60;

    const topgg = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijc2MTI2MjIxMDIwNjUzMTY0NSIsImJvdCI6dHJ1ZSwiaWF0IjoxNjA4NjYzOTA3fQ._g8aJuV_XCfbkFZoGai4AJMMgD3Zo_b2tZg6LJGXduw';
    axios.post('https://top.gg/api/bots/761262210206531645/stats',
        {
            server_count: guilds,
        },
        {
            headers:
            {
                'Authorization': `${topgg}`,
            },
        });

    const discordbotsgg = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOnRydWUsImlkIjoiMjcwODcxOTIxMTM3MDI1MDI0IiwiaWF0IjoxNjA4ODMwMDE5fQ.b_284EFyxa6P2hBoRXSn9Zl1OZyxB-5uu6ijIu_e5Kk';
    axios.post('https://discord.bots.gg/api/v1/bots/761262210206531645/stats',
        {
            guildCount: guilds,
        },
        {
            headers:
            {
                'Authorization': `${discordbotsgg}`,
            },
        });

    const discordbotstoken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0IjoxLCJpZCI6Ijc2MTI2MjIxMDIwNjUzMTY0NSIsImlhdCI6MTYwODgyOTczOX0.edtFODPjA8qBJpCoDSQSTitJzVwDhizWi_OGjEylV5c';
    axios.post('https://discordbotlist.com/api/v1/bots/761262210206531645/stats',
        {
            guilds: `${guilds}`,
        },
        {
            headers:
            {
                'Authorization': `${discordbotstoken}`,
            },
        });
}

bot.on('guildMemberAdd', function()
{
    // bot.user.setPresence({
    //     status: 'online',
    //     activity: {
    //         name: `over ${bot.guilds.cache.size} servers and ${bot.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} users`,
    //         // PLAYING: WATCHING: LISTENING: STREAMING:
    //         type: 'WATCHING',
    //     },
    // });
    console.log(`WATCHING over ${bot.guilds.cache.size} servers and ${bot.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} users`);
});
bot.on('guildMemberRemove', function()
{
    // bot.user.setPresence({
    //     status: 'online',
    //     activity: {
    //         name: `over ${bot.guilds.cache.size} servers and ${bot.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} users`,
    //         // PLAYING: WATCHING: LISTENING: STREAMING:
    //         type: 'WATCHING',
    //     },
    // });
    console.log(`WATCHING over ${bot.guilds.cache.size} servers and ${bot.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} users`);
});

bot.on('guildCreate', async guild =>
{
    updateSites();

    now = new Date();
    console.log(now.toUTCString(), `: New server joined! (${guild})`);
    bot.user.setPresence({
        status: 'online',
        activity: {
            name: `over ${bot.guilds.cache.size} servers and ${bot.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} users`,
            // PLAYING: WATCHING: LISTENING: STREAMING:
            type: 'WATCHING',
        },
    });

    connection.query(`SELECT Guild FROM guildsettings WHERE Guild = '${guild.id}';`,
        function(error, results, fields)
        {
            if (error)
            {
                now = new Date();
                return console.error(now.toUTCString(), ': line: 111. file: index.js =>\n', error);
            }

            // TODO change to use INSERT ON EXIST
            if (results.length < 1 || results == undefined)
            {
                connection.query(`INSERT INTO guildsettings (Guild, Prefix, ModPrefix) VALUES ('${guild.id}', '${defaultPrefix}', '${defaultModPrefix}');`,
                    function(error2, results2)
                    {
                        if (error2)
                        {
                            now = new Date();
                            return console.error(now.toUTCString(), ':', error2);
                        }
                    });
            }
            else
            {
                connection.query(`UPDATE guildsettings SET Prefix = '${defaultPrefix}', ModPrefix = '${defaultModPrefix}' WHERE Guild = '${guild.id}';`,
                    function(error3, results3)
                    {
                        if (error3)
                        {
                            now = new Date();
                            return console.error(now.toUTCString(), ':', error3);
                        }
                    });
            }
        });
    bot.prefixes.set(guild.id, defaultPrefix);
    bot.modPrefixes.set(guild.id, defaultModPrefix);
});

bot.on('guildDelete', async guild =>
{
    updateSites();

    now = new Date();
    console.log(now.toUTCString(), `: Left a server! (${guild})`);
    bot.user.setPresence({
        status: 'online',
        activity: {
            name: `over ${bot.guilds.cache.size} servers and ${bot.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} users`,
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
    const prefixRegex = new RegExp(`^(<@!?${bot.user.id}>|${escapeRegex(bot.prefixes.get(message.guild.id))}|${escapeRegex(bot.modPrefixes.get(message.guild.id))})\\s*`);

    if (!prefixRegex.test(message.content.toLowerCase()))
        return;

    const [, matchedPrefix] = message.content.toLowerCase().match(prefixRegex);
    const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Moderation  commands
    if (message.content.toLowerCase().startsWith(bot.modPrefixes.get(message.guild.id)))
    {
        const command = bot.modCommands.get(commandName)
            || bot.modCommands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command)
            return;

        if (!modCooldowns.has(command.name))
            modCooldowns.set(command.name, new Discord.Collection());

        now = Date.now();
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
            now = new Date();
            console.error(now.toUTCString(), ':', e);
            message.reply('there was an error trying to execute that command!');
        }
    }
    // Default (everyone) commands
    else
    {
        const command = bot.commands.get(commandName)
            || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command)
            return;

        if (!cooldowns.has(command.name))
            cooldowns.set(command.name, new Discord.Collection());

        now = Date.now();
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
            now = new Date();
            console.error(now.toUTCString(), ':', e);
            message.reply('there was an error trying to execute that command!');
        }
    }
});

bot.on('voiceStateUpdate', (oldState, newState) =>
{
    // Update on the bots voiceState?
    if (oldState.id === bot.user.id)
    {
        // Bot joined a channel
        if (oldState.channelID === null && newState.channelID !== null)
        {
            now = new Date();
            console.log(now.toUTCString(), 'Joining voice channel in server:', oldState.guild.name);
        }
        // Bot moved to another channel
        else if (oldState.channelID !== null && newState.channelID !== null && newState.channelID !== oldState.channelID)
        {
            now = new Date();
            console.log(now.toUTCString(), 'Moved from a voice channel in server:', oldState.guild.name);
        }
        // Bot leaving/kicked from a channel
        else if (oldState.channelID !== null && newState.channelID === null)
        {
            now = new Date();
            console.log(now.toUTCString(), 'Leaving/kicked form a voice channel in server:', oldState.guild.name);
            bot.queue.delete(newState.guild.id);
        }
    }
});

bot.once('ready', () =>
{
    updateSites();

    connection.query('SELECT Guild, Prefix, ModPrefix FROM guildsettings;',
        function(error, results)
        {
            if (error)
            {
                now = new Date();
                return console.error(now.toUTCString(), ':', error);
            }

            results.forEach(function(r)
            {
                bot.prefixes.set(r.Guild, r.Prefix);
                bot.modPrefixes.set(r.Guild, r.ModPrefix);
            });
        });

    now = new Date();
    console.log(now.toUTCString(), ': Ready!');
    bot.user.setPresence({
        status: 'online',
        activity: {
            name: `over ${bot.guilds.cache.size} servers and ${bot.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} users`,
            // PLAYING: WATCHING: LISTENING: STREAMING:
            type: 'WATCHING',
        },
    });
});

bot.login(token);
