import axios from "axios";

const api = axios.create({
  baseURL: "https://qlnv-backend-spring-production.up.railway.app/qlnv-spring",
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use(config => {
  const userData = localStorage.getItem("user");

  if (userData) {
    const user = JSON.parse(userData);

    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  }

  return config;
});

export default api;