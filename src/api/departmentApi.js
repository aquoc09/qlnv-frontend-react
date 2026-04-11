import axiosClient from "./axiosClient";

const departmentApi = {
    // 1. Lấy toàn bộ danh sách phòng ban
    // URL: GET http://localhost:8080/qlnv-spring/departments
    getAll: () => {
        return axiosClient.get('/departments');
    },
    
    // 2. Lấy chi tiết 1 phòng ban
    // URL: GET http://localhost:8080/qlnv-spring/departments/{id}
    get: (id) => {
        return axiosClient.get(`/departments/${id}`);
    },

    // 3. Thêm mới phòng ban
    // URL: POST http://localhost:8080/qlnv-spring/departments
    create: (data) => {
        return axiosClient.post('/departments', data);
    },

    // 4. Cập nhật phòng ban
    // URL: PUT http://localhost:8080/qlnv-spring/departments/{id}
    update: (id, data) => {
        return axiosClient.put(`/departments/${id}`, data);
    },

    // 5. Xóa phòng ban
    // URL: DELETE http://localhost:8080/qlnv-spring/departments/{id}
    delete: (id) => {
        return axiosClient.delete(`/departments/${id}`);
    },
};

export default departmentApi;