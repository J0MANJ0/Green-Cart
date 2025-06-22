import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import stripe from 'stripe';
import mongoose from 'mongoose';

// place order stripe : /api/order/stripe
export const placeOrderStripe = async (req, res) => {
  try {
    const {
      body: { userId, items, address },
      headers: { origin },
    } = req;

    if (!address || items.length === 0) {
      return res.json({
        success: false,
        message: 'Invalid data',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error(`Invalid userId: ${userId}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid userId',
      });
    }

    let productData = [];

    let amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new Error(`Product not found: ${item.product}`);
      }
      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      });
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);

    // tax rate 2%

    amount += Math.floor(amount * 0.02);
    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: 'Online',
    });

    // stripe gateway

    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    // const line_items = productData.map((item) => (
    //   {
    //     price_data: {
    //       currency: 'usd',
    //       product_data: {
    //         name: item.name,
    //       },
    //       unit_amount: Math.floor(item.price + item.price * 0.02) * 100,
    //     },
    //     quantity: item.quantity,
    //   };
    // ));

    const line_items = productData.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
        },
        unit_amount: Math.floor(item.price + item.price * 0.02) * 100,
      },
      quantity: item.quantity,
    }));

    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      locale: 'en',
      mode: 'payment',
      success_url: `${origin}/loader?next=my-orders`,
      cancel_url: `${origin}/cart`,
      metadata: {
        userId: userId.toString(),
        orderId: order._id.toString(),
      },
    });

    return res.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// stripe webhooks
export const stripeWebhooks = async (request, response) => {
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    response.status(400).send(`Webhook Error: ${error.message}`);
  }

  // handle event

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      if (!session.data[0]) {
        console.error(
          `No session found for payment intent: ${paymentIntentId}`
        );
        return response
          .status(400)
          .json({ received: false, message: 'No session found' });
      }

      const { orderId, userId } = session.data[0].metadata;

      // payment is paid

      const updateOrder = await Order.findByIdAndUpdate(
        orderId,
        { isPaid: true },
        { new: true }
      );
      if (!updateOrder) {
        console.error(`Failed to update order: ${orderId}`);
      } else {
        console.log(`Order updated: ${orderId}`);
      }

      const updateUser = await User.findByIdAndUpdate(
        userId,
        { $set: { cartItems: {} } },
        { new: true }
      );
      if (!updateUser) {
        console.error(`Failed to clear cart for user: ${userId}`);
      } else {
        console.log(`Cart cleared for user: ${userId}`);
      }

      break;
    }

    case 'payment_intent.failed': {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { orderId } = session.data[0].metadata;

      await Order.findByIdAndDelete(orderId);
      console.log(`Deleted failed order: ${orderId}`);
      break;
    }

    default:
      console.error(`Unhandled event type ${event.type}`);
      break;
  }

  response.json({
    received: true,
  });
};

// place order COD : /api/order/cod
export const placeOrderCOD = async (req, res) => {
  try {
    const {
      body: { userId, items, address },
    } = req;

    if (!address || items.length === 0) {
      return res.json({
        success: false,
        message: 'Invalid data',
      });
    }

    let amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);

    // tax rate 2%

    amount += Math.floor(amount * 0.02);
    await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: 'COD',
    });

    return res.json({
      success: true,
      message: 'Order Placed Successfully',
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const {
      body: { userId },
    } = req;
    const orders = await Order.find({
      userId,
      $or: [{ paymentType: 'COD' }, { isPaid: true }],
    })
      .populate('items.product address')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// get all orders for admin : /api/order/seller
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: 'COD' }, { isPaid: true }],
    })
      .populate('items.product address')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
