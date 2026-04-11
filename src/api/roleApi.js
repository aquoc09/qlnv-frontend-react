import axiosClient from "./axiosClient";

const roleApi = {
    // Lấy danh sách các quyền từ localhost:8080/qlnv-spring/roles
    getAll: () => axiosClient.get('/roles'),
};

export default roleApi;