import axiosClient from "./axiosClient";

const leaveRecordApi = {
    // Lấy toàn bộ danh sách đơn nghỉ phép
    getAll: () => axiosClient.get('/leave-record'),
};

export default leaveRecordApi;