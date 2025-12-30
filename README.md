# 💬 Chat App

A full-stack real-time chat application built with **React**, **Node.js**, **Express.js**, **MongoDB**, and **Socket.io**. It supports **user authentication**, **real-time messaging**, **online status**, and a **responsive modern UI**. The app also includes features like **user search**, **message history**, and **typing indicators**.

## 🔧 Tech Stack

- **Frontend**: React, Zustand, Clerk Auth, Tailwind CSS
- **Backend**: Node.js, Express.js, MongoDB
- **Real-time**: Socket.io
- **Authentication**: Clerk
- **Database**: MongoDB (Mongoose)

## ✨ Features

- ✅ User authentication via Clerk
- ✅ Real-time messaging using Socket.io
- ✅ Online/offline status indicators
- ✅ Search users to start chats
- ✅ Message persistence (stored in MongoDB)
- ✅ Responsive UI with Tailwind CSS

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/jeetpatel11/Chat_App

# Install frontend & backend dependencies
cd Chat_App
cd client && npm install
cd ../server && npm install

# Start both servers (you can use tools like concurrently or run in separate terminals)
npm run dev  # inside /client
npm run start # inside /server
