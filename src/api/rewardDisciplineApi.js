import axiosClient from "./axiosClient";

const rewardDisciplineApi = {
    // Lấy danh sách thưởng phạt từ localhost:8080/qlnv-spring/reward-discipline
    getAll: () => axiosClient.get('/reward-discipline'),
};

export default rewardDisciplineApi;