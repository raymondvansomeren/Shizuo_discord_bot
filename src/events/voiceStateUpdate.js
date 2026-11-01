import { Events } from 'discord.js';

export default {
    name: Events.VoiceStateUpdate,
    execute(oldState, newState)
    {
        const queue = newState.client.queues.get(newState.guild.id);
        if (!queue) return;

        // Someone joined/left: leave after a while when no humans are listening anymore
        const channel = newState.guild.members.me?.voice.channel;
        if (!channel) return;
        const listeners = channel.members.filter(member => !member.user.bot).size;
        queue.setAlone(listeners === 0);
    },
};
