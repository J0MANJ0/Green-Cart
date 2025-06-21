import express from 'express';
import {
  adminLogin,
  adminLogout,
  isSellerAuth,
} from '../controllers/adminController.js';
import authSeller from '../middleware/authSeller.js';

const adminRouter = express.Router();

adminRouter.post('/login', adminLogin);
adminRouter.get('/is-auth', authSeller, isSellerAuth);
adminRouter.get('/logout', adminLogout);

export default adminRouter;
