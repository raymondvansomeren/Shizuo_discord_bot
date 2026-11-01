import log4js from 'log4js';

import { config } from './config.js';

log4js.configure({
    appenders: { out: { type: 'stdout' } },
    categories: { default: { appenders: ['out'], level: config.logLevel } },
});

export const logger = log4js.getLogger('shizuo');
