import Message from "../models/message.js";
import Project from "../models/project.js";
import Task from "../models/task.js";

export const getProjectMessages = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId, role } = req.user;

    // Membership check
    if (role !== "admin") {
      const project = await Project.findById(projectId);
      if (!project) return res.status(404).json({ message: "Project not found" });

      // Check if user is owner or specifically in members list
      const isDirectMember = project.owner.toString() === userId || 
                             project.members.some(m => m.toString() === userId);

      if (!isDirectMember) {
        // Also check if assigned via tasks (consistent with projectController.js)
        const hasTask = await Task.findOne({ project: projectId, assignee: userId });
        if (!hasTask) {
          return res.status(403).json({ message: "You are not a member of this project" });
        }
      }
    }

    const messages = await Message.find({ project: projectId })
      .populate("user", "name")
      .sort({ createdAt: 1 }) // oldest to newest
      .limit(100);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};
