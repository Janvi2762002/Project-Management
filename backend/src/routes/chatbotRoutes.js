import express from "express";
import { processQuery } from "../controllers/chatbotController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.post("/query", authMiddleware, processQuery);

export default router;
