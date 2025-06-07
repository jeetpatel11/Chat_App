

import dotenv from 'dotenv';
dotenv.config();
import authRoutes from './routes/auth.route.js';
import { messageRoutes } from './routes/message.route.js';
import connect from './lib/db.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express'
import { server,app, io } from './lib/socket.js';
import path from 'path';





app.use(cookieParser()); // Use only once
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.set('io', io);



const __dirname = path.resolve();
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/frontend/dist/index.html'));
  });
}


// Handle large payloads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes);

const port = process.env.PORT || 5001; // Fallback port
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  connect();
});