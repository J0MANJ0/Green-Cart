import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// sign-up : /api/user/register
export const register = async (req, res) => {
  try {
    const {
      body: { name, email, password },
    } = req;

    if (!name || !email || !password) {
      return res.json({
        success: false,
        message: 'Missing Details',
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.json({
        success: false,
        message: 'User already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashedPassword });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 3600000,
    });

    return res.json({
      success: true,
      user: { email: user.email, name: user.name },
    });
  } catch (error) {
    console.log('register', error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// login : /api/user/login
export const login = async (req, res) => {
  try {
    const {
      body: { email, password },
    } = req;

    if (!email || !password) {
      return res.json({
        success: false,
        message: 'All fields are required',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: 'User does not exist!',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 3600000,
    });

    return res.json({
      success: true,
      user: { email: user.email, name: user.name },
    });
  } catch (error) {
    console.log('Login', error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// check auth : /api/user/is-auth
export const isAuth = async (req, res) => {
  try {
    const {
      body: { userId },
    } = req;

    const user = await User.findById(userId).select('-password');

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.log('is-auth-contrller', error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// logout /api/user/logout
export const logout = async (req, res) => {
  try {
    res.clearCookie('token', {
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
    console.log('logout_user', error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};
