const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, message: 'Too many requests, please try again later' },
});
app.use('/api/auth', authLimiter);

app.get('/health', (req, res) => res.status(200).json({ success: true, message: 'API is healthy' }));

app.use('/api/auth', authRoutes);
app.use('/api', menuRoutes); // /api/menu
app.use('/api', orderRoutes); // /api/order, /api/my-orders, /api/orders

app.use(notFound);
app.use(errorHandler);

module.exports = app;
