import axiosClient from "./axiosClient";

const authApi = {
    // Gửi yêu cầu đăng nhập tới localhost:8080/qlnv-spring/auth/login
    login: (credentials) => {
        return axiosClient.post('/auth/login', credentials);
    },
    
    // Kiểm tra token (nếu cần)
    introspect: (token) => {
        return axiosClient.post('/auth/introspect', { token });
    }
};

export default authApi;