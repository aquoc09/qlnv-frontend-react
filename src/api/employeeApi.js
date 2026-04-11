import axiosClient from "./axiosClient";

const employeeApi = {
    // Lấy toàn bộ danh sách nhân viên
    getAll: () => {
        return axiosClient.get('/employees');
    },

    // Lấy chi tiết 1 nhân viên theo ID
    get: (id) => {
        return axiosClient.get(`/employees/${id}`);
    },

    // Thêm mới nhân viên (Gửi dữ liệu dạng JSON)
    create: (data) => {
        return axiosClient.post('/employees', data);
    },

    // Cập nhật thông tin nhân viên (Gửi ID và dữ liệu mới)
    update: (id, data) => {
        return axiosClient.put(`/employees/${id}`, data);
    },

    // Xóa nhân viên khỏi hệ thống
    delete: (id) => {
        return axiosClient.delete(`/employees/${id}`);
    }
};

export default employeeApi;