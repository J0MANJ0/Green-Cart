import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/db.js';
import userRouter from './routes/userRoute.js';
import adminRouter from './routes/adminRoute.js';
import connectCloudinary from './config/cloudinary.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import addressRouter from './routes/addressRoute.js';
import orderRouter from './routes/orderRoute.js';
import { stripeWebhooks } from './controllers/orderController.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ['http://localhost:5173', 'https://green-cart-self.vercel.app'],
    credentials: true,
  })
);

app.get('/', (req, res) => {
  res.send('Welcome');
});

app.post(
  '/stripe/webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhooks
);

app.use('/api/user', userRouter);
app.use('/api/seller', adminRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);

connectDB()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.log(err));

connectCloudinary();
