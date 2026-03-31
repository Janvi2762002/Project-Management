import express from "express";
import * as taskController from "../controllers/taskController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// "/" must be above "/:projectId" — Express is greedy, "/:projectId" would catch "/" first
router.get("/", auth, taskController.getAllTasks);
router.get("/:projectId", auth, taskController.getTasks);
router.post("/:projectId", auth, taskController.createTask);

router.delete("/:id", auth, taskController.deleteTask);

router.put("/:id/status", auth, taskController.updateTaskStatus);
router.put("/:id", auth, taskController.updateTask);

//comments
router.post("/:id/comment", auth, taskController.addComment);
router.put("/:id/comment/:commentId", auth, taskController.editComment);
router.delete("/:id/comment/:commentId", auth, taskController.deleteComment);

export default router;