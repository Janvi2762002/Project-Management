const Project = require("../models/project");

exports.createProject = async (req, res) => {
  try {
    const { title, description } = req.body;

    const project = new Project({
      title,
      description,
      owner: req.user.userId
    });

    await project.save();

    res.status(201).json(project);

  } catch (error) {
    res.status(500).json({ message: "Error creating project" });
  }
};

exports.getProjects = async (req, res) => {
    try {
  
      const projects = await Project.find({
        owner: req.user.userId
      }).populate("owner", "name email");
  
      res.json(projects);
  
    } catch (error) {
      res.status(500).json({ message: "Error fetching projects" });
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