const express = require('express');
const { body } = require('express-validator');
const { createMenuItem, getMenu, updateMenuItem, deleteMenuItem } = require('../controllers/menuController');
const { protect } = require('../middleware/auth');
const restrictTo = require('../middleware/restrictTo');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

// Public - customers browse without logging in
router.get('/menu', getMenu);

// Admin only
router.post(
  '/menu',
  protect,
  restrictTo('admin'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('category').isIn(['Starter', 'Main Course', 'Dessert', 'Drinks']).withMessage('Invalid category'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  ],
  validateRequest,
  createMenuItem
);

router.put('/menu/:id', protect, restrictTo('admin'), updateMenuItem);
router.delete('/menu/:id', protect, restrictTo('admin'), deleteMenuItem);

module.exports = router;
