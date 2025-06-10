const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  products: [
    {
      productName: String,
      productSlug: String,
      quantity: Number
    }
  ],
  placedAt: { type: Date, default: Date.now }
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = {Order}