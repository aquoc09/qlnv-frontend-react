import axiosClient from "./axiosClient";

const leaveBalanceApi = {
    getAll: () => axiosClient.get('/leave-balances'),
    // Cập nhật số ngày (Dùng để cộng thêm phép hoặc điều chỉnh sai sót)
    update: (id, data) => axiosClient.put(`/leave-balances/${id}`, data),
    // Một số BE có hàm reset quỹ phép đầu năm
    reset: () => axiosClient.post('/leave-balances/reset'),
};

export default leaveBalanceApi;