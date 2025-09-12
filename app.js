require('dotenv').config();
const pino = require('pino');
const logger = pino();
const pinoHttp = require('pino-http');
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const compression = require('compression');
const notFoundMiddleware = require('./middleware/not-found-route');
const errorHandlerMiddleware = require('./middleware/error-handler');
const connectDB = require('./db/connect');
const swaggerDocs = require('./utils/swagger');

logger.info('[App.js]: Application started');

const app = express();
const httpLogger = pinoHttp({
	logger,
	// Request kelganida
	customReceivedMessage: (req) => `Incoming request: ${req.method} ${req.url}`,
	// Success bo‘lganda
	customSuccessMessage: (res) => `Request completed with status ${res.statusCode}`,
	// Error bo‘lganda
	customErrorMessage: (error, res) => {
		return `Request error with status ${res.statusCode}: ${error.message}`;
	},
	// Qaysi log level ishlatilishini o‘zingiz belgilang
	customLogLevel: function (res, err) {
		if (res.statusCode >= 400 && res.statusCode < 500) return 'warn';
		if (res.statusCode >= 500 || err) return 'error';
		return 'info';
	},
	// Req/Res ma’lumotlarini ham ko‘rsatish
	serializers: {
		req(req) {
			return {
				method: req.method,
				url: req.url,
				body: req.body,
				query: req.query,
			};
		},
		res(res) {
			return {
				statusCode: res.statusCode,
			};
		},
	},
});

app.use(httpLogger);
swaggerDocs(app);
app.use(express.static(path.join(__dirname, 'public')));

app.use(helmet());

if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

const limiter = rateLimit({
	max: 10,
	windowMs: 60 * 60 * 1000,
	message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/api', limiter);

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use(
	cors({
		origin: [process.env.CLIENT_URL],
		credentials: true,
	}),
);

app.use(mongoSanitize());
app.use(xss());
app.use(compression());

app.use((req, res, next) => {
	req.requestTime = new Date().toISOString();
	next();
});

// Routes
app.use('/api/v2', require('./routes/index'));

// Error middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const bootstrap = async () => {
	try {
		const PORT = process.env.PORT || 5005;
		await connectDB(process.env.MONGO_URI);
		app.listen(PORT, () => {
			logger.info(`[App.js] Server running on port ${PORT}`);
			logger.info(`[App.js] Swagger docs running on port http://localhost:5000/api-docs`);
		});
	} catch (error) {
		logger.error(`[Server error occured in init]`, error);
	}
};

bootstrap();
