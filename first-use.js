const { dbhost, dbuser, dbpassword, db } = require('./config.json');
// const dbhost = require('./config.json').dbhost;
// const dbuser = require('./config.json').dbuser;
// const dbpassword = require('./config.json').dbpassword;
// const db = require('./config.json').dbhost;
const mysql = require('mysql');

console.log(dbhost);

const connection = mysql.createConnection({
    host     : dbhost,
    user     : dbuser,
    password : dbpassword,
    database : db,
});

connection.connect();

connection.query('CREATE TABLE guildsettings (Guild VARCHAR(255) PRIMARY KEY, Prefix VARCHAR(5) NOT NULL, ModPrefix VARCHAR(5) NOT NULL);', function (error, results, fields)
{
    if (error)
        throw error;
    // console.log('The solution is: ', results[0].solution);
});

connection.query('CREATE TABLE points (User VARCHAR(255) PRIMARY KEY, Guild VARCHAR(255) PRIMARY KEY, Points INT(11) UNSIGNED NOT NULL);', function (error, results, fields)
{
    if (error)
        throw error;
    // console.log('The solution is: ', results[0].solution);
});

connection.end();