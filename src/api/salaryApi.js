import axiosClient from "./axiosClient";

const salaryApi = {
    // 1. Lấy toàn bộ bảng lương từ MySQL
    getAll: () => axiosClient.get('/salaries'),
    
    // 2. Chức năng quan trọng: Lệnh cho BE bắt đầu tính toán lương tháng hiện tại
    calculate: (month, year) => axiosClient.post(`/salaries/calculate?month=${month}&year=${year}`),
    
    // 3. Cập nhật trạng thái (Duyệt chi / Đã trả lương)
    updateStatus: (id, status) => axiosClient.put(`/salaries/${id}/status?status=${status}`),
    
    // 4. Xóa bản ghi lương (nếu tính sai)
    delete: (id) => axiosClient.delete(`/salaries/${id}`),
};

export default salaryApi;