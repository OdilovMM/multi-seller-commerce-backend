const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = url => {
	return mongoose
	.connect(url)
	.then(() => {
			logger.info('[ConnectDB.js] Database connection successful');
		})
		.catch(err => {
			logger.error('[ConnectDB.js] Failed to connect to MongoDB:', err);
			process.exit(1); 
		});
};

module.exports = connectDB;