import axiosClient from "./axiosClient";

const contractApi = {
    // Lấy danh sách tất cả hợp đồng từ localhost:8080/qlnv-spring/contracts
    getAll: () => axiosClient.get('/contracts'),
    
    get: (id) => axiosClient.get(`/contracts/${id}`),
    create: (data) => axiosClient.post('/contracts', data),
    update: (id, data) => axiosClient.put(`/contracts/${id}`, data),
    delete: (id) => axiosClient.delete(`/contracts/${id}`),
};

export default contractApi;