const Discord = require('discord.js');
const fs = require('fs');
const client = new Discord.Client();
const token = require('./config.json').token;
const prefix = require('./config.json').prefix;
client.commands = new Discord.Collection();

fs.readdir('./commands/', (err, files) =>
{
    if (err)
        console.log(err);

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

const cooldowns = new Discord.Collection();

client.on('message', async message =>
{
    message.content = message.content.toLowerCase();
    if(message.author.bot || message.channel.type === 'dm' || !message.content.startsWith(prefix))
        return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

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
    catch (error)
    {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
});

client.once('ready', () =>
{
    console.log('Ready!');
    client.user.setPresence({
        status: 'online',
        activity: {
            name: 'with ' + prefix + 'help',
            // PLAYING: WATCHING: LISTENING: STREAMING:
            type: 'PLAYING',
        },
    });
});

client.login(token);