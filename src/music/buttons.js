import * as actions from './actions.js';
import { checkMusicAccess } from './guards.js';
import { controlsRow, nowPlayingEmbed } from './ui.js';

export async function handleMusicButton(interaction)
{
    const access = await checkMusicAccess(interaction);
    if (!access) return;
    const { queue } = access;

    // Buttons on an old status message shouldn't control the current track
    if (!queue.statusMessage || interaction.message.id !== queue.statusMessage.id || !queue.current)
    {
        await interaction.update({ components: [] });
        return;
    }

    const action = interaction.customId.slice('music:'.length);
    switch (action)
    {
    case 'toggle':
    case 'loop':
    {
        // Silent actions: the now playing message itself shows the new state
        if (action === 'toggle')
        {
            actions.togglePause(queue, interaction.user);
        }
        else
        {
            actions.setLoop(queue, interaction.user);
        }
        await interaction.update({ embeds: [nowPlayingEmbed(queue)], components: [controlsRow(queue)] });
        break;
    }
    case 'skip':
        await actions.announce(interaction, queue, actions.skip(queue, interaction.user));
        break;
    case 'shuffle':
        await actions.announce(interaction, queue, actions.shuffle(queue, interaction.user));
        break;
    case 'stop':
        await actions.announce(interaction, queue, actions.stop(queue, interaction.user));
        break;
    }
}
