import axiosClient from "./axiosClient";

const leaveApi = {
    // API lấy danh sách loại nghỉ từ localhost:8080/qlnv-spring/leaves
    getAll: () => axiosClient.get('/leaves'),
};

export default leaveApi;