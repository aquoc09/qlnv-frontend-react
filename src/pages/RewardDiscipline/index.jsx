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

            // Bóc tách danh sách Thưởng/Phạt
            if (resData && resData.code === 1000) {
                setList(resData.result || []);
            } else if (Array.isArray(resData)) {
                setList(resData);
            }

            // Bóc tách danh sách Nhân viên
            if (resEmp && resEmp.code === 1000) {
                setEmployees(resEmp.result || []);
            }
        } catch (error) {
            console.error("Lỗi kết nối MySQL:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        try {
            await rewardDisciplineApi.create(data);
            alert("Đã lưu thành công!");
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            alert("Lỗi khi lưu!");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Xóa bản ghi này?")) {
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

    if (loading) return <div style={{ padding: '20px' }}>Đang nạp dữ liệu...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>| 9. KHEN THƯỞNG & KỶ LUẬT</h2>
                    {/* ĐÃ BỎ DÒNG CHỮ KẾT NỐI THEO Ý ANH */}
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
                            list.map((item, index) => (
                                <tr key={item.id || index} style={styles.tr}>
                                    <td style={styles.td}>
                                        {/* LOGIC VÉT DỮ LIỆU: Thử mọi trường hợp BE có thể trả về */}
                                        <b>
                                            {item.employee?.fullName || 
                                             item.employee?.full_name || 
                                             item.employeeName || 
                                             item.full_name ||
                                             `Mã NV: ${item.employeeId || '???'}`}
                                        </b>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.badge,
                                            backgroundColor: (item.type === 'REWARD' || item.type === 'Thưởng') ? '#d4edda' : '#f8d7da',
                                            color: (item.type === 'REWARD' || item.type === 'Thưởng') ? '#155724' : '#721c24'
                                        }}>
                                            {(item.type === 'REWARD' || item.type === 'Thưởng') ? 'KHEN THƯỞNG' : 'KỶ LUẬT'}
                                        </span>
                                    </td>
                                    <td style={{ ...styles.td, fontWeight: 'bold', color: (item.type === 'REWARD' || item.type === 'Thưởng') ? '#27ae60' : '#c0392b' }}>
                                        {formatVND(item.amount || 0)}
                                    </td>
                                    <td style={styles.td}>{item.decisionDate || item.decision_date || '---'}</td>
                                    <td style={styles.td}><i>{item.reason || '---'}</i></td>
                                    <td style={styles.td}>
                                        <button style={styles.delBtn} onClick={() => handleDelete(item.id)}>Xóa</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>Chưa có dữ liệu thật. Anh nhấn "Thêm quyết định" để nạp data.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h3 style={{marginTop: 0}}>THÊM QUYẾT ĐỊNH MỚI</h3>
                        <form onSubmit={handleSubmit}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Nhân viên:</label>
                                <select name="employeeId" style={styles.input} required>
                                    <option value="">-- Chọn nhân viên --</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.fullName || emp.full_name}</option>
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