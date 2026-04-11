import React, { useEffect, useState } from 'react';
import contractApi from '../../api/contractApi';
import employeeApi from '../../api/employeeApi';

const ContractList = () => {
    const [contracts, setContracts] = useState([]);
    const [employees, setEmployees] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentContract, setCurrentContract] = useState(null);

    // HÀM BÓC TÁCH DỮ LIỆU TỪ LỚP VỎ result (Nhìn F12 của anh để lột vỏ)
    const cleanData = (res) => {
        const raw = Array.isArray(res) ? res : (res?.result || []);
        return raw.map(item => (item.result ? item.result : item));
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [contractRes, employeeRes] = await Promise.all([
                contractApi.getAll(),
                employeeApi.getAll()
            ]);

            setContracts(cleanData(contractRes));
            setEmployees(cleanData(employeeRes));
        } catch (error) {
            console.error("Lỗi kết nối MySQL:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // XỬ LÝ KHI NHẤN NÚT SỬA (Quan trọng: Phải lấy đúng ruột dữ liệu)
    const handleEdit = (contract) => {
        // Đảm bảo dữ liệu đưa vào Modal là dữ liệu đã bóc tách
        setCurrentContract(contract);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const rawData = Object.fromEntries(formData.entries());

        // CHUẨN HÓA DỮ LIỆU GỬI XUỐNG BE JAVA
        const dataToSend = {
            ...rawData,
            employeeId: Number(rawData.employeeId),
            baseSalary: Number(rawData.baseSalary),
            status: rawData.status
        };

        try {
            if (currentContract) {
                // Lấy ID thật sự sau khi đã bóc vỏ result
                const id = currentContract.id || currentContract.contractId || currentContract.contract_id;
                await contractApi.update(id, dataToSend);
                alert("Đã cập nhật hợp đồng vào MySQL!");
            } else {
                await contractApi.create(dataToSend);
                alert("Đã ký hợp đồng mới thành công!");
            }
            setIsModalOpen(false);
            await fetchData(); // Ép bảng cập nhật ngay lập tức
        } catch (error) {
            console.error("Lỗi BE trả về:", error.response?.data);
            alert("Lỗi: " + (error.response?.data?.message || "999 - Không có quyền hoặc sai dữ liệu!"));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Anh có chắc muốn hủy hợp đồng này?")) return;
        try {
            await contractApi.delete(id);
            fetchData();
        } catch (error) {
            alert("Lỗi xóa: " + (error.response?.data?.message || "999"));
        }
    };

    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
    };

    if (loading) return <div style={{ padding: '20px' }}>Đang nạp dữ liệu hợp đồng...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>| QUẢN LÝ HỢP ĐỒNG</h2>
                <button 
                    style={styles.addButton} 
                    onClick={() => { setCurrentContract(null); setIsModalOpen(true); }}
                >
                    + Ký hợp đồng mới
                </button>
            </div>
            
            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeader}>
                            <th style={styles.th}>SỐ HĐ</th>
                            <th style={styles.th}>Nhân viên</th>
                            <th style={styles.th}>Loại HĐ</th>
                            <th style={styles.th}>Lương CB</th>
                            <th style={styles.th}>Trạng thái</th>
                            <th style={styles.th}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contracts.length > 0 ? (
                            contracts.map((c, index) => {
                                const cId = c.id || c.contract_id || c.contractId;
                                return (
                                    <tr key={cId || index} style={styles.tr}>
                                        <td style={styles.td}><b>HĐ-{cId}</b></td>
                                        <td style={styles.td}>
                                            <b>{c.employee?.fullName || c.employee?.full_name || `Mã NV: ${c.employeeId || c.employee_id}`}</b>
                                        </td>
                                        <td style={styles.td}>{c.type || c.contractType || 'FULL_TIME'}</td>
                                        <td style={{...styles.td, color: '#e67e22', fontWeight: 'bold'}}>
                                            {formatVND(c.baseSalary || c.base_salary)}
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.statusBadge, 
                                                backgroundColor: (c.status === "EXPIRED" || c.status === "ENDED") ? "#f8d7da" : "#d4edda",
                                                color: (c.status === "EXPIRED" || c.status === "ENDED") ? "#721c24" : "#155724"
                                            }}>
                                                {c.status || "ACTIVE"}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <button style={styles.editBtn} onClick={() => handleEdit(c)}>Sửa</button>
                                            <button style={styles.deleteBtn} onClick={() => handleDelete(cId)}>Xóa</button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>Bảng trống. Hãy ký hợp đồng mới!</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h3>{currentContract ? "CẬP NHẬT HỢP ĐỒNG" : "KÝ HỢP ĐỒNG MỚI"}</h3>
                        <form onSubmit={handleSubmit}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Nhân viên:</label>
                                <select 
                                    name="employeeId" 
                                    defaultValue={currentContract?.employeeId || currentContract?.employee_id} 
                                    style={styles.input} 
                                    disabled={!!currentContract} // Không cho đổi nhân viên khi sửa
                                    required
                                >
                                    <option value="">-- Chọn nhân viên --</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.fullName} (ID: {emp.id})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Loại hợp đồng:</label>
                                <select name="type" defaultValue={currentContract?.type || "FULL_TIME"} style={styles.input}>
                                    <option value="FULL_TIME">Chính thức</option>
                                    <option value="PART_TIME">Bán thời gian</option>
                                    <option value="TRIAL">Thử việc</option>
                                </select>
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Lương cơ bản:</label>
                                <input name="baseSalary" type="number" defaultValue={currentContract?.baseSalary || currentContract?.base_salary} style={styles.input} required/>
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Trạng thái:</label>
                                <select name="status" defaultValue={currentContract?.status || "ACTIVE"} style={styles.input}>
                                    <option value="ACTIVE">Đang hiệu lực</option>
                                    <option value="EXPIRED">Đã hết hạn</option>
                                    <option value="ENDED">Đã chấm dứt</option>
                                </select>
                            </div>
                            <div style={styles.btnGroup}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.btnCancel}>Hủy</button>
                                <button type="submit" style={styles.btnSave}>Lưu MySQL</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: { padding: '40px', backgroundColor: '#f4f7f6', minHeight: '100vh' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    title: { margin: 0, color: '#2c3e50', fontSize: '24px' },
    addButton: { padding: '12px 20px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
    tableWrapper: { backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { backgroundColor: '#34495e', color: '#fff' },
    th: { padding: '15px', textAlign: 'left' },
    td: { padding: '15px', borderBottom: '1px solid #eee' },
    tr: { transition: '0.3s' },
    editBtn: { padding: '5px 10px', backgroundColor: '#ffc107', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px', fontWeight: 'bold' },
    deleteBtn: { padding: '5px 10px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
    statusBadge: { padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', width: '400px' },
    inputGroup: { marginBottom: '15px' },
    label: { display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '13px' },
    input: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' },
    btnGroup: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
    btnCancel: { padding: '10px 20px', backgroundColor: '#eee', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    btnSave: { padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }
};

export default ContractList;