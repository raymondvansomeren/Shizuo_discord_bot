import {
    AudioPlayerStatus,
    NoSubscriberBehavior,
    VoiceConnectionStatus,
    createAudioPlayer,
    entersState,
    joinVoiceChannel,
} from '@discordjs/voice';

import { config } from '../config.js';
import { logger } from '../logger.js';
import { errorEmbed, infoEmbed, trackLink } from '../utils/embeds.js';
import { discordTimestamp } from '../utils/format.js';
import { controlsRow, nowPlayingEmbed } from './ui.js';
import { createTrackResource } from './ytdlp.js';

export const LoopMode = Object.freeze({ Off: 'off', Track: 'track', Queue: 'queue' });

// Start loading the next track this long before the current one ends, so there's no gap between tracks
const PREFETCH_BEFORE_END = 20_000;
// A prefetched stream that waited longer than this (e.g. the music was paused) is reloaded instead
const PREFETCH_MAX_AGE = 90_000;

export class GuildQueue
{
    /** @type {object[]} tracks waiting to be played */
    tracks = [];
    /** @type {object | null} */
    current = null;
    loop = LoopMode.Off;
    destroyed = false;
    nowPlayingMessage = null;

    #starting = false;
    #skipping = false;
    #failed = false;
    #idleTimer = null;
    /** @type {Promise<import('discord.js').Message | null> | null} */
    #idleMessage = null;
    #aloneTimer = null;
    /** @type {{ track: object, resource: Promise<import('@discordjs/voice').AudioResource>, createdAt: number } | null} */
    #prefetch = null;
    #prefetchTimer = null;

