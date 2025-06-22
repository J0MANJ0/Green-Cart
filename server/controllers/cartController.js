import User from '../models/User.js';

// update user cart : /api/cart/update

export const updateCart = async (req, res) => {
  try {
    const {
      body: { userId, cartItems },
    } = req;
    await User.findByIdAndUpdate(userId, { cartItems });

    res.json({
      success: true,
      message: 'Cart Updated',
    });
  } catch (error) {
    console.log('updatecart_controller', error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};
