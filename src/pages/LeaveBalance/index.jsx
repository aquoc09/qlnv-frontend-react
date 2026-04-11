import React, { useEffect, useState } from 'react';
import leaveBalanceApi from '../../api/leaveBalanceApi';

const LeaveBalanceList = () => {
    const [balances, setBalances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBalance, setSelectedBalance] = useState(null);

    // 1. GỌI DATA THẬT 
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await leaveBalanceApi.getAll();
            if (response && response.code === 1000) {
                setBalances(response.result || []);
            }
        } catch (error) {
            console.error("Lỗi kết nối MySQL:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // 2. CHỨC NĂNG CẬP NHẬT (ĐIỀU CHỈNH PHÉP)
    const handleUpdate = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            daysRemaining: parseInt(formData.get('daysRemaining')),
            daysUsed: parseInt(formData.get('daysUsed'))
        };

        try {
            await leaveBalanceApi.update(selectedBalance.id, data);
            alert("Đã điều chỉnh quỹ phép thành công!");
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            alert("Lỗi khi lưu dữ liệu!");
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Đang bóc tách dữ liệu từ MySQL...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>| QUẢN LÝ QUỸ PHÉP NĂM</h2>
                <div style={styles.actionGroup}>
                    {/* Chức năng BE có: Reset phép đầu năm */}
                    <button style={styles.resetBtn} onClick={() => alert("Chức năng này cần BE cấu hình Reset phép!")}>Làm mới quỹ phép năm</button>
                </div>
            </div>

            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeader}>
                            <th style={styles.th}>Nhân viên</th>
                            <th style={styles.th}>Loại phép</th>
                            <th style={styles.th}>Số ngày đã nghỉ</th>
                            <th style={styles.th}>Số ngày còn lại</th>
                            <th style={styles.th}>Trạng thái</th>
                            <th style={styles.th}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {balances.length > 0 ? (
                            balances.map((b) => (
                                <tr key={b.id} style={styles.tr}>
                                    <td style={styles.td}>
                                        <b>{b.employee?.fullName || b.employeeName || `NV-${b.employeeId}`}</b>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={styles.typeLabel}>{b.leaveType?.leaveName || b.leaveName || `Loại ID: ${b.leaveId}`}</span>
                                    </td>
                                    <td style={{...styles.td, color: '#e67e22', fontWeight: 'bold'}}>{b.daysUsed} ngày</td>
                                    <td style={{...styles.td, color: '#27ae60', fontWeight: 'bold'}}>{b.daysRemaining} ngày</td>
                                    <td style={styles.td}>
                                        {b.daysRemaining > 0 ? 
                                            <span style={styles.ok}>Còn phép</span> : 
                                            <span style={styles.warn}>Hết phép</span>
                                        }
                                    </td>
                                    <td style={styles.td}>
                                        <button style={styles.editBtn} onClick={() => { setSelectedBalance(b); setIsModalOpen(true); }}>Điều chỉnh</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" style={{textAlign: 'center', padding: '40px'}}>Dữ liệu quỹ phép đang trống.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL SỬA */}
            {isModalOpen && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h3>ĐIỀU CHỈNH QUỸ PHÉP</h3>
                        <form onSubmit={handleUpdate}>
                            <div style={styles.inputGroup}>
                                <label>Số ngày đã nghỉ:</label>
                                <input name="daysUsed" type="number" defaultValue={selectedBalance?.daysUsed} style={styles.input} />
                            </div>
                            <div style={styles.inputGroup}>
                                <label>Số ngày còn lại:</label>
                                <input name="daysRemaining" type="number" defaultValue={selectedBalance?.daysRemaining} style={styles.input} />
                            </div>
                            <div style={styles.btnGroup}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.btnCancel}>Hủy</button>
                                <button type="submit" style={styles.btnSave}>Cập nhật</button>
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
    resetBtn: { padding: '10px 20px', backgroundColor: '#34495e', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    tableWrapper: { backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { backgroundColor: '#1abc9c', color: '#fff' },
    th: { padding: '15px', textAlign: 'left' },
    td: { padding: '15px', borderBottom: '1px solid #eee' },
    tr: { transition: '0.3s' },
    typeLabel: { padding: '3px 8px', backgroundColor: '#f0f0f0', borderRadius: '15px', fontSize: '12px' },
    ok: { color: '#2ecc71', fontWeight: 'bold' },
    warn: { color: '#e74c3c', fontWeight: 'bold' },
    editBtn: { padding: '5px 10px', backgroundColor: '#f39c12', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
    modal: { backgroundColor: '#fff', padding: '25px', borderRadius: '10px', width: '300px' },
    inputGroup: { marginBottom: '15px' },
    input: { width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd' },
    btnGroup: { display: 'flex', justifyContent: 'flex-end', gap: '10px' },
    btnCancel: { padding: '8px 15px', border: 'none', borderRadius: '4px' },
    btnSave: { padding: '8px 15px', backgroundColor: '#1abc9c', color: '#fff', border: 'none', borderRadius: '4px' }
};

export default LeaveBalanceList;