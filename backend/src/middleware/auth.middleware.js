// src/middleware/protectRoute.js
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    console.log("All cookies:", req.cookies); // Debug
    console.log("Authorization header:", req.header("Authorization")); // Debug
    const token = req.cookies.jwt || req.header("Authorization")?.replace("Bearer ", "");
    console.log("Token received:", token);

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    const userId = decoded.userId || decoded.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token Payload" });
    }

    const user = await User.findById(userId).select("fullname email profilepic _id").lean();
    console.log("User lookup result:", user ? user : "No user found for ID: " + userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in protectRoute middleware:", error.message, error.stack);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};