const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const auth = require("../middleware/auth");

router.get("/", auth, userController.getUsers);
router.post("/", userController.createUser);
router.post("/login", userController.loginUser);
router.delete("/:id", auth, userController.deleteUser);
router.put("/:id", auth, userController.updateUser);

module.exports = router;