import jwt from 'jsonwebtoken';

// Admin login : /api/seller/login
export const adminLogin = async (req, res) => {
  const {
    body: { email, password },
  } = req;

  try {
    if (
      password === process.env.ADMIN_PASSWORD &&
      email === process.env.ADMIN_EMAIL
    ) {
      const token = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });

      res.cookie('sellerToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 7 * 24 * 3600000,
      });

      return res.json({
        success: true,
        message: 'Logged In',
      });
    } else {
      return res.json({
        success: false,
        message: 'Invalid Credentials',
      });
    }
  } catch (error) {
    console.log('adminlogin_controller', error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Admin auth : /api/seller/is-auth
export const isSellerAuth = async (_, res) => {
  try {
    return res.json({
      success: true,
    });
  } catch (error) {
    console.log('is-seller controller', error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Admin logout : /api/seller/logout
export const adminLogout = async (req, res) => {
  try {
    res.clearCookie('sellerToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 3600000,
    });

    return res.json({
      success: true,
      message: 'Logged Out',
    });
  } catch (error) {
    console.log('adminlogout', error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};
