const API_URL = "http://localhost:5000";

// Centralized fetch with 401 handling
const apiFetch = async (url: string, options: RequestInit = {}) => {
  const res = await fetch(url, options);
  
  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/?expired=true";
    throw new Error("Session expired");
  }

  return res.json();
};

type loginData = {
  email: string;
  password: string;
};

type registerData = {
  name: string;
  email: string;
  password: string;
  role:string;
};

export const loginUser = async (data: loginData) => {
  return apiFetch(`${API_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
};

export const registerUser = async (data: registerData) => {
  return apiFetch(`${API_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
};

export const getProjects = async () => {
  const token = localStorage.getItem("token");
  return apiFetch(`${API_URL}/projects`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const createProject = async (data: {
  title: string
  description: string
}) => {
  const token = localStorage.getItem("token");
  return apiFetch(`${API_URL}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
};

export const deleteProject = async (id: string) => {
  const token = localStorage.getItem("token");
  return apiFetch(`${API_URL}/projects/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
};

//tasks

export const getAllTasks = async () => {
  const token = localStorage.getItem("token");
  return apiFetch(`${API_URL}/tasks`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getUsers= async () => {
  const token = localStorage.getItem("token");
  return apiFetch(`${API_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const chatbotQuery = async (query: string, projectId?: string | null) => {
  const token = localStorage.getItem("token");
  return apiFetch(`${API_URL}/chatbot/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ query, projectId: projectId || null })
  });
};

export const createComment = async (taskId: string, formData: FormData) => {
  const token = localStorage.getItem("token");
  return apiFetch(`${API_URL}/tasks/${taskId}/comment`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });
};

export const uploadChatFiles = async (formData: FormData) => {
  const token = localStorage.getItem("token");
  return apiFetch(`${API_URL}/chat/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });
};