// First, require the module.
const mysql = require('better-mysql');

// Then login to the mysql service
const client = new mysql.client({
    host: 'localhost',
    user: 'au_bot',
    pass: 'TYEpSVjJ4sPRSWj',
});

// Now, create the database 'better-mysql-bot', but you can rename it to whatever you want.
client.loadDatabase('au_bot').then(async (database) =>
{
    const table = await database.createTable('guildsettings', ['Guild', 'Settings'])
        .catch(e =>
        {
            console.log(e);
        });
});