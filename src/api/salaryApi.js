import axiosClient from "./axiosClient";

const salaryApi = {
    // Lấy danh sách bảng lương từ localhost:8080/qlnv-spring/salary
    getAll: () => axiosClient.get('/salary'),
};

export default salaryApi;