const { logLevel } = require('../config.json');
const logger = require('log4js').getLogger();
logger.level = logLevel;

module.exports = {
    name: 'voiceStateUpdate',
    once: false,
    execute(oldState, newState)
    {
        const client = newState.client;
        // Update on the bots voiceState?
        if (oldState.id === client.user.id)
        {
            // Bot joined a channel
            if (oldState.channelID === null && newState.channelID !== null)
            {
                logger.info('Joining voice channel in server:', oldState.guild.name);
            }
            // Bot moved to another channel
            else if (oldState.channelID !== null && newState.channelID !== null && newState.channelID !== oldState.channelID)
            {
                logger.info('Moved from a voice channel in server:', oldState.guild.name);
            }
            // Bot leaving/kicked from a channel
            else if (oldState.channelID !== null && newState.channelID === null)
            {
                logger.info('Leaving/kicked form a voice channel in server:', oldState.guild.name);
                client.queue.delete(newState.guild.id);
            }
        }
    },
};