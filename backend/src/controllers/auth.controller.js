
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config(); // Load .env file

// ✅ Proper Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// Generate JWT token and set cookie
const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: "lax",
  });
  return token;
};

export const signup = async (req, res) => {
  const { fullname, email, password, profilepic } = req.body;
  try {
    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hash = bcrypt.hashSync(password, 10);
    const newUser = new User({ fullname, email, password: hash, profilepic: profilepic || null });
    await newUser.save();

    const token = generateToken(newUser._id.toString(), res);
    res.status(201).json({
      message: "User created successfully",
      user: { _id: newUser._id, fullname: newUser.fullname, email: newUser.email, profilepic: newUser.profilepic },
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id.toString(), res);
    res.status(200).json({
      message: "Login successful",
      user: { _id: user._id, fullname: user.fullname, email: user.email, profilepic: user.profilepic },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "User logged out" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilepic } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(400).json({ message: "User ID missing from request" });
    }

    let profilePicUrl = req.user.profilepic;
    if (profilepic) {
      const base64 = profilepic.startsWith('data:image') ? profilepic.split(',')[1] : profilepic;
      const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${base64}`, {
        upload_preset: "profile_upload",
        folder: "profile_pics",
        transformation: [{ width: 200, height: 200, crop: 'fill' }],
      });
      profilePicUrl = result.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { profilepic: profilePicUrl }, { new: true }).lean();
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: { _id: updatedUser._id, fullname: updatedUser.fullname, email: updatedUser.email, profilepic: updatedUser.profilepic },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Profile update failed", error: error.message });
  }
};

export const checkAuth = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    

    let user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!user.createdAt) {
      user.createdAt = new Date();
      await user.save();
    }

    res.json({ user });
  } catch (error) {
    console.error('Check auth error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

