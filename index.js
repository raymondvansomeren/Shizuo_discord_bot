const Discord = require('discord.js');
const fs = require('fs');
const client = new Discord.Client();
const token = require('./config.json').token;
const prefix = require('./config.json').prefix;
client.commands = new Discord.Collection();

fs.readdir('./commands/', (err, files) =>
{
    if (err)
    {
        console.log(err);
    }

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

client.on('message', async message =>
{
    message.content = message.content.toLowerCase();
    if(message.author.bot || message.channel.type === 'dm' || !message.content.startsWith(prefix))
    {
        return;
    }

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const cmd = args.shift().toLowerCase();

    const commandfile = client.commands.get(cmd);
    if(commandfile)
    {
        commandfile.execute(client, message, args);
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