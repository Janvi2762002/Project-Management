import express from "express";
import * as userController from "../controllers/userController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, userController.getUsers);
router.post("/", userController.createUser);
router.post("/login", userController.loginUser);
router.post("/register", userController.registerUser);
router.delete("/:id", auth, userController.deleteUser);
router.put("/:id", auth, userController.updateUser);

export default router;