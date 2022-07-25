const fs = require('fs');

// const { Client, Collection } = require('discord.js');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
// const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
// const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();
client.config = require('./config.json');

const logger = require('log4js').getLogger();
logger.level = client.config.logLevel;

client.logger = logger;

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles)
{
    const command = require(`./commands/${file}`);
    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    client.commands.set(command.name, command);
}

client.on('interactionCreate', async interaction =>
{
    if (interaction.type != 2) return;

    if (!client.commands.has(interaction.commandName)) return;

    try
    {
        await client.commands.get(interaction.commandName).execute(interaction);
    }
    catch (error)
    {
        client.logger.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.once('ready', () =>
{
    require('./deploy-commands.js');
    client.logger.info('Fully started!');
});

client.login(client.config.token);

/**
 * When receiving a SIGUSR1 (htop 10):
 * - Will reload config (DO NOT change bot token whilst running. This will break everything!)
 * - Will unload modules (to be reloaded by the commands)
 * - Will reload commands (will also load the modules again)
 */
process.on('SIGUSR1', () =>
{
    // This is where we will reload all commands!
    client.logger.debug('Reloading commands/config (no reload of token)!');

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

    client.logger.debug('Done reloading commands/config (no reload of token)!');
});