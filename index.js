const Discord = require('discord.js');
const fs = require('fs');
const mysql = require('mysql2');
const { token, defaultPrefix, defaultModPrefix, dbhost, dbuser, dbpassword, db } = require('./config.json');

// const connection = mysql.createConnection({
const connection = mysql.createConnection({
    host     : dbhost,
    user     : dbuser,
    password : dbpassword,
    database : db,
});

const client = new Discord.Client();
client.commands = new Discord.Collection();
client.modCommands = new Discord.Collection();
client.prefixes = new Map();
const cooldowns = new Discord.Collection();
const modCooldowns = new Discord.Collection();

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
        client.commands.set(props.name, props);
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
        client.modCommands.set(props.name, props);
    });
});

client.on('guildCreate', async guild =>
{
    console.log('New server joined!');
    client.user.setPresence({
        status: 'online',
        activity: {
            name: `over ${client.guilds.cache.size} servers`,
            // PLAYING: WATCHING: LISTENING: STREAMING:
            type: 'WATCHING',
        },
    });

    connection.query(`SELECT Guild FROM guildsettings WHERE Guild = '${guild.id}';`,
        (error, results) =>
        {
            if (error)
                return console.log(error);

            if (results.length < 1 || results == undefined)
            {
                connection.query(`INSERT INTO guildsettings (Guild, Prefix, ModPrefix) VALUES ('${guild.id}', '${defaultPrefix}', '${defaultModPrefix}');`,
                    (error2, results2) =>
                    {
                        if (error2)
                            return console.log(error2);
                    });
            }
            else
            {
                connection.query(`UPDATE guildsettings SET Prefix = '${defaultPrefix}', ModPrefix = '${defaultModPrefix}' WHERE Guild = '${guild.id}';`,
                    (error3, results3) =>
                    {
                        if (error3)
                            return console.log(error3);
                    });
            }
        });
});

client.on('guildDelete', async guild =>
{
    console.log('Left a server!');
    client.user.setPresence({
        status: 'online',
        activity: {
            name: `over ${client.guilds.cache.size} servers`,
            // PLAYING: WATCHING: LISTENING: STREAMING:
            type: 'WATCHING',
        },
    });
});

const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

client.on('message', async message =>
{
    if (message.author.bot || message.channel.type === 'dm')
        return;

    // TODO change so the prefix gets loaded into client.prefixes and there no longer will be a need to request the prefix from the database at each message
    connection.query(`SELECT Prefix, ModPrefix FROM guildsettings WHERE Guild = '${message.guild.id}';`,
        (error, results) =>
        {
            if (error)
                return console.log(error);

            const prefix = results[0].Prefix;
            const modPrefix = results[0].ModPrefix;

            const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)}|${escapeRegex(modPrefix)})\\s*`);

            if (!prefixRegex.test(message.content))
                return;

            const [, matchedPrefix] = message.content.match(prefixRegex);
            const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            // Default (everyone) commands
            if (message.content.startsWith(modPrefix))
            {
                const command = client.modCommands.get(commandName)
                    || client.modCommands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

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
                    command.execute(client, message, args);
                }
                catch (e)
                {
                    console.error(e);
                    message.reply('there was an error trying to execute that command!');
                }
            }
            else
            {
                const command = client.commands.get(commandName)
                    || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

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
                    command.execute(client, message, args);
                }
                catch (e)
                {
                    console.error(e);
                    message.reply('there was an error trying to execute that command!');
                }
            }
        });
});

client.once('ready', () =>
{
    console.log('Ready!');
    client.user.setPresence({
        status: 'online',
        activity: {
            name: `over ${client.guilds.cache.size} servers`,
            // PLAYING: WATCHING: LISTENING: STREAMING:
            type: 'WATCHING',
        },
    });
});

client.login(token);