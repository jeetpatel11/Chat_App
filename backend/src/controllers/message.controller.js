import User from '../models/user.model.js';
import Message from '../models/message.model.js';
import Conversation from '../models/conversation.model.js'; // Import Conversation model
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

    // Find the conversation between the two users
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
    });

    if (!conversation) {
      return res.status(200).json([]); // No conversation yet, return empty array
    }

    const messages = await Message.find({
      conversationId: conversation._id,
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

    // Find or create a conversation between the sender and receiver
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId],
      });
      await conversation.save();
    }

    // Check for duplicate messages within the last 1 second
    const recentMessage = await Message.findOne({
      conversationId: conversation._id,
      senderId,
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
      conversationId: conversation._id,
      senderId,
      receiverId,
      text: text || "",
      image: imageUrl,
    });

    await newMessage.save();

    // Populate sender and receiver details for the response
    await newMessage.populate("senderId receiverId", "username");

    // Emit the message via Socket.IO to the conversation room
    const io = req.app.get("io");
    if (io) {
      const roomId = conversation._id.toString();
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
