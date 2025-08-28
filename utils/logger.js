const pino = require('pino');
const os = require('os');

const logger = pino({
  level: 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  base: { pid: process.pid, hostname: os.hostname() },
  transport: process.env.LOG_PRETTY === 'true' ? { target: 'pino-pretty' } : undefined,
});

// Usage
// logger.info('Application started');
// logger.info({ user: 'john' }, 'User logged in');
// logger.error({ err: new Error('Connection failed') }, 'Database connection error');



module.exports = logger;