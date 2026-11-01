# Shizuo Heiwajima — Discord music bot

A Discord bot that plays music from YouTube and YouTube Music in voice channels, with a few utility commands.

Built on discord.js v14 and @discordjs/voice (with DAVE end-to-end voice encryption). Audio is extracted with [yt-dlp](https://github.com/yt-dlp/yt-dlp), which keeps working when YouTube changes things, and it updates itself automatically.

## Requirements

* [Node.js](https://nodejs.org/) 22.12 or newer (24 LTS or 26 LTS recommended)

ffmpeg and yt-dlp are downloaded automatically by `npm install`. No Python or other tools are needed.

## Setup

1. Create an application and bot on the [Discord developer portal](https://discord.com/developers/applications) and copy the bot token.
2. Install dependencies:
   ```sh
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in at least `DISCORD_TOKEN`.
   * While developing, set `DEV_GUILD_ID` to your test server's ID so command changes show up instantly.
4. Start the bot:
   ```sh
   npm start
   ```
   Slash commands are registered automatically on startup (disable with `AUTO_DEPLOY_COMMANDS=false` and run `npm run deploy` manually).
5. Invite the bot with the link from `/invite`.

## Commands

| Command | Description |
| --- | --- |
| `/play query [shuffle] [next]` | Play a YouTube / YouTube Music video or playlist URL, or search terms |
| `/skip`, `/pause`, `/resume`, `/stop` | Control playback |
| `/nowplaying` | Current track with progress |
| `/queue [page]` | Show the queue |
| `/loop [mode]` | Loop off / current track / whole queue |
| `/shuffle`, `/remove position`, `/move from to` | Manage the queue |
| `/ping`, `/avatar`, `/userinfo`, `/botinfo`, `/invite`, `/support` | Utility commands |

The now playing message has buttons for pause/resume, skip, loop, shuffle and stop.
Members with a role called `nomusic` or `incapacitated` can't use the music features.

## Troubleshooting

* **"Sign in to confirm you're not a bot"**: YouTube is rate-limiting your server's IP. Export cookies from a (throwaway) logged-in YouTube account in Netscape `cookies.txt` format and point `YTDLP_COOKIES` at the file.
* **Playback suddenly stops working**: YouTube changed something. yt-dlp updates itself on startup and daily (`YTDLP_AUTO_UPDATE`); restarting the bot forces an update check.
