import React, { useEffect, useState } from 'react';
import rewardDisciplineApi from '../../api/rewardDisciplineApi';
import employeeApi from '../../api/employeeApi'; // Cần để chọn nhân viên

const RewardDisciplineList = () => {
    const [list, setList] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 1. LẤY DATA THẬT TỪ BE
    const fetchData = async () => {
        setLoading(true);
        try {
            const [resData, resEmp] = await Promise.all([
                rewardDisciplineApi.getAll(),
                employeeApi.getAll()
            ]);

            if (resData && resData.code === 1000) setList(resData.result || []);
            if (resEmp && resEmp.code === 1000) setEmployees(resEmp.result || []);
        } catch (error) {
            console.error("Lỗi kết nối MySQL:", error);
            setList([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // 2. XỬ LÝ THÊM MỚI
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            await rewardDisciplineApi.create(data);
            alert("Đã lưu quyết định Khen thưởng/Kỷ luật!");
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            alert("Lỗi: Không thể lưu dữ liệu!");
        }
    };

    // 3. XỬ LÝ XÓA
    const handleDelete = async (id) => {
        if (window.confirm("Anh có chắc muốn xóa bản ghi này không?")) {
            try {
                await rewardDisciplineApi.delete(id);
                fetchData();
            } catch (error) {
                alert("Lỗi khi xóa!");
            }
        }
    };

    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (loading) return <div style={{ padding: '20px' }}>Đang nạp dữ liệu thực tế...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>| 9. KHEN THƯỞNG & KỶ LUẬT</h2>
                    <div style={styles.info}>Dữ liệu bóc tách từ bảng reward_discipline trong MySQL</div>
                </div>
                <button style={styles.addButton} onClick={() => setIsModalOpen(true)}>+ Thêm quyết định</button>
            </div>
            
            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeader}>
                            <th style={styles.th}>Nhân viên</th>
                            <th style={styles.th}>Phân loại</th>
                            <th style={styles.th}>Số tiền</th>
                            <th style={styles.th}>Ngày quyết định</th>
                            <th style={styles.th}>Lý do</th>
                            <th style={styles.th}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.length > 0 ? (
                            list.map((item) => (
                                <tr key={item.id} style={styles.tr}>
                                    <td style={styles.td}>
                                        <b>{item.employee?.fullName || item.employeeName || `NV-${item.employeeId}`}</b>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.badge,
                                            backgroundColor: item.type === 'REWARD' ? '#d4edda' : '#f8d7da',
                                            color: item.type === 'REWARD' ? '#155724' : '#721c24'
                                        }}>
                                            {item.type === 'REWARD' ? 'KHEN THƯỞNG' : 'KỶ LUẬT'}
                                        </span>
                                    </td>
                                    <td style={{
                                        ...styles.td, 
                                        fontWeight: 'bold', 
                                        color: item.type === 'REWARD' ? '#27ae60' : '#c0392b'
                                    }}>
                                        {item.type === 'REWARD' ? '+' : '-'}{formatVND(item.amount || 0)}
                                    </td>
                                    <td style={styles.td}>{item.decisionDate || item.decision_date}</td>
                                    <td style={styles.td}><i>{item.reason}</i></td>
                                    <td style={styles.td}>
                                        <button style={styles.delBtn} onClick={() => handleDelete(item.id)}>Xóa</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>Chưa có dữ liệu khen thưởng, kỷ luật trong MySQL.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL THÊM QUYẾT ĐỊNH */}
            {isModalOpen && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h3>THÊM QUYẾT ĐỊNH MỚI</h3>
                        <form onSubmit={handleSubmit} style={{marginTop: '15px'}}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Nhân viên:</label>
                                <select name="employeeId" style={styles.input} required>
                                    <option value="">-- Chọn nhân viên --</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Loại quyết định:</label>
                                <select name="type" style={styles.input}>
                                    <option value="REWARD">Khen thưởng (+)</option>
                                    <option value="DISCIPLINE">Kỷ luật (-)</option>
                                </select>
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Số tiền (VND):</label>
                                <input name="amount" type="number" style={styles.input} required />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Ngày quyết định:</label>
                                <input name="decisionDate" type="date" style={styles.input} required />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Lý do:</label>
                                <textarea name="reason" style={styles.input} rows="3" required></textarea>
                            </div>
                            <div style={styles.btnGroup}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.btnCancel}>Hủy</button>
                                <button type="submit" style={styles.btnSave}>Lưu quyết định</button>
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
    info: { color: '#666', marginTop: '5px' },
    addButton: { padding: '10px 20px', backgroundColor: '#8e44ad', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' },
    tableWrapper: { backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { backgroundColor: '#8e44ad', color: '#fff' },
    th: { padding: '15px', textAlign: 'left' },
    td: { padding: '15px', borderBottom: '1px solid #eee' },
    tr: { transition: '0.3s' },
    badge: { padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' },
    delBtn: { padding: '5px 10px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { backgroundColor: '#fff', padding: '25px', borderRadius: '10px', width: '400px', maxHeight: '90vh', overflowY: 'auto' },
    inputGroup: { marginBottom: '12px' },
    label: { display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '5px' },
    input: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' },
    btnGroup: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
    btnCancel: { padding: '10px 20px', backgroundColor: '#eee', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    btnSave: { padding: '10px 20px', backgroundColor: '#8e44ad', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }
};

export default RewardDisciplineList;