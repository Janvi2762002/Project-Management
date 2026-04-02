import express from "express";
import { getProjectMessages, uploadAttachments } from "../controllers/chatController.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/:projectId", auth, getProjectMessages);
router.post("/upload", auth, upload.array("attachments"), uploadAttachments);

export default router;
