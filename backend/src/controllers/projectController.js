const Project = require("../models/project");
const Task = require("../models/task")

// exports.createProject = async (req, res) => {
//   try {
//     const { title, description } = req.body;

//     const project = new Project({
//       title,
//       description,
//       owner: req.user.userId
//     });

//     await project.save();

//     res.status(201).json(project);

//   } catch (error) {
//     res.status(500).json({ message: "Error creating project" });
//   }
// };

exports.createProject = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can create projects" });
    }

    const project = new Project({
      title: req.body.title,
      description: req.body.description,
      owner: req.user.userId
    });

    await project.save();

    res.status(201).json(project);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// exports.getProjects = async (req, res) => {
//     try {
  
//       const projects = await Project.find({
//         owner: req.user.userId
//       }).populate("owner", "name email");
  
//       res.json(projects);
  
//     } catch (error) {
//       res.status(500).json({ message: "Error fetching projects" });
//     }
//   };

exports.getProjects = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    let projects;

    if (role === "admin") {
      // Admin sees all projects
      projects = await Project.find({});
    } else {
      // User sees only projects where they have tasks
      const tasks = await Task.find({ assignee: userId });

      const projectIds = [...new Set(tasks.map(t => t.project.toString()))];

      projects = await Project.find({
        _id: { $in: projectIds }
      });
    }

    res.json(projects);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

  exports.deleteProject = async (req, res) => {
    try {
  
      const project = await Project.findByIdAndDelete(req.params.id);
  
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
  
      res.json({ message: "Project deleted" });
  
    } catch (error) {
      res.status(500).json({ message: "Error deleting project" });
    }
  };