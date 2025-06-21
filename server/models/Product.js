import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: Array, required: true },
    price: { type: Number, required: true },
    offerPrice: { type: Number, required: true },
    image: { type: Array, required: true },
    category: { type: String, required: true },
    inStock: { type: Boolean, default: true },
    cartItems: { type: Object, default: {} },
  },
  { timestamps: true }
);

const Product =
  mongoose.models.product || mongoose.model('product', productSchema);

export default Product;
