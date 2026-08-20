const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// POST /signup - deliberately does NOT accept a "role" field from the client.
// If it did, anyone could sign up as {"role": "admin"} and manage the whole menu.
// Every public signup becomes a customer. Admin accounts are created via the
// seed script (see src/seed/createAdmin.js) - a real business would provision
// these manually or through an internal-only tool, never a public endpoint.
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({ name, email, password, role: 'customer' });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created',
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        token,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        token,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login };
