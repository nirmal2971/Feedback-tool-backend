// src/api/axios.jsx
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // 👈 CRA expects REACT_APP_ prefix
});

export const loginUser = async (credentials) => {
  const response = await api.post("/login", new URLSearchParams(credentials));
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post("/register", userData);
  return response.data;
};

export default api;
