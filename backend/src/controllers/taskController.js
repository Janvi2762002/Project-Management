// const Task = require("../models/task");
import Task from "../models/task.js";
import { createNotification, handleMentions } from "../utils/notifications.js";
// import Project from "../models/project.js";

export const getAllTasks = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    let tasks;

    if (role === "admin") {
      // ✅ Admin → ALL tasks
      tasks = await Task.find()
        .populate("project", "name")
        .populate("assignee", "name")
        .populate("comments.user", "name");
    } else {
      // ✅ User → only assigned tasks
      tasks = await Task.find({ assignee: userId })
        .populate("project", "name")
        .populate("assignee", "name")
        .populate("comments.user", "name");
    }

    res.json(tasks);

  } catch (err) {
    console.error("GET TASKS ERROR:", err);
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
      // ✅ Admin sees ALL tasks of the project
      tasks = await Task.find({
        project: projectId
      }).populate("assignee", "name").populate("comments.user", "name");
    } else {
      // ✅ User sees ONLY assigned tasks
      tasks = await Task.find({
        project: projectId,
        assignee: userId
      }).populate("assignee", "name").populate("comments.user", "name");
    }

    res.json(tasks);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.userId;

    console.log("BODY:", req.body);
    console.log("PARAMS:", req.params);
    console.log("USER:", req.user);

    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }

    if (!req.body.title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const task = new Task({
      title: req.body.title,
      description: req.body.description || "",
      priority: req.body.priority || "medium",
      due: req.body.due || null,
      assignee: req.body.assignee || null,
      project: projectId,
      owner: userId
    });

    const savedTask = await task.save();

    // Notify assignee
    if (savedTask.assignee) {
      await createNotification({
        userId: savedTask.assignee,
        type: "task_assigned",
        message: `You have been assigned a new task: "${savedTask.title}"`,
        taskId: savedTask._id,
        projectId: savedTask.project
      });
    }

    res.status(201).json(savedTask);

  } catch (error) {
    console.error("CREATE TASK ERROR:", error.message);
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
    const { title, description, priority, due, assignee, status, subtasks } = req.body
    const oldTask = await Task.findById(req.params.id);
    const oldAssignee = oldTask?.assignee;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, priority, due, assignee, status, subtasks },
      { new: true, runValidators: true }
    )

    if (!task) return res.status(404).json({ message: "Task not found" })

    // Notify if assignee changed
    if (assignee && assignee !== oldAssignee?.toString()) {
      await createNotification({
        userId: assignee,
        type: "task_assigned",
        message: `You have been assigned to task: "${task.title}"`,
        taskId: task._id,
        projectId: task.project
      });
    }

    res.json(task)
  } catch (err) {
    res.status(500).json({ message: "Failed to update task" })
  }
}

//comments

export const addComment = async (req, res) => {
  try {
    const { id } = req.params; // taskId
    const userId = req.user.userId;
    const role = req.user.role;
    const { text } = req.body;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // 🔒 Permission check
    const isAdmin = role === "admin";
    const isAssignee = task.assignee?.toString() === userId;

    if (!isAdmin && !isAssignee) {
      return res.status(403).json({ message: "Not allowed to comment" });
    }

    // ✅ Add comment
    const comment = {
      text,
      user: userId,
      createdAt: new Date()
    };

    task.comments = task.comments || [];
    task.comments.push(comment);

    await task.save();

    // 1. Notify assignee (if not the one who commented)
    if (task.assignee && task.assignee.toString() !== userId) {
      await createNotification({
        userId: task.assignee,
        type: "comment_added",
        message: `${req.user.name || "A user"} commented on your task: "${task.title}"`,
        taskId: task._id,
        projectId: task.project
      });
    }

    // 2. Handle mentions
    await handleMentions(text, userId, task._id, task.project, req.user.name || "A user");

    const populatedTask = await Task.findById(id).populate("assignee", "name").populate("comments.user", "name");

    res.json(populatedTask);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const editComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { text } = req.body;
    const userId = req.user.userId;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const comment = task.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Permission: author or admin
    if (comment.user.toString() !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to edit this comment" });
    }

    comment.text = text;
    comment.updatedAt = new Date();
    await task.save();

    const populatedTask = await Task.findById(id).populate("assignee", "name").populate("comments.user", "name");
    res.json(populatedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const userId = req.user.userId;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const comment = task.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Permission: author or admin
    if (comment.user.toString() !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    task.comments.pull(commentId);
    await task.save();

    const populatedTask = await Task.findById(id).populate("assignee", "name").populate("comments.user", "name");
    res.json(populatedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};