import axiosClient from "./axiosClient";

const attendanceApi = {
    // Gọi API lấy danh sách chấm công từ BE
    getAll: () => axiosClient.get('/attendance'),
};

export default attendanceApi;