import { v2 as cloudinary } from 'cloudinary';
import Product from '../models/Product.js';

// add product : /api/product/add
export const addProduct = async (req, res) => {
  try {
    let productData = JSON.parse(req.body.productData);

    const images = req.files;

    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: 'image',
        });
        return result.secure_url;
      })
    );

    await Product.create({ ...productData, image: imagesUrl });

    return res.json({
      success: true,
      message: 'Product Added',
    });
  } catch (error) {
    console.log('addproduct_controller', error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// get products : /api/product/list
export const productList = async (_, res) => {
  try {
    const products = await Product.find({});
    return res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.log('productlist_controller', error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// single product : /api/product/:id
export const product = async (req, res) => {
  try {
    const {
      body: { id },
    } = req;
    const product = await Product.findById(id);
    return res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.log('product_controller', error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// single product : /api/product/stock
export const changeStock = async (req, res) => {
  try {
    const {
      body: { id, inStock },
    } = req;

    await Product.findByIdAndUpdate(id, { inStock });

    return res.json({
      success: true,
      message: 'Stock Updated',
    });
  } catch (error) {
    console.log('changestock_controller', error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};
