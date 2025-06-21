import Address from '../models/Address.js';

// add address : /api/address/add

export const addAddress = async (req, res) => {
  try {
    const {
      body: { address, userId },
    } = req;

    await Address.create({ ...address, userId });
    return res.json({
      success: true,
      message: 'Address added successfully',
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const getAddress = async (req, res) => {
  try {
    const {
      body: { userId },
    } = req;

    const addresses = await Address.find({ userId });

    return res.json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};
