
const API_URL = "http://localhost:5000";

type LoginData = {
  email: string;
  password: string;
};

export const loginUser = async (data: LoginData) => {
  const res = await fetch(`${API_URL}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return res.json();
};
export const getProjects = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/projects`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return res.json();
};

export const createProject = async (data: {
  title: string
  description: string
}) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  return res.json();
};

export const deleteProject = async (id: string) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/projects/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return res.json();
};

//tasks

export const getAllTasks = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/tasks`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return res.json();
};