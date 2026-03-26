// const Task = require("../models/task");
import Task from "../models/task.js";
import Project from "../models/project.js";

export const getAllTasks = async (req, res) => {
  try {
    const userId = req.user.userId;

    // 1. Get user's projects
    const projects = await Project.find({ owner: userId });

    const projectIds = projects.map(p => p._id);

    // 2. Get tasks only from those projects
    const tasks = await Task.find({
      project: { $in: projectIds }
    });

    res.json(tasks);

  } catch (err) {
    console.error("REGISTER ERROR:", err); // ✅ add this
    res.status(500).json({ message: err.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;
    const { projectId } = req.params;

    let tasks;

    if (role === "admin") {
      // Admin sees all tasks of project
      tasks = await Task.find({ project: projectId }).populate("assignee", "name");
    } else {
      // User sees only assigned tasks
      tasks = await Task.find({
        project: projectId,
        assignee: userId
      });
    }

    res.json(tasks);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTask = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("PARAMS:", req.params);
    console.log("USER:", req.user);

    const { projectId } = req.params;
    const userId = req.user?.userId;

    const task = new Task({
      title: req.body.title,
      priority: req.body.priority,
      due: req.body.due,
      assignee: req.body.assignee || null,
      project: projectId,
      owner: userId
    });

    await task.save();

    res.json(task);

  } catch (error) {
    console.error("CREATE TASK ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteTask = async (req, res) => {

  const task = await Task.findByIdAndDelete(req.params.id);

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  res.json({ message: "Task deleted" });
};

export const updateTaskStatus = async (req, res) => {

  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  res.json(task);
};

export const updateTask = async (req, res) => {
  try {
    const { title, description, priority, due, assignee, status } = req.body

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, priority, due, assignee, status },
      { new: true, runValidators: true }
    )

    if (!task) return res.status(404).json({ message: "Task not found" })

    res.json(task)
  } catch (err) {
    res.status(500).json({ message: "Failed to update task" })
  }
}