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

connection.query('CREATE TABLE points (User VARCHAR(255), Guild VARCHAR(255), Points INT(11) DEFAULT(0) UNSIGNED NOT NULL);',
    function(error, results, fields)
    {
        if (error)
            throw error;
    });