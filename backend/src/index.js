

import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import authRoutes from './routes/auth.route.js';
import { messageRoutes } from './routes/message.route.js';
import connect from './lib/db.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(cookieParser()); // Use only once
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes);

const port = process.env.PORT || 5001; // Fallback port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  connect();
});