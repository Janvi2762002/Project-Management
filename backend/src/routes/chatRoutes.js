import express from "express";
import { getProjectMessages } from "../controllers/chatController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/:projectId", auth, getProjectMessages);

export default router;
