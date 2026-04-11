import axiosClient from "./axiosClient";

const leaveBalanceApi = {
    // Lấy toàn bộ danh sách quỹ phép từ MySQL
    getAll: () => axiosClient.get('/leave-balances'),
    
    // Cập nhật số ngày phép (điều chỉnh thủ công)
    // URL: PUT /leave-balances/{id}
    update: (id, data) => axiosClient.put(`/leave-balances/${id}`, data),
};

export default leaveBalanceApi;