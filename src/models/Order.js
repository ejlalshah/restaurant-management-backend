const mongoose = require('mongoose');

// Embedded sub-document instead of a separate collection. Each order item
// snapshots the price at the time of order, so if the menu price changes
// later, past orders still show what the customer actually paid.
const orderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    priceAtOrder: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: {
      type: [orderItemSchema],
      validate: [(arr) => arr.length > 0, 'Order must contain at least one item'],
    },
    totalPrice: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['Pending', 'Preparing', 'Out for delivery', 'Delivered'],
      default: 'Pending',
    },
  },
  { timestamps: true } // createdAt = order placed time
);

module.exports = mongoose.model('Order', orderSchema);
