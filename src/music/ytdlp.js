import { spawn } from 'node:child_process';

import { createAudioResource, demuxProbe } from '@discordjs/voice';
import ffmpegPath from 'ffmpeg-static';
import { constants as youtubeDlConstants } from 'youtube-dl-exec';

import { config } from '../config.js';
import { logger } from '../logger.js';

const binary = config.ytdlp.path ?? youtubeDlConstants.YOUTUBE_DL_PATH;
const METADATA_TIMEOUT = 60_000;
const STREAM_START_TIMEOUT = 30_000;
const UNAVAILABLE_TITLE = /^\[(private|deleted|unavailable) video\]$/i;

export class YtDlpError extends Error
{
    name = 'YtDlpError';
}

function baseArgs()
{
    const args = [
        '--ignore-config',
        '--no-warnings',
        // YouTube requires solving JS challenges; use the Node.js binary we're already running on
        '--js-runtimes', `node:${process.execPath}`,
    ];
    if (ffmpegPath) args.push('--ffmpeg-location', ffmpegPath);
    if (config.ytdlp.cookies) args.push('--cookies', config.ytdlp.cookies);
    return args;
}

/** Turns yt-dlp's stderr into a short, user-presentable message. */
function extractError(stderr, fallback)
{
    const line = stderr.split(/\r?\n/).reverse().find(l => l.startsWith('ERROR:'));
    if (!line) return fallback;
    return line
        .replace(/^ERROR:\s*/, '')
        .replace(/^\[[^\]]+\]\s*[\w-]+:\s*/, '')
        .slice(0, 300);
}

function run(args, timeout = METADATA_TIMEOUT)
{
    return new Promise((resolve, reject) =>
    {
        const proc = spawn(binary, [...baseArgs(), ...args], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
        const stdout = [];
        let stderr = '';
        const timer = setTimeout(() =>
        {
            proc.kill();
            reject(new YtDlpError('Timed out while loading from YouTube'));
        }, timeout);

        proc.stdout.on('data', chunk => stdout.push(chunk));
        proc.stderr.on('data', chunk => stderr = (stderr + chunk).slice(-8000));
        proc.on('error', error =>
        {
            clearTimeout(timer);
            reject(new YtDlpError(`Could not start yt-dlp (${error.message})`));
        });
        proc.on('close', code =>
        {
            clearTimeout(timer);
            if (code === 0)
            {
                resolve(Buffer.concat(stdout).toString('utf8'));
            }
            else
            {
                logger.debug('yt-dlp failed:', stderr.trim());
                reject(new YtDlpError(extractError(stderr, `yt-dlp exited with code ${code}`)));
            }
        });
    });
}

function toTrack(entry)
{
    const url = entry.webpage_url
        ?? (entry.ie_key === 'Youtube' || entry.extractor_key === 'Youtube' ? `https://www.youtube.com/watch?v=${entry.id}` : entry.url);
    const isLive = entry.is_live === true || entry.live_status === 'is_live';
    return {
        id: entry.id,
        title: entry.title ?? 'Unknown title',
        url,
        duration: isLive ? null : entry.duration ?? null,
        isLive,
        author: entry.channel ?? entry.uploader ?? null,
        thumbnail: entry.thumbnail
            ?? entry.thumbnails?.at(-1)?.url
            ?? (entry.id && (entry.ie_key ?? entry.extractor_key) === 'Youtube' ? `https://i.ytimg.com/vi/${entry.id}/hqdefault.jpg` : null),
    };
}

/**
 * Resolves a URL (video, playlist, YouTube Music, or anything else yt-dlp supports) or search terms into tracks.
 * @returns {Promise<{ tracks: object[], playlist: { title: string, url: string } | null }>}
 */
export async function resolve(query)
{
    const input = query.trim();
    const isUrl = /^https?:\/\//i.test(input);
    const target = isUrl ? input : `ytsearch1:${input}`;

    const output = await run([
        '--dump-single-json',
        '--flat-playlist',
        // A watch URL that also has &list=... (or a YouTube Music auto-mix) plays just that video
        '--no-playlist',
        '--playlist-items', `:${config.music.maxPlaylistSize}`,
        '--', target,
    ]);

    const info = JSON.parse(output);
    const isPlaylist = info._type === 'playlist';
    const entries = isPlaylist ? info.entries ?? [] : [info];

    const tracks = entries
        .filter(entry => entry && (entry.url || entry.webpage_url) && !UNAVAILABLE_TITLE.test(entry.title ?? ''))
        .map(toTrack);

    return {
        tracks,
        playlist: isPlaylist && isUrl ? { title: info.title ?? 'Playlist', url: info.webpage_url ?? input } : null,
    };
}

/**
 * Starts streaming the audio of a track and wraps it in an AudioResource.
 * Opus audio (what YouTube serves) is passed through without re-encoding.
 */
export async function createTrackResource(track)
{
    const proc = spawn(binary, [
        ...baseArgs(),
        '--quiet',
        '--no-playlist',
        '--format', 'bestaudio[acodec=opus]/bestaudio/best',
        '--output', '-',
        '--', track.url,
    ], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });

    let stderr = '';
    proc.stderr.on('data', chunk => stderr = (stderr + chunk).slice(-8000));
    // Killing the process while it writes causes EPIPE, which is expected
    proc.stdout.on('error', () => undefined);

    const kill = () =>
    {
        if (proc.exitCode === null && !proc.killed) proc.kill();
    };

    const exited = new Promise(resolveExit =>
    {
        proc.once('error', error => resolveExit({ error }));
        proc.once('close', code => resolveExit({ code }));
    });
    const probing = demuxProbe(proc.stdout);
    probing.catch(() => undefined);
    let timer;
    const timeout = new Promise(resolveTimeout =>
    {
        timer = setTimeout(() => resolveTimeout({ timedOut: true }), STREAM_START_TIMEOUT);
    });

    let result;
    try
    {
        result = await Promise.race([probing, exited, timeout]);
    }
    catch (error)
    {
        kill();
        throw new YtDlpError(extractError(stderr, `Could not read the audio stream (${error.message})`));
    }
    finally
    {
        clearTimeout(timer);
    }

    if (result.timedOut)
    {
        kill();
        throw new YtDlpError('Timed out while starting the stream');
    }
    if (!result.stream)
    {
        logger.debug('yt-dlp stream failed:', stderr.trim());
        throw new YtDlpError(result.error
            ? `Could not start yt-dlp (${result.error.message})`
            : extractError(stderr, `yt-dlp exited with code ${result.code}`));
    }

    const resource = createAudioResource(result.stream, { inputType: result.type, metadata: track });
    resource.playStream.once('close', kill);
    return resource;
}

function selfUpdate()
{
    const proc = spawn(binary, ['--update'], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    let output = '';
    proc.stdout.on('data', chunk => output += chunk);
    proc.stderr.on('data', chunk => output += chunk);
    proc.on('error', error => logger.warn(`yt-dlp self-update failed: ${error.message}`));
    proc.on('close', () =>
    {
        const line = output.trim().split(/\r?\n/).at(-1);
        if (line) logger.info(`yt-dlp: ${line}`);
    });
}

/** Keeps yt-dlp current, since YouTube regularly breaks older versions. */
export function scheduleYtDlpUpdates()
{
    if (!config.ytdlp.autoUpdate) return;
    selfUpdate();
    setInterval(selfUpdate, 24 * 60 * 60 * 1000).unref();
}
