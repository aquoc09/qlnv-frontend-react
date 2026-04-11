import axiosClient from "./axiosClient";

const leaveRecordApi = {
    // Lấy tất cả đơn nghỉ từ MySQL
    getAll: () => axiosClient.get('/leave-records'),
    
    // Tạo đơn nghỉ mới
    create: (data) => axiosClient.post('/leave-records', data),
    
    // Duyệt hoặc Từ chối (Dùng Request Param ?status=...)
    updateStatus: (id, status) => axiosClient.put(`/leave-records/${id}/status?status=${status}`),
    
    // Xóa đơn nghỉ
    delete: (id) => axiosClient.delete(`/leave-records/${id}`),
};

export default leaveRecordApi;