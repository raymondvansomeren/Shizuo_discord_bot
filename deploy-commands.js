const fs = require('fs');

const config = require('./config.json');

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');

const rest = new REST({ version: '10' }).setToken(config.token);

const logger = require('log4js').getLogger();
logger.level = config.logLevel;

let commands = [];

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles)
{
    const command = require(`./commands/${file}`);
    commands.push(command.getCommand());
}

commands = commands.map(command => command.toJSON());

if (config.inDevelopment)
{
    rest.put(Routes.applicationGuildCommands(config.clientId, config.devServer), { body: commands })
        .then(() => logger.info('Successfully registered application commands (dev).'))
        .catch((err) => logger.error(err));
}
else
{
    rest.put(Routes.applicationCommands(config.clientId, config.devServer), { body: commands })
        .then(() => logger.info('Successfully registered application commands (full).'))
        .catch((err) => logger.error(err));
}