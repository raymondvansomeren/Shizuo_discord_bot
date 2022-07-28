const { logLevel } = require('../config.json');
const logger = require('log4js').getLogger();
logger.level = logLevel;

module.exports = {
    name: 'error',
    execute(error)
    {
        logger.error(error);
    },
};