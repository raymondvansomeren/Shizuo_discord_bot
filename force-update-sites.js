const update = require('./modules/updateSites.js').execute;

const serverCount = 205;
const client = {
    guild: {
        cache: {
            size: serverCount,
        },
    },
};

// for (let i = 0; i < serverCount; i++)
// {
//     client.guild.cache.push({});
// }

update(client);