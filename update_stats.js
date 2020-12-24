const axios = require('axios');

const guilds = 30;

const topgg = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijc2MTI2MjIxMDIwNjUzMTY0NSIsImJvdCI6dHJ1ZSwiaWF0IjoxNjA4NjYzOTA3fQ._g8aJuV_XCfbkFZoGai4AJMMgD3Zo_b2tZg6LJGXduw';
axios.post('https://top.gg/api/bots/761262210206531645/stats',
    {
        server_count: guilds,
    },
    {
        headers:
        {
            'Authorization': `${topgg}`,
        },
    });

const discordbotsgg = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOnRydWUsImlkIjoiMjcwODcxOTIxMTM3MDI1MDI0IiwiaWF0IjoxNjA4ODMwMDE5fQ.b_284EFyxa6P2hBoRXSn9Zl1OZyxB-5uu6ijIu_e5Kk';
axios.post('https://discord.bots.gg/api/v1/bots/761262210206531645/stats',
    {
        guildCount: guilds,
    },
    {
        headers:
        {
            'Authorization': `${discordbotsgg}`,
        },
    });

const discordbotstoken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0IjoxLCJpZCI6Ijc2MTI2MjIxMDIwNjUzMTY0NSIsImlhdCI6MTYwODgyOTczOX0.edtFODPjA8qBJpCoDSQSTitJzVwDhizWi_OGjEylV5c';
axios.post('https://discordbotlist.com/api/v1/bots/761262210206531645/stats',
    {
        guilds: `${guilds}`,
    },
    {
        headers:
        {
            'Authorization': `${discordbotstoken}`,
        },
    });