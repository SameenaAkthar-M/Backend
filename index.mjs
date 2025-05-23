import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.mjs';
import authRoutes from './routes/authRoutes.mjs'
import productsRoute from './routes/productsRoute.mjs'
import orderRoute from './routes/orderRoute.mjs'

dotenv.config();
const app = express();
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

connectDB();

app.use('/api/auth', authRoutes);
app.use(productsRoute);
app.use('/api/orders',orderRoute);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));