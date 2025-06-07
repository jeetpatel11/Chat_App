import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getMessages, getUsersForSidebar, sendMessage } from '../controllers/message.controller.js';

const router = express.Router();

console.log("Registering message routes:");
router.get("/users", (req, res) => res.send("Users route")); // Temporary test
router.get("/:id", (req, res) => res.send(`Messages for ID: ${req.params.id}`)); // Temporary test
router.post("/send/:id", (req, res) => res.send(`Send message to ID: ${req.params.id}`)); // Temporary test
// router.get("/users", protectRoute, getUsersForSidebar); // Comment out original
// router.get("/:id", protectRoute, getMessages); // Comment out original
// router.post("/send/:id", protectRoute, sendMessage); // Comment out original

console.log("Message routes registered:", router.stack.map(layer => ({
  path: layer.route?.path,
  methods: Object.keys(layer.route?.methods || {})
}))); // Debug routes

export const messageRoutes = router;
