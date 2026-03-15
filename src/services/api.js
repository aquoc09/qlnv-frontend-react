import axios from "axios";

const api = axios.create({
  baseURL: "https://qlnv-backend-spring-production.up.railway.app/qlnv-spring",
  headers: {
    "Content-Type": "application/json"
  }
});

export default api;