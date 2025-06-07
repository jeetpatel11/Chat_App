import User from '../models/user.model.js';
import Message from '../models/message.model.js';

import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config(); // Load .env file

// ✅ Proper Cloudinary config
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error);
    }
}

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const senderId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: senderId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: senderId },
            ]
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error);
    }
};


export const sendMessage = async (req, res) => {
    try {
        const {text,image}=req.body;
        const {id:receiverId} = req.params;
        const senderId=req.user._id;

        let imageUrl;
        if(image){
            const uploadResponse=await cloudinary.uploader.upload(image);
            imageUrl=uploadResponse.secure_url;
            
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image:imageUrl,
        });

        await newMessage.save();


          const io = req.app.get("io"); // You must have set this in app.js or server.js

    // ✅ Emit the message to the receiver's room
    if (io) {
      io.to(receiverId.toString()).emit("newMessage", newMessage);
      io.to(senderId.toString()).emit("newMessage", newMessage); // optional: to update sender too
    } else {
      console.warn("Socket.io instance not found");
    }

        res.status(200).json(newMessage);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error);
    }
}


provide me currect code
