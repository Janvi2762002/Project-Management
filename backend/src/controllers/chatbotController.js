import Task from "../models/task.js";
import Project from "../models/project.js";
import User from "../models/user.js";

const today = () => new Date().toISOString().split("T")[0];

export const processQuery = async (req, res) => {
  try {
    const { query, projectId } = req.body;
    const userId = req.user.userId;
    const userName = req.user.name;

    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    const lowerQuery = query.toLowerCase();

    // 1. Task Queries
    if (lowerQuery.includes("show my tasks")) {
      const tasks = await Task.find({ assignee: userId })
        .populate("project", "title")
        .sort({ updatedAt: -1 });

      if (tasks.length === 0) {
        return res.json({
          answer: "You don't have any tasks assigned to you right now.",
          type: "text"
        });
      }

      const taskList = tasks.map(t => `- ${t.title} (${t.status}, Project: ${t.project?.title || "N/A"})`).join("\n");
      return res.json({
        answer: `Here are your tasks:\n${taskList}`,
        tasks: tasks,
        type: "task_list"
      });
    }

    if (lowerQuery.includes("overdue tasks")) {
      const overdueTasks = await Task.find({
        assignee: userId,
        due: { $lt: today() },
        status: { $ne: "done" }
      }).populate("project", "title");

      if (overdueTasks.length === 0) {
        return res.json({
          answer: "Great news! You have no overdue tasks.",
          type: "text"
        });
      }

      const taskList = overdueTasks.map(t => `- ${t.title} (Due: ${t.due})`).join("\n");
      return res.json({
        answer: `You have ${overdueTasks.length} overdue tasks:\n${taskList}`,
        tasks: overdueTasks,
        type: "task_list"
      });
    }

    if (lowerQuery.includes("tasks due today")) {
      const todayTasks = await Task.find({
        assignee: userId,
        due: today()
      }).populate("project", "title");

      if (todayTasks.length === 0) {
        return res.json({
          answer: "No tasks due today. Enjoy your day!",
          type: "text"
        });
      }

      const taskList = todayTasks.map(t => `- ${t.title}`).join("\n");
      return res.json({
        answer: `Tasks due today:\n${taskList}`,
        tasks: todayTasks,
        type: "task_list"
      });
    }

    // 2. Task Creation
    // Format: "Create task: [title], [priority]"
    if (lowerQuery.startsWith("create task:")) {
      if (!projectId) {
        return res.json({
          answer: "Please select a project first or navigate to a project page to create a task via chat.",
          type: "text"
        });
      }

      const parts = query.substring(12).split(",");
      const title = parts[0]?.trim();
      const priority = parts[1]?.trim().toLowerCase() || "medium";

      if (!title) {
        return res.json({
          answer: "I couldn't find a task title. Please use the format: 'Create task: [title], [priority]'",
          type: "text"
        });
      }

      const validPriorities = ["high", "medium", "low"];
      const finalPriority = validPriorities.includes(priority) ? priority : "medium";

      const newTask = new Task({
        title,
        priority: finalPriority,
        project: projectId,
        owner: userId,
        assignee: userId, // Defaulting to the creator for now
        due: today(), // Defaulting to today
      });

      await newTask.save();

      return res.json({
        answer: `Done! I've created the task "${title}" with ${finalPriority} priority and assigned it to you.`,
        task: newTask,
        type: "task_created"
      });
    }

    // 3. Project Insights
    // Format: "Summarize project [name]"
    if (lowerQuery.includes("summarize project")) {
      let targetProject;
      
      if (lowerQuery.includes("summarize project ")) {
        const projectName = query.split(/summarize project /i)[1]?.trim();
        targetProject = await Project.findOne({ title: new RegExp(`^${projectName}$`, "i") });
      } else if (projectId) {
        targetProject = await Project.findById(projectId);
      }

      if (!targetProject) {
        return res.json({
          answer: "I couldn't find that project. Try 'Summarize project Alpha'.",
          type: "text"
        });
      }

      const tasks = await Task.find({ project: targetProject._id });
      const total = tasks.length;
      const done = tasks.filter(t => t.status === "done").length;
      const inProgress = tasks.filter(t => t.status === "inprogress").length;
      const todo = tasks.filter(t => t.status === "todo").length;
      const highPriority = tasks.filter(t => t.priority === "high").length;

      const progress = total ? Math.round((done / total) * 100) : 0;

      return res.json({
        answer: `### Project Summary: ${targetProject.title}\n\n` +
                `- **Progress:** ${progress}%\n` +
                `- **Total Tasks:** ${total}\n` +
                `- **To Do:** ${todo}\n` +
                `- **In Progress:** ${inProgress}\n` +
                `- **Done:** ${done}\n` +
                `- **High Priority Issues:** ${highPriority}`,
        type: "markdown"
      });
    }

    // 4. Comment Insights
    if (lowerQuery.includes("recent comments") || lowerQuery.includes("summarize activity")) {
      if (!projectId) {
        return res.json({
          answer: "Please navigate to a project to see recent activity.",
          type: "text"
        });
      }

      const tasks = await Task.find({ project: projectId }).populate("comments.user", "name");
      let allComments = [];
      tasks.forEach(t => {
        if (t.comments) {
          t.comments.forEach(c => {
            allComments.push({
              text: c.text,
              user: c.user?.name || "Unknown",
              task: t.title,
              date: c.createdAt
            });
          });
        }
      });

      // Sort by date descending
      allComments.sort((a, b) => new Date(b.date) - new Date(a.date));
      const recent = allComments.slice(0, 5);

      if (recent.length === 0) {
        return res.json({
          answer: "There are no recent comments in this project.",
          type: "text"
        });
      }

      const commentList = recent.map(c => `**${c.user}** on *${c.task}*: "${c.text}"`).join("\n\n");
      return res.json({
        answer: `### Recent Activity:\n\n${commentList}`,
        type: "markdown"
      });
    }

    // Default Fallback
    return res.json({
      answer: "I'm not sure how to help with that. You can ask me to show your tasks, create a task, or summarize a project.",
      type: "text"
    });

  } catch (error) {
    console.error("CHATBOT ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
