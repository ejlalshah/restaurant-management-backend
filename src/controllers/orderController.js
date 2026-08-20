const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

// POST /order - customer places an order
// Body: { "items": [{ "menuItemId": "...", "quantity": 2 }, ...] }
const placeOrder = async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must include at least one item' });
    }

    // Look up every menu item from the DATABASE, never trust a price sent by the client -
    // otherwise anyone could POST {"price": 0.01} and order a steak for a cent.
    const orderItems = [];
    let totalPrice = 0;

    for (const { menuItemId, quantity } of items) {
      if (!quantity || quantity < 1) {
        return res.status(400).json({ success: false, message: 'Each item needs a quantity of at least 1' });
      }

      const menuItem = await MenuItem.findById(menuItemId);
      if (!menuItem) {
        return res.status(404).json({ success: false, message: `Menu item not found: ${menuItemId}` });
      }
      if (!menuItem.isAvailable) {
        return res.status(400).json({ success: false, message: `${menuItem.name} is currently unavailable` });
      }

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        priceAtOrder: menuItem.price,
        quantity,
      });
      totalPrice += menuItem.price * quantity;
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalPrice: Math.round(totalPrice * 100) / 100, // avoid floating point cents like 19.999999
    });

    res.status(201).json({ success: true, message: 'Order placed', data: order });
  } catch (err) {
    next(err);
  }
};

// GET /my-orders - customer's own order history
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    next(err);
  }
};

// GET /orders - admin only, all orders across all customers
const getAllOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const orders = await Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    next(err);
  }
};

// PUT /order/:id/status - admin only
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, message: 'Order status updated', data: order });
  } catch (err) {
    next(err);
  }
};

module.exports = { placeOrder, getMyOrders, getAllOrders, updateOrderStatus };
