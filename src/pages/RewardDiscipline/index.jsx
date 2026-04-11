import React, { useEffect, useState } from 'react';
import rewardDisciplineApi from '../../api/rewardDisciplineApi';
import employeeApi from '../../api/employeeApi'; 

const RewardDisciplineList = () => {
    const [list, setList] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resData, resEmp] = await Promise.all([
                rewardDisciplineApi.getAll(),
                employeeApi.getAll()
            ]);

            // HÀM BÓC TÁCH GỠ LỚP RESULT LỒNG NHAU (Nhìn F12 của anh để bóc ruột)
            const cleanData = (res) => {
                const raw = Array.isArray(res) ? res : (res?.result || []);
                return raw.map(item => (item.result ? item.result : item));
            };

            const cleanRewardList = cleanData(resData);
            const cleanEmployeeList = cleanData(resEmp);

            setList(cleanRewardList);
            setEmployees(cleanEmployeeList);
            
            console.log("Thưởng phạt đã bóc vỏ:", cleanRewardList);
        } catch (error) {
            console.error("Lỗi MySQL:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // HÀM TÌM TÊN NHÂN VIÊN
    const getEmpName = (item) => {
        const id = item.employeeId || item.employee_id || item.employee?.id;
        const found = employees.find(e => e.id === id);
        return found ? found.fullName : `NV - ${id || '???'}`;
    };

    // 1. CHỨC NĂNG THÊM MỚI (Lưu vào MySQL)
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const raw = Object.fromEntries(formData.entries());

        const data = {
            ...raw,
            employeeId: Number(raw.employeeId),
            amount: Number(raw.amount)
        };

        try {
            await rewardDisciplineApi.create(data);
            alert("Đã lưu vào MySQL thành công!");
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            alert("Lỗi khi lưu! (999 - Không có quyền)");
        }
    };

    // 2. CHỨC NĂNG XÓA (FIX LỖI KHÔNG XÓA ĐƯỢC)
    const handleDelete = async (id) => {
        if (!window.confirm("Anh có chắc muốn xóa bản ghi này?")) return;
        try {
            // id này giờ đã là id thật sau khi bóc vỏ result
            await rewardDisciplineApi.delete(id);
            alert("Đã xóa thành công!");
            fetchData();
        } catch (error) {
            alert("Lỗi khi xóa! (999 - Kiểm quyền Admin)");
        }
    };

    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
    };

    if (loading) return <div style={{ padding: '20px' }}>Đang nạp dữ liệu thưởng phạt...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>| 9. KHEN THƯỞNG & KỶ LUẬT</h2>
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
                        {list.length > 0 ? list.map((item, index) => (
                            <tr key={item.id || index} style={styles.tr}>
                                <td style={styles.td}><b>{getEmpName(item)}</b></td>
                                <td style={styles.td}>
                                    <span style={{...styles.badge, backgroundColor: (item.type === 'REWARD' || item.type === 'Thưởng') ? '#d4edda' : '#f8d7da', color: (item.type === 'REWARD' || item.type === 'Thưởng') ? '#155724' : '#721c24'}}>
                                        {item.type === 'REWARD' ? 'KHEN THƯỞNG' : 'KỶ LUẬT'}
                                    </span>
                                </td>
                                <td style={{...styles.td, fontWeight: 'bold', color: item.type === 'REWARD' ? '#27ae60' : '#c0392b'}}>
                                    {formatVND(item.amount)}
                                </td>
                                <td style={styles.td}>{item.decisionDate || item.decision_date || '---'}</td>
                                <td style={styles.td}><i>{item.reason}</i></td>
                                <td style={styles.td}>
                                    <button style={styles.delBtn} onClick={() => handleDelete(item.id)}>Xóa</button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>Chưa có dữ liệu từ MySQL.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h3 style={{marginTop: 0}}>THÊM QUYẾT ĐỊNH</h3>
                        <form onSubmit={handleSubmit}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Nhân viên:</label>
                                <select name="employeeId" style={styles.input} required>
                                    <option value="">-- Chọn nhân viên --</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.id} - {emp.fullName || emp.full_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Loại:</label>
                                <select name="type" style={styles.input}>
                                    <option value="REWARD">Khen thưởng (+)</option>
                                    <option value="DISCIPLINE">Kỷ luật (-)</option>
                                </select>
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Số tiền:</label>
                                <input name="amount" type="number" style={styles.input} required />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Ngày:</label>
                                <input name="decisionDate" type="date" style={styles.input} required />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Lý do:</label>
                                <textarea name="reason" style={styles.input} rows="3" required></textarea>
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
    modal: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', width: '400px' },
    inputGroup: { marginBottom: '12px' },
    label: { display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '5px' },
    input: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' },
    btnGroup: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
    btnCancel: { padding: '10px 20px', backgroundColor: '#eee', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    btnSave: { padding: '10px 20px', backgroundColor: '#8e44ad', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }
};

export default RewardDisciplineList;