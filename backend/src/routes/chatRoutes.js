import express from "express";
import { getProjectMessages } from "../controllers/chatController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.get("/:projectId", authMiddleware, getProjectMessages);

export default router;
