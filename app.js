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

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const authAdminRouter = require('./routes/authAdminRoutes');
const categoryRouter = require('./routes/categoryRoutes');
const sellerRouter = require('./routes/sellerRoutes');
const productRouter = require('./routes/productRoutes');
const customerRouter = require('./routes/customerRoutes');
const orderRouter = require('./routes/orderRoutes');
const bannerRouter = require('./routes/bannerRoutes');
const paymentRouter = require('./routes/paymentRoutes');


const app = express();
app.enable('trust proxy')

// 1) GLOBAL MIDDLEWARESs
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 10000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use(
  cors({
    origin: [
      // 'https://my-shop-ecommerce-nine.vercel.app', //front end
      'http://localhost:5173',
      'http://localhost:5174',
      'https://seller-dashboard-iota.vercel.app', //seller
      // 'http://localhost:5175',
      'https://admin-dashboard-seven-rust-17.vercel.app', // admin dashboard
    ],
    credentials: true,
  }),
);

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

app.use(compression());

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
// testing
app.use('/api/v1/test-my-api', (req, res)=> {
  res.status(200).json({status: "success",message: 'This is an e-commerce rest api'})
})
app.use('/api/v1/admin', authAdminRouter);
app.use('/api/v1/seller', sellerRouter);
app.use('/api/v1/customer', customerRouter);
app.use('/api/v1/category', categoryRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/order', orderRouter);
app.use('/api/v1/banner', bannerRouter);
app.use('/api/v1/payment', paymentRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
