import React, { useEffect, useState } from 'react';
import contractApi from '../../api/contractApi';
import employeeApi from '../../api/employeeApi';

const ContractList = () => {
    const [contracts, setContracts] = useState([]);
    const [employees, setEmployees] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentContract, setCurrentContract] = useState(null);

    // 1. LẤY DỮ LIỆU TỪ BE (Bóc trần 100%)
    const fetchData = async () => {
        setLoading(true);
        try {
            const [contractRes, employeeRes] = await Promise.all([
                contractApi.getAll(),
                employeeApi.getAll()
            ]);

            const cleanData = (res) => {
                const raw = Array.isArray(res) ? res : (res?.result || []);
                return raw.map(item => (item.result ? item.result : item));
            };

            setContracts(cleanData(contractRes));
            setEmployees(cleanData(employeeRes));
        } catch (error) {
            console.error("Lỗi MySQL:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // 2. XỬ LÝ LƯU (BÓC TRẦN DỮ LIỆU THÊM MỚI)
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const rawData = Object.fromEntries(formData.entries());

        const dataToSend = {
            ...rawData,
            employeeId: Number(rawData.employeeId),
            baseSalary: Number(rawData.baseSalary)
        };

        try {
            if (currentContract) {
                const id = currentContract.id || currentContract.contractId;
                await contractApi.update(id, dataToSend);
                alert("Cập nhật hợp đồng thành công!");
            } else {
                // KHI THÊM MỚI: Bắt BE bóc trần dữ liệu trả về
                const response = await contractApi.create(dataToSend);
                console.log("Dữ liệu BE trả về khi thêm:", response);
                alert("Đã ký hợp đồng mới thành công vào MySQL!");
            }
            setIsModalOpen(false);
            // GỌI LẠI FETCH ĐỂ CẬP NHẬT BẢNG NGAY LẬP TỨC
            await fetchData(); 
        } catch (error) {
            alert("Lỗi: Có thể nhân viên này đã có hợp đồng rồi!");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm(`Xóa hợp đồng số ${id}?`)) {
            try {
                await contractApi.delete(id);
                fetchData();
            } catch (error) {
                alert("Lỗi xóa: Kiểm tra quyền Admin 999");
            }
        }
    };

    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
    };

    if (loading) return <div style={{ padding: '20px' }}>Đang nạp hợp đồng từ MySQL...</div>;

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
                                            {c.employee?.fullName || c.employee?.full_name || `Mã NV: ${c.employeeId || c.employee_id}`}
                                        </td>
                                        <td style={styles.td}>{c.type || c.contractType}</td>
                                        <td style={{...styles.td, color: '#e67e22', fontWeight: 'bold'}}>
                                            {formatVND(c.baseSalary || c.base_salary)}
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
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>Chưa có hợp đồng nào.</td></tr>
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
                                <select name="type" defaultValue={currentContract?.type || "Chính thức"} style={styles.input}>
                                    <option value="Chính thức">Chính thức</option>
                                    <option value="Thử việc">Thử việc</option>
                                    <option value="Thời vụ">Thời vụ</option>
                                </select>
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Lương cơ bản:</label>
                                <input name="baseSalary" type="number" defaultValue={currentContract?.baseSalary} style={styles.input} required/>
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