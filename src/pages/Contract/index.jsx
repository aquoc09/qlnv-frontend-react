import React, { useEffect, useState } from 'react';
import contractApi from '../../api/contractApi';
import employeeApi from '../../api/employeeApi';

const ContractList = () => {
    const [contracts, setContracts] = useState([]);
    const [employees, setEmployees] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentContract, setCurrentContract] = useState(null);

    // 1. LẤY DỮ LIỆU TỪ BE (Hợp đồng & Nhân viên)
    const fetchData = async () => {
        setLoading(true);
        try {
            const [contractRes, employeeRes] = await Promise.all([
                contractApi.getAll(),
                employeeApi.getAll()
            ]);

            // Bóc tách Hợp đồng
            if (contractRes && contractRes.code === 1000) {
                setContracts(contractRes.result || []);
            } else if (Array.isArray(contractRes)) {
                setContracts(contractRes.map(item => item.result || item).filter(Boolean));
            }

            // Bóc tách Nhân viên để đổ vào ô Select
            if (employeeRes && employeeRes.code === 1000) {
                setEmployees(employeeRes.result || []);
            } else if (Array.isArray(employeeRes)) {
                const empData = employeeRes.map(item => item.result || item).filter(Boolean);
                setEmployees(empData);
            }
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // 2. XỬ LÝ XÓA
    const handleDelete = async (id) => {
        if (window.confirm(`Anh có chắc muốn xóa hợp đồng số ${id}?`)) {
            try {
                await contractApi.delete(id);
                alert("Xóa hợp đồng thành công!");
                fetchData();
            } catch (error) {
                alert("Lỗi: Không thể xóa hợp đồng này!");
            }
        }
    };

    // 3. XỬ LÝ LƯU (THÊM/SỬA)
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            if (currentContract) {
                const id = currentContract.id || currentContract.contractId || currentContract.contract_id;
                await contractApi.update(id, data);
                alert("Cập nhật hợp đồng thành công!");
            } else {
                await contractApi.create(data);
                alert("Ký hợp đồng mới thành công!");
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            alert("Lỗi khi lưu: Anh kiểm tra lại xem nhân viên này đã có hợp đồng chưa nhé!");
        }
    };

    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (loading) return <div style={{ padding: '20px' }}>Đang nạp dữ liệu từ hệ thống...</div>;

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
                            contracts.map((c) => {
                                const cId = c.id || c.contract_id || c.contractId;
                                return (
                                    <tr key={cId} style={styles.tr}>
                                        <td style={styles.td}><b>HĐ-{cId}</b></td>
                                        <td style={styles.td}>
                                            {c.employee?.fullName || c.employee?.full_name || `Mã NV: ${c.employee_id || c.employeeId}`}
                                        </td>
                                        <td style={styles.td}>{c.type}</td>
                                        <td style={{...styles.td, color: '#e67e22', fontWeight: 'bold'}}>
                                            {formatVND(c.baseSalary || c.base_salary || 0)}
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.statusBadge, 
                                                backgroundColor: (c.status === "Expired" || c.status === "Đã hết hạn") ? "#f8d7da" : "#d4edda",
                                                color: (c.status === "Expired" || c.status === "Đã hết hạn") ? "#721c24" : "#155724"
                                            }}>
                                                {c.status || "Đang hiệu lực"}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <button style={styles.editBtn} onClick={() => { setCurrentContract(c); setIsModalOpen(true); }}>Sửa</button>
                                            <button style={styles.deleteBtn} onClick={() => handleDelete(cId)}>Xóa</button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>Chưa có dữ liệu hợp đồng trong MySQL.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL THÊM/SỬA */}
            {isModalOpen && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h3>{currentContract ? "CẬP NHẬT HỢP ĐỒNG" : "KÝ HỢP ĐỒNG MỚI"}</h3>
                        <form onSubmit={handleSubmit}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Chọn nhân viên:</label>
                                <select 
                                    name="employeeId" 
                                    defaultValue={currentContract?.employee?.employee_id || currentContract?.employeeId} 
                                    style={styles.input} 
                                    required
                                >
                                    <option value="">-- Click để chọn nhân viên --</option>
                                    {employees.map(emp => (
                                        <option key={emp.employee_id || emp.id} value={emp.employee_id || emp.id}>
                                            {emp.full_name || emp.fullName} (ID: {emp.employee_id || emp.id})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Loại hợp đồng:</label>
                                <select name="type" defaultValue={currentContract?.type || "Chính thức"} style={styles.input}>
                                    <option value="Chính thức">Chính thức</option>
                                    <option value="Thử việc">Thử việc</option>
                                    <option value="Thời vụ">Thời vụ</option>
                                </select>
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Lương cơ bản:</label>
                                <input name="baseSalary" type="number" defaultValue={currentContract?.baseSalary || currentContract?.base_salary} style={styles.input} required/>
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Trạng thái:</label>
                                <select name="status" defaultValue={currentContract?.status || "Active"} style={styles.input}>
                                    <option value="Active">Đang hiệu lực</option>
                                    <option value="Expired">Đã hết hạn</option>
                                </select>
                            </div>
                            <div style={styles.btnGroup}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.btnCancel}>Hủy</button>
                                <button type="submit" style={styles.btnSave}>Lưu vào MySQL</button>
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
    header: { display: 'flex', justifyContent: 'space-between', marginBottom: '30px' },
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