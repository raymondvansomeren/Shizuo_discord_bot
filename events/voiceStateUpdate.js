const tx2 = require('tx2');

const log = require('../modules/log').log;

const listeningServers = tx2.counter({
    name: 'listening servers',
    id: 'app/realtime/listeners',
});

module.exports = {
    name: 'voiceStateUpdate',
    once: false,
    execute(oldState, newState, client)
    {
        // Update on the bots voiceState?
        if (oldState.id === client.user.id)
        {
            // Bot joined a channel
            if (oldState.channelID === null && newState.channelID !== null)
            {
                log('Joining voice channel in server:', oldState.guild.name);

                listeningServers.inc();
            }
            // Bot moved to another channel
            else if (oldState.channelID !== null && newState.channelID !== null && newState.channelID !== oldState.channelID)
            {
                log('Moved from a voice channel in server:', oldState.guild.name);
            }
            // Bot leaving/kicked from a channel
            else if (oldState.channelID !== null && newState.channelID === null)
            {
                log('Leaving/kicked form a voice channel in server:', oldState.guild.name);
                client.queue.delete(newState.guild.id);

                listeningServers.dec();
            }
        }
    },
};