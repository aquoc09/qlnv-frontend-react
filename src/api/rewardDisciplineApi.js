import axiosClient from "./axiosClient";

const rewardDisciplineApi = {
    // 1. Lấy toàn bộ danh sách thưởng phạt
    getAll: () => axiosClient.get('/reward-disciplines'),
    
    // 2. Tạo quyết định mới (Thưởng hoặc Phạt)
    create: (data) => axiosClient.post('/reward-disciplines', data),
    
    // 3. Xóa quyết định (nếu nhập sai)
    delete: (id) => axiosClient.delete(`/reward-disciplines/${id}`),
};

export default rewardDisciplineApi;