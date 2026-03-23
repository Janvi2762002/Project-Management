const Task = require("../models/task");


exports.getAllTasks = async (req, res) => {
  const tasks = await Task.find({});
  res.json(tasks);
};

exports.getTasks = async (req, res) => {

  const tasks = await Task.find({
    project: req.params.projectId
  });

  res.json(tasks);
};

exports.createTask = async (req, res) => {

  const task = new Task({
    title: req.body.title,
    description: req.body.description,
    project: req.params.projectId
  });

  await task.save();

  res.json(task);
};

exports.deleteTask = async (req, res) => {

  const task = await Task.findByIdAndDelete(req.params.id);

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  res.json({ message: "Task deleted" });
};

exports.updateTaskStatus = async (req, res) => {

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

exports.updateTask = async (req, res) => {
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