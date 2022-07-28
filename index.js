const fs = require('node:fs');
const path = require('node:path');

// const { Client, Collection } = require('discord.js');
const { Client, Collection, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });
client.commands = new Collection();
client.config = require('./config.json');

const logger = require('log4js').getLogger();
logger.level = client.config.logLevel;

client.logger = logger;

client.queue = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles)
{
    const command = require(`./commands/${file}`);
    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    client.commands.set(command.name, command);
}

/**
 * When receiving a SIGUSR1 (htop 10):
 * - Will reload config (DO NOT change bot token whilst running. This will break everything!)
 * - Will unload modules (to be reloaded by the commands)
 * - Will reload commands (will also load the modules again)
 */
process.on('SIGUSR1', () =>
{
    // This is where we will reload all commands!
    client.logger.info('Reloading commands/config (no reload of token)!');

    delete require.cache[require.resolve('./config.json')];
    client.config = require('./config.json');

    const mf = fs.readdirSync('./modules').filter(file => file.endsWith('.js'));
    for (const file of mf)
    {
        delete require.cache[require.resolve(`./modules/${file}`)];
    }

    const cf = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    for (const file of cf)
    {
        delete require.cache[require.resolve(`./commands/${file}`)];
        const command = require(`./commands/${file}`);
        // set a new item in the Collection
        // with the key as the command name and the value as the exported module
        client.commands.set(command.name, command);
    }

    client.logger.info('Done reloading commands/config (no reload of token)!');
});

// Get amount of listening servers
process.on('SIGUSR2', () =>
{
    // Something
    client.logger.info(`Currently ${client.queue.size} queues`);
});

// Event handling (start at 4 seconds)
// TODO add handling for when 2 seconds ain't enough
setTimeout(() =>
{
    client.logger.info('Loading DJS client eventhandlers.');
    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles)
    {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        client.logger.info(`Event ${event.name} loaded!`);
        if (event.once)
        {
            client.once(event.name, (...args) => event.execute(...args));
        }
        else
        {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
}, 1000);

setTimeout(() =>
{
    client.login(client.config.token);
}, 3000);