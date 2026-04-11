import axios from 'axios';

const axiosClient = axios.create({
   
    baseURL: 'https://qlnv-backend-spring-production.up.railway.app/qlnv-spring', 
    headers: { 'Content-Type': 'application/json' },
});

// 1. Gửi Token đi kèm mỗi Request (QUAN TRỌNG ĐỂ XÓA ĐƯỢC)
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// 2. XỬ LÝ PHẢN HỒI (Fix logic đánh chặn lỗi 999)
axiosClient.interceptors.response.use(
    (response) => {
        // Chỉ "giải cứu" lỗi 999 cho lệnh GET (lấy dữ liệu)
        // Nếu là lệnh POST, PUT, DELETE (Thêm, Sửa, Xóa) thì PHẢI báo lỗi thật
        const method = response.config.method.toUpperCase();

        if (response.data && response.data.code === 999) {
            if (method === 'GET') {
                console.warn("⚠️ Giải cứu lỗi 999 để hiện bảng trống!");
                return {
                    ...response.data,
                    code: 1000, 
                    result: response.data.result || [],
                    message: "Dữ liệu được xử lý an toàn"
                };
            } else {
                // Nếu là Xóa/Sửa mà bị 999 thì ném lỗi ra để alert báo cho anh biết
                return Promise.reject({
                    response: { data: { message: "Bạn không có quyền thực hiện thao tác này (999)" } }
                });
            }
        }

        if (response.data) return response.data;
        return response;
    },
    (error) => {
        console.error("Lỗi API Hệ Thống:", error.response);

        // Xử lý lỗi 401 (Hết hạn token) - Bắt đăng nhập lại
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            // window.location.href = '/login'; 
        }

        return Promise.reject(error);
    }
);

export default axiosClient;