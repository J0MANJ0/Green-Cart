import jwt from 'jsonwebtoken';

const authSeller = (req, res, next) => {
  const {
    cookies: { sellerToken },
  } = req;

  if (!sellerToken) {
    return res.json({
      success: false,
      message: 'Not Authorized',
    });
  }

  try {
    const tokenDecode = jwt.verify(sellerToken, process.env.JWT_SECRET);

    if (tokenDecode.email === process.env.ADMIN_EMAIL) {
      next();
    } else {
      return res.json({
        success: false,
        message: 'Not Authorized',
      });
    }
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export default authSeller;
