import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // Cookies handle panna ithu mukkiyam
});

export default api;
