export function formatDuration(seconds)
{
    if (seconds === null || seconds === undefined || !Number.isFinite(seconds)) return 'Live';

    const total = Math.max(0, Math.floor(seconds));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor(total / 60) % 60;
    const secs = String(total % 60).padStart(2, '0');

    return hours > 0
        ? `${hours}:${String(minutes).padStart(2, '0')}:${secs}`
        : `${minutes}:${secs}`;
}

export function progressBar(elapsed, total, size = 16)
{
    if (!Number.isFinite(total) || total <= 0) return '🔴 Live';

    const ratio = Math.min(1, Math.max(0, elapsed / total));
    const position = Math.min(size - 1, Math.floor(ratio * size));
    return `${'▬'.repeat(position)}🔘${'▬'.repeat(size - position - 1)}`;
}

export function discordTimestamp(date, style = 'R')
{
    return `<t:${Math.floor(date.valueOf() / 1000)}:${style}>`;
}
