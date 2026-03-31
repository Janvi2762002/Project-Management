import express from "express";
import * as projectController from "../controllers/projectController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, projectController.createProject);

router.get("/", auth, projectController.getProjects);

router.delete("/:id", auth, projectController.deleteProject);

export default router;