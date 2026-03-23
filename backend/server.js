require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected 🚀"))
  .catch(err => console.log(err));

app.use("/users", require("./src/routes/userRoutes"));
const projectRoutes = require("./src/routes/projectRoutes");

const taskRoutes = require("./src/routes/taskRoutes");

app.use("/tasks", taskRoutes);
app.use("/projects", projectRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));