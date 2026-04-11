import axiosClient from "./axiosClient";

const attendanceApi = {
    // Lấy danh sách chấm công (thường theo User đang đăng nhập hoặc tất cả nếu là Admin)
    getAll: () => axiosClient.get('/attendance'),
    
    // Ghi nhận giờ vào
    checkIn: () => axiosClient.post('/attendance/checkin'),
    
    // Ghi nhận giờ ra
    checkOut: () => axiosClient.post('/attendance/checkout'),
    
    // Xóa bản ghi (nếu Admin cần điều chỉnh)
    delete: (id) => axiosClient.delete(`/attendance/${id}`),
};

export default attendanceApi;