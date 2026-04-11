import axiosClient from "./axiosClient";

const userApi = {
    // 1. Lấy toàn bộ danh sách tài khoản
    // URL: GET http://localhost:8080/qlnv-spring/users
    getAll: () => {
        return axiosClient.get('/users');
    },

    // 2. Lấy thông tin chi tiết 1 tài khoản
    // URL: GET http://localhost:8080/qlnv-spring/users/{userId}
    get: (id) => {
        return axiosClient.get(`/users/${id}`);
    },

    // 3. Thêm mới tài khoản (Đăng ký)
    // URL: POST http://localhost:8080/qlnv-spring/users
    create: (data) => {
        return axiosClient.post('/users', data);
    },

    // 4. Cập nhật thông tin tài khoản (Sửa tên, ngày sinh...)
    // URL: PUT http://localhost:8080/qlnv-spring/users/{userId}
    update: (id, data) => {
        return axiosClient.put(`/users/${id}`, data);
    },

    // 5. Xóa tài khoản
    // URL: DELETE http://localhost:8080/qlnv-spring/users/{userId}
    delete: (id) => {
        return axiosClient.delete(`/users/${id}`);
    }
};

export default userApi;