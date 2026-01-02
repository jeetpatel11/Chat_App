import dotenv from 'dotenv';
dotenv.config();
import authRoutes from './routes/auth.route.js';
import { messageRoutes } from './routes/message.route.js';
import connect from './lib/db.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { server, app, io } from './lib/socket.js';
import path from 'path';

app.use(cookieParser());

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://chatty-fj4v.onrender.com" // Add your deployed domain here,
    ,
    "http://13.205.7.6:5173",
    "http://13.205.7.6"
  ],
  credentials: true,
}));

app.set('io', io);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes);

// Serving frontend
const __dirname = path.resolve();
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connect();
});
