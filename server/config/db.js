import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => {
      console.log(`DATABASE Green_Cart CONNECTED`);
    });
    await mongoose.connect(`${process.env.MONGODB_URI}/green_cart`);
  } catch (error) {
    console.error(error.message);
  }
};

export default connectDB;
