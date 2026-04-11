import axiosClient from "./axiosClient";

const roleApi = {
    // 1. Lấy tất cả các vai trò (ADMIN, USER, HR...)
    getAll: () => axiosClient.get('/roles'),
    
    // 2. Tạo một vai trò mới
    create: (data) => axiosClient.post('/roles', data),
    
    // 3. Xóa vai trò (Dùng tên hoặc ID tùy BE anh cấu hình)
    delete: (roleName) => axiosClient.delete(`/roles/${roleName}`),
};

export default roleApi;