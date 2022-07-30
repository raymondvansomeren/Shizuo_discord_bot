// const { logLevel } = require('../config.json');
// const logger = require('log4js').getLogger();
// logger.level = logLevel;

module.exports = {
    name: 'voiceStateUpdate',
    once: false,
    execute(oldState, newState)
    {
        const client = newState.client;
        if (client === undefined || client === null
            || oldState.id !== client.user.id) return;

        // Bot joined a channel
        if (oldState.channelId === null && newState.channelId !== null)
        {
            client.logger.info('Joining voice channel in server:', oldState.guild.name);
        }
        // Bot moved to another channel
        else if (oldState.channelId !== null && newState.channelId !== null && newState.channelId !== oldState.channelId)
        {
            client.logger.info('Moved from a voice channel in server:', oldState.guild.name);
        }
        // Bot leaving/kicked from a channel
        else if (oldState.channelId !== null && newState.channelId === null)
        {
            client.logger.info('Leaving/kicked form a voice channel in server:', oldState.guild.name);
            client.queue.delete(newState.guild.id);
        }
    },
};