let now = new Date();

module.exports = {
    name: 'log',
    log()
    {
        if (arguments.length > 0)
        {
            now = new Date();
            return console.log('[INFO] |', now.toUTCString(), '|', [...arguments].join(' '));
        }
    },
    error()
    {
        if (arguments.length > 0)
        {
            now = new Date();
            return console.error('[ERROR] |', now.toUTCString(), '|', [...arguments].join(' '));
        }
    },
};