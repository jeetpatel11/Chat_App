import User from '../models/user.model.js';
import Message from '../models/message.model.js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config(); // Load .env file

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUser._id },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: senderId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: senderId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("senderId receiverId", "username"); // Populate sender and receiver details

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // Validate receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    // Create a unique room ID for this chat (sorted senderId and receiverId to ensure consistency)
    const participants = [senderId.toString(), receiverId.toString()].sort();
    const roomId = participants.join('-'); // e.g., "user1Id-user2Id"

    // Check for duplicate messages within the last 1 second
    const recentMessage = await Message.findOne({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
      text: text || "",
      image: image || null,
      createdAt: { $gte: new Date(Date.now() - 1000) },
    });

    if (recentMessage) {
      console.log("Duplicate message detected:", { senderId, text, image });
      return res.status(400).json({ message: "Duplicate message detected" });
    }

    // Upload image to Cloudinary if present
    let imageUrl = null;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "chat_app_images",
      });
      imageUrl = uploadResponse.secure_url;
    }

    // Create new message
    const newMessage = new Message({
      senderId,
      receiverId,
      text: text || "",
      image: imageUrl,
    });

    await newMessage.save();

    // Populate sender and receiver details for the response
    await newMessage.populate("senderId receiverId", "username");

    // Emit the message via Socket.IO to the chat room
    const io = req.app.get("io");
    if (io) {
      io.to(roomId).emit("newMessage", newMessage);
      console.log(`Emitted newMessage to room ${roomId}:`, newMessage);
    } else {
      console.warn("Socket.io instance not found");
    }

    res.status(200).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
