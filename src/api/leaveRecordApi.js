import axiosClient from "./axiosClient";

const leaveRecordApi = {
    // 1. Lấy danh sách đơn nghỉ phép
    getAll: () => {
        return axiosClient.get("/leave-records");
    },

    // 2. Tạo đơn mới
    create: (data) => {
        return axiosClient.post("/leave-records", data);
    },

    // 3. Cập nhật đơn (Gửi nguyên object để BE nhận diện tốt nhất)
    update: (id, data) => {
        return axiosClient.put(`/leave-records/${id}`, data);
    },

    // 4. Xóa đơn
    delete: (id) => {
        return axiosClient.delete(`/leave-records/${id}`);
    },
};

export default leaveRecordApi;
