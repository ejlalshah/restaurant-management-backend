const MenuItem = require('../models/MenuItem');

// POST /menu - admin only
const createMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json({ success: true, message: 'Menu item added', data: item });
  } catch (err) {
    next(err);
  }
};

// GET /menu - public. Supports ?search=, ?category=, ?available=true
const getMenu = async (req, res, next) => {
  try {
    const { search, category, available } = req.query;
    const filter = {};

    if (search) filter.$text = { $search: search };
    if (category) filter.category = category;
    if (available !== undefined) filter.isAvailable = available === 'true';

    const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (err) {
    next(err);
  }
};

// PUT /menu/:id - admin only
const updateMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    res.status(200).json({ success: true, message: 'Menu item updated', data: item });
  } catch (err) {
    next(err);
  }
};

// DELETE /menu/:id - admin only
const deleteMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    res.status(200).json({ success: true, message: 'Menu item deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createMenuItem, getMenu, updateMenuItem, deleteMenuItem };
