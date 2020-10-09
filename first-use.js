const { dbhost, dbuser, dbpassword, db, prefix, modPrefix } = require('./config.json');
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host     : dbhost,
    user     : dbuser,
    password : dbpassword,
    database : db,
});

connection.query(`CREATE TABLE guildsettings (Guild VARCHAR(255) PRIMARY KEY, Prefix VARCHAR(5) NOT NULL DEFAULT(${prefix}), ModPrefix VARCHAR(5) NOT NULL DEFAULT(${modPrefix}));`,
    function(error, results, fields)
    {
        if (error)
            throw error;
    });

connection.query('CREATE TABLE points (User VARCHAR(255) PRIMARY KEY, Guild VARCHAR(255) PRIMARY KEY, Points INT(11) UNSIGNED NOT NULL);',
    function(error, results, fields)
    {
        if (error)
            throw error;
    });