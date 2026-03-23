const express = require("express");
const router = express.Router();

const taskController = require("../controllers/taskController");
const auth = require("../middleware/auth");

// "/" must be above "/:projectId" — Express is greedy, "/:projectId" would catch "/" first
router.get("/", auth, taskController.getAllTasks);
router.get("/:projectId", auth, taskController.getTasks);
router.post("/:projectId", auth, taskController.createTask);

router.delete("/:id", auth, taskController.deleteTask);

router.put("/:id/status", auth, taskController.updateTaskStatus);
router.put("/:id", auth, taskController.updateTask);

module.exports = router;