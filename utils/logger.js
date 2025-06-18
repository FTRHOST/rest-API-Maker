const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.colorize(),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message, ...meta }) => {
      let metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
      if (meta && meta.stack) { // Handle Error objects
        metaString = meta.stack;
      }
      return `${timestamp} [${level}]: ${message} ${metaString}`;
    })
  ),
  transports: [new transports.Console()],
});

module.exports = logger;