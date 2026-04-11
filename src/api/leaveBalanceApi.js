import axiosClient from "./axiosClient";

const leaveBalanceApi = {
    // Lấy danh sách quỹ phép từ localhost:8080/qlnv-spring/leave-balance
    getAll: () => axiosClient.get('/leave-balance'),
};

export default leaveBalanceApi;