    /**
     * @param {import('discord.js').VoiceBasedChannel} voiceChannel
     * @param {import('discord.js').GuildTextBasedChannel} textChannel
     */
    constructor(voiceChannel, textChannel)
    {
        this.client = voiceChannel.client;
        this.guild = voiceChannel.guild;
        this.textChannel = textChannel;

        this.player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });
        this.player.on('stateChange', (oldState, newState) =>
        {
            if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle)
            {
                this.#onTrackEnd();
            }
        });
        this.player.on('error', error =>
        {
            this.#failed = true;
            const track = error.resource.metadata;
            logger.warn(`Playback error in ${this.guild.name} for "${track?.title}": ${error.message}`);
            this.#send({ embeds: [errorEmbed(this.client, `Something went wrong while playing ${track ? trackLink(track) : 'this track'}, skipping it.`)] });
        });

        this.connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: this.guild.id,
            adapterCreator: this.guild.voiceAdapterCreator,
            selfDeaf: true,
        });
        this.connection.subscribe(this.player);
        this.connection.on('stateChange', (oldState, newState) =>
        {
            logger.debug(`[${this.guild.name}] voice connection ${oldState.status} -> ${newState.status}`);
        });
        this.connection.on(VoiceConnectionStatus.Disconnected, async () =>
        {
            try
            {
                // Moved to another channel or a brief network hiccup: it will reconnect by itself
                await Promise.race([
                    entersState(this.connection, VoiceConnectionStatus.Signalling, 5_000),
                    entersState(this.connection, VoiceConnectionStatus.Connecting, 5_000),
                ]);
            }
            catch
            {
                // Really disconnected (kicked, channel deleted, ...)
                this.destroy();
            }
        });
        this.connection.on(VoiceConnectionStatus.Destroyed, () => this.destroy());
        this.connection.on('error', error => logger.warn(`[${this.guild.name}] voice connection error: ${error.message}`));
    }

    get voiceChannelId()
    {
        return this.guild.members.me?.voice.channelId ?? this.connection.joinConfig.channelId;
    }

    get paused()
    {
        return this.player.state.status === AudioPlayerStatus.Paused
            || this.player.state.status === AudioPlayerStatus.AutoPaused;
    }

    /** Seconds played of the current track. */
    get elapsed()
    {
        const resource = this.player.state.resource;
        return resource ? resource.playbackDuration / 1000 : 0;
    }

    /** Waits until the voice connection is ready, destroying the queue if that fails. */
    async connect()
    {
        try
        {
            await entersState(this.connection, VoiceConnectionStatus.Ready, 20_000);
        }
        catch (error)
        {
            this.destroy();
            throw error;
        }
    }

    /**
     * Adds tracks to the queue and starts playing when idle.
     * @returns {number} position in the queue of the first added track (0 = playing now)
     */
    add(tracks, { next = false } = {})
    {
        if (next)
        {
            this.tracks.unshift(...tracks);
        }
        else
        {
            this.tracks.push(...tracks);
        }

        this.#clearIdleTimer();
        if (!this.current && !this.#starting)
        {
            void this.#playNext();
            return 0;
        }
        return next ? 1 : this.tracks.length - tracks.length + 1;
    }

    skip()
    {
        this.#skipping = true;
        this.player.stop(true);
    }

    pause()
    {
        return this.player.pause();
    }

    resume()
    {
        return this.player.unpause();
    }

    shuffle()
    {
        for (let i = this.tracks.length - 1; i > 0; i--)
        {
            const j = Math.floor(Math.random() * (i + 1));
            [this.tracks[i], this.tracks[j]] = [this.tracks[j], this.tracks[i]];
        }
    }

    stop()
    {
        this.tracks = [];
        this.loop = LoopMode.Off;
        this.destroy();
    }

    /** Called by voiceStateUpdate: leave after a while when nobody is listening. */
    setAlone(alone)
    {
        if (alone && !this.#aloneTimer)
        {
            this.#aloneTimer = setTimeout(() =>
            {
                this.#send({ embeds: [infoEmbed(this.client, 'Everyone left the voice channel, so I left too 👋')] });
                this.destroy();
            }, config.music.aloneTimeout);
        }
        else if (!alone && this.#aloneTimer)
        {
            clearTimeout(this.#aloneTimer);
            this.#aloneTimer = null;
        }
    }

    destroy()
    {
        if (this.destroyed) return;
        this.destroyed = true;

        this.#clearIdleTimer();
        clearTimeout(this.#aloneTimer);
        clearTimeout(this.#prefetchTimer);
        this.#discardPrefetch();
        this.tracks = [];
        this.current = null;
        this.player.stop(true);
        if (this.connection.state.status !== VoiceConnectionStatus.Destroyed)
        {
            this.connection.destroy();
        }
        if (this.client.queues.get(this.guild.id) === this)
        {
            this.client.queues.delete(this.guild.id);
        }
        this.#clearNowPlayingControls();
        logger.info(`Left voice in ${this.guild.name}`);
    }

    /** Re-renders the now playing message, e.g. after pause/loop changes. */
    async refreshNowPlaying()
    {
        if (!this.nowPlayingMessage || !this.current) return;
        await this.nowPlayingMessage.edit({
            embeds: [nowPlayingEmbed(this)],
            components: [controlsRow(this)],
        }).catch(() => undefined);
    }

    #onTrackEnd()
    {
        const finished = this.current;
        this.current = null;

        if (finished && !this.#failed)
        {
            if (this.loop === LoopMode.Track && !this.#skipping)
            {
                this.tracks.unshift(finished);
            }
            else if (this.loop === LoopMode.Queue)
            {
                this.tracks.push(finished);
            }
        }
        this.#skipping = false;
        this.#failed = false;

        if (!this.destroyed) void this.#playNext();
    }

    async #playNext()
    {
        if (this.#starting || this.destroyed) return;
        this.#starting = true;

        try
        {
            while (!this.destroyed)
            {
                const track = this.tracks.shift();
                if (!track)
                {
                    this.#startIdleTimer();
                    return;
                }

                try
                {
                    const resource = await this.#takeResource(track);
                    if (this.destroyed)
                    {
                        resource.playStream.destroy();
                        return;
                    }
                    this.current = track;
                    this.player.play(resource);
                    this.#schedulePrefetch(track);
                    logger.info(`[${this.guild.name}] Now playing "${track.title}"`);
                    await this.#sendNowPlaying();
                    return;
                }
                catch (error)
                {
                    logger.warn(`[${this.guild.name}] Could not play "${track.title}": ${error.message}`);
                    await this.#send({ embeds: [errorEmbed(this.client, `Couldn't play ${trackLink(track)}: ${error.message}`)] });
                }
            }
        }
        finally
        {
            this.#starting = false;
        }
    }

    #schedulePrefetch(track)
    {
        clearTimeout(this.#prefetchTimer);
        if (!track.duration) return;
        const delay = Math.max(0, track.duration * 1000 - PREFETCH_BEFORE_END);
        this.#prefetchTimer = setTimeout(() => this.#startPrefetch(), delay);
    }

    #startPrefetch()
    {
        const next = this.loop === LoopMode.Track ? this.current : this.tracks[0];
        if (!next || this.destroyed || this.#prefetch?.track === next) return;

        this.#discardPrefetch();
        const resource = createTrackResource(next);
        resource.catch(() => undefined);
        this.#prefetch = { track: next, resource, createdAt: Date.now() };
        logger.debug(`[${this.guild.name}] Prefetching "${next.title}"`);
    }

    /** Uses the prefetched stream when it belongs to this track, otherwise starts a new one. */
    #takeResource(track)
    {
        const prefetch = this.#prefetch;
        if (prefetch?.track === track && Date.now() - prefetch.createdAt < PREFETCH_MAX_AGE)
        {
            this.#prefetch = null;
            return prefetch.resource;
        }
        this.#discardPrefetch();
        return createTrackResource(track);
    }

    #discardPrefetch()
    {
        const prefetch = this.#prefetch;
        this.#prefetch = null;
        prefetch?.resource.then(resource => resource.playStream.destroy(), () => undefined);
    }

    async #sendNowPlaying()
    {
        this.#clearNowPlayingControls(true);
        this.nowPlayingMessage = await this.#send({
            embeds: [nowPlayingEmbed(this)],
            components: [controlsRow(this)],
        });
    }

    /** Removes the buttons from (or deletes) the previous now playing message. */
    #clearNowPlayingControls(deleteMessage = false)
    {
        const message = this.nowPlayingMessage;
        this.nowPlayingMessage = null;
        if (!message) return;
        const action = deleteMessage ? message.delete() : message.edit({ components: [] });
        action.catch(() => undefined);
    }

    #startIdleTimer()
    {
        this.#clearIdleTimer();
        this.#clearNowPlayingControls(true);
        const leaveAt = new Date(Date.now() + config.music.idleTimeout);
        this.#idleMessage = this.#send({ embeds: [
            infoEmbed(this.client, `The queue is empty. I'll leave the voice channel ${discordTimestamp(leaveAt)} unless something is added with \`/play\`.`),
        ] });
        this.#idleTimer = setTimeout(() => this.destroy(), config.music.idleTimeout);
    }

    #clearIdleTimer()
    {
        clearTimeout(this.#idleTimer);
        this.#idleTimer = null;
        const idleMessage = this.#idleMessage;
        this.#idleMessage = null;
        idleMessage?.then(message => message?.delete().catch(() => undefined));
    }

    async #send(payload)
    {
        try
        {
            return await this.textChannel.send(payload);
        }
        catch (error)
        {
            logger.debug(`[${this.guild.name}] Could not send message: ${error.message}`);
            return null;
        }
    }
}
