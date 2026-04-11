import axios from 'axios';

const axiosClient = axios.create({
    // 1. Tự động đổi link giữa máy nhà và server online
    baseURL: window.location.hostname === 'localhost' 
        ? 'http://localhost:8080/qlnv-spring' 
        : 'https://qlnv-backend-spring-production.up.railway.app/qlnv-spring',
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. GỬI TOKEN (QUAN TRỌNG NHẤT: Để BE biết anh là Admin và cho lấy tên nhân viên)
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// 3. XỬ LÝ PHẢN HỒI (BỎ ĐOẠN GIẢ CỨU 999 ĐỂ HIỆN LỖI THẬT)
axiosClient.interceptors.response.use(
    (response) => {
        // Nếu BE trả về data thì lấy data, không cần chế biến code 999 thành 1000 nữa
        if (response.data) return response.data;
        return response;
    },
    (error) => {
        // Nếu lỗi 401 (Hết hạn hoặc sai Token) thì đá về Login
        if (error.response && error.response.status === 401) {
            console.error("Phiên đăng nhập hết hạn!");
            localStorage.removeItem('token');
            // window.location.href = '/login'; 
        }
        
        // In lỗi ra Console để anh em mình bắt bệnh
        console.error("Lỗi API:", error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default axiosClient;