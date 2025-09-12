const pino = require('pino');
const os = require('os');

// const logger = pino({
// 	level: 'info',
// 	timestamp: pino.stdTimeFunctions.isoTime,
// 	base: { pid: process.pid, hostname: os.hostname() },
// 	transport: {
// 		target: 'pino-pretty',
// 		options: {
// 			colorize: true,
// 			translateTime: 'SYS:standard',
// 			ignore: 'pid,hostname',
// 		},
// 	},
// });
const logger = pino({
	level: 'info',
	transport: {
		target: 'pino-pretty',
		options: {
			colorize: true, // rangli chiqishi
			translateTime: 'SYS:standard', // vaqtni o‘qilishi oson
			ignore: 'pid,hostname', // keraksiz maydonlarni olib tashlaydi
			singleLine: false,
			messageFormat: '{msg}',
		},
	},
});

module.exports = logger;
