import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.mjs';
import PDFDocument from 'pdfkit';

const router = express.Router();

const generateAccessToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '20s' });
const generateRefreshToken = (userId) => jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30s' });

router.post('/signup', async (req, res) => {
  console.log(req.body);
  try {
    const { name, email, password, phone, area, address, role } = req.body;

    if (!name || !email || !password || !phone || !area || !address) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      phone,
      area,
      address,
      role: role === 'admin' ? 'admin' : 'user' // ✅ only allow 'admin' or 'user'
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/login', async (req, res) => {
  console.log(req.body);
  try {
      const { email, password } = req.body;

      if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ error: 'Invalid email or password' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      user.refreshToken = refreshToken;
      await user.save();

      res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Strict',
          maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.json({ accessToken, userId: user._id ,role:user.role,name:user.name});
  } catch (error) {
    console.error("🔥 Login route error:", error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Example in Express.js
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ address: user.address });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/logout', async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) return res.status(403).json({ error: 'No Refresh Token Found' });

    await User.updateOne({ refreshToken }, { $unset: { refreshToken: 1 } });

    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password'); // remove password
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// DELETE a user by ID
router.delete('/users/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user' });
  }
});

router.get('/users/pdf', async (req, res) => {
  try {
    const users = await User.find();

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=all-users.pdf');
    doc.pipe(res);

    const currentDate = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    doc.fontSize(22).text('SASEN Tile Fixing Solution', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Generated on: ${currentDate}`, { align: 'center' });
    doc.moveDown(1.5);

    doc.fontSize(18).text('All Registered Users', { align: 'center' });
    doc.moveDown();

    users.forEach((user, index) => {
      doc.fontSize(12).text(`${index + 1}. Name: ${user.name}`);
      doc.text(`   Email: ${user.email}`);
      doc.text(`   Phone: ${user.phone}`);
      doc.text(`   Area: ${user.area}`);
      doc.text(`   Address: ${user.address}`);
      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    console.error('Error generating users PDF:', err);
    res.status(500).json({ message: 'Failed to generate users PDF' });
  }
});

export default router;