const Discord = require('discord.js');
const fs = require('fs');
const mysql = require('mysql2');
// const axios = require('axios');
const { token, dbhost, dbuser, dbpassword, db } = require('./config.json');
// const { token, defaultPrefix, defaultModPrefix, dbhost, dbuser, dbpassword, db } = require('./config.json');

const client = new Discord.Client();
client.commands = new Discord.Collection();
client.modCommands = new Discord.Collection();
client.prefixes = new Discord.Collection();
client.modPrefixes = new Discord.Collection();
client.cooldowns = new Discord.Collection();
client.modCooldowns = new Discord.Collection();

client.queue = new Discord.Collection();

const db_config =
{
    host     : dbhost,
    user     : dbuser,
    password : dbpassword,
    database : db,
    enableKeepAlive: true,
    // debug    : true,
};

// bot.connection = new Discord.Collection();
client.connection = new Discord.Collection();

const log = require('./modules/log').log;
const error = require('./modules/log').error;

function handleDisconnect()
{
    // Recreate the connection, since the old one cannot be reused.
    client.connection.set('db', mysql.createConnection(db_config));

    // The server is either down or restarting (takes a while sometimes).
    client.connection.get('db').connect(function(err)
    {
        if(err)
        {
            error('Error when connecting to db:', err);
            // We introduce a delay before attempting to reconnect, to avoid a hot loop, and to allow our node script to process asynchronous requests in the meantime.
            setTimeout(handleDisconnect, 1000);
        }
    });

    client.connection.get('db').on('error', function(err)
    {
        error('db error', err);
        // Connection to the MySQL server is usually lost due to either server restart, or a connnection idle timeout (the wait_timeout server variable configures this)
        if (err.code === 'PROTOCOL_CONNECTION_LOST')
        {
            handleDisconnect();
        }
        else
        {
            throw err;
        }
    });
}
handleDisconnect();

// Default (everyone) commands (start at 1 second)
setTimeout(() =>
{
    fs.readdir('./commands/', (err, files) =>
    {
        if (err)
        {
            log(err);
        }
        log('Loading default commands.');

        const jsfile = files.filter(f => f.split('.').pop() === 'js');

        if (jsfile.length <= 0)
        {
            log('Couldn\'t find commands.');
            return;
        }

        jsfile.forEach((f, i) =>
        {
            const props = require(`./commands/${f}`);
            log(`command ${f} loaded!`);
            client.commands.set(props.name, props);
        });
    });
}, 1000);

// Moderation commands (start at 2 seconds)
setTimeout(() =>
{
    fs.readdir('./modCommands/', (err, files) =>
    {
        if (err)
        {
            return error(err);
        }
        log('Loading moderation commands.');

        const jsfile = files.filter(f => f.split('.').pop() === 'js');

        if (jsfile.length <= 0)
        {
            log('Couldn\'t find modCommands.');
            return;
        }

        jsfile.forEach((f, i) =>
        {
            const props = require(`./modCommands/${f}`);
            log(`modCommand ${f} loaded!`);
            client.modCommands.set(props.name, props);
        });
    });
}, 2000);

// Event handling (start at 4 seconds)
// TODO add handling for when 2 seconds ain't enough
setTimeout(() =>
{
    log('Loading events.');
    const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
    for (const file of eventFiles)
    {
        const event = require(`./events/${file}`);
        log(`event ${event.name} loaded!`);
        if (event.once)
        {
            client.once(event.name, (...args) =>
            {
                event.execute(...args, client);
            });
        }
        else
        {
            client.on(event.name, (...args) =>
            {
                event.execute(...args, client);
            });
        }
    }
}, 4000);

// Login after 6 seconds
setTimeout(() =>
{
    client.login(token);
}, 6000);

// Print every hour the current uptime (in hours)
let times = 0;
setInterval(() =>
{
    times++;
    log(`Uptime in hours: ${times}`);
}, 3600000);

// process.on('uncaughtException', function(err)
// {
//     error('Caught exception: ' + err);
// });