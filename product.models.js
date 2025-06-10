const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
 slug: {
    type: String,
    required: true,
    unique: true,
  },
  image_url: {
    type: String,
    required: true
  },
  tags: {
    type: [String],
    default: []
  },
  category: {
    type: String,
    required: true
  }
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = {Product}
