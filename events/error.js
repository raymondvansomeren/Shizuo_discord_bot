const error = require('../modules/log').error;

module.exports = {
    name: 'error',
    execute(e)
    {
        error(e);
    },
};