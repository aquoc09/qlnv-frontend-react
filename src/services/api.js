import axios from 'axios';

const api = axios.create({
    // Trong Vite, dùng import.meta.env thay vì process.env
    // Nếu không có biến môi trường, sẽ mặc định lấy http://localhost:3001
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001' 
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