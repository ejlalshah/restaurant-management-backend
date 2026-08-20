const express = require('express');
const { body } = require('express-validator');
const { placeOrder, getMyOrders, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const restrictTo = require('../middleware/restrictTo');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.use(protect); // every order route requires login

router.post('/order', restrictTo('customer'), placeOrder);
router.get('/my-orders', restrictTo('customer'), getMyOrders);

router.get('/orders', restrictTo('admin'), getAllOrders);
router.put(
  '/order/:id/status',
  restrictTo('admin'),
  [body('status').isIn(['Pending', 'Preparing', 'Out for delivery', 'Delivered']).withMessage('Invalid status')],
  validateRequest,
  updateOrderStatus
);

module.exports = router;
