import React, { useEffect, useState } from 'react';
import leaveBalanceApi from '../../api/leaveBalanceApi';
import employeeApi from '../../api/employeeApi'; 

const LeaveBalanceList = () => {
    const [balances, setBalances] = useState([]);
    const [employees, setEmployees] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBalance, setEditingBalance] = useState(null);

    // 1. LẤY DATA THẬT TỪ BE (Bóc tách mảng trực tiếp)
    const fetchData = async () => {
        setLoading(true);
        try {
            const [resBalance, resEmp] = await Promise.all([
                leaveBalanceApi.getAll(),
                employeeApi.getAll()
            ]);

            // FIX: BE trả về Array trực tiếp (như ảnh Console anh chụp là Array(5))
            const balanceData = resBalance?.result || (Array.isArray(resBalance) ? resBalance : []);
            const employeeData = resEmp?.result || (Array.isArray(resEmp) ? resEmp : []);

            setBalances(balanceData);
            setEmployees(employeeData);
        } catch (error) {
            console.error("Lỗi kết nối MySQL:", error);
            setBalances([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // HÀM TÌM TÊN NHÂN VIÊN (Fix lỗi NV-undefined)
    const getEmployeeName = (item) => {
        const id = item.employeeId || item.employee_id || item.employee?.id;
        if (item.employee?.fullName || item.employee?.full_name) {
            return item.employee.fullName || item.employee.full_name;
        }
        const found = employees.find(e => e.id === id || e.employeeId === id);
        return found ? (found.fullName || found.full_name) : `NV - ${id || '???'}`;
    };

    // 2. XỬ LÝ CẬP NHẬT (Lưu số ngày vào MySQL)
    const handleUpdate = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            daysUsed: Number(formData.get('daysUsed')),
            daysRemaining: Number(formData.get('daysRemaining'))
        };

        try {
            const id = editingBalance.id || editingBalance.leave_balance_id;
            await leaveBalanceApi.update(id, data);
            alert("Cập nhật quỹ phép thành công!");
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            alert("Lỗi: Không có quyền hoặc sai cấu trúc dữ liệu (999)!");
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Đang nạp dữ liệu từ Database...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>| 6. QUẢN LÝ QUỸ PHÉP NĂM</h2>
            </div>
            
            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeader}>
                            <th style={styles.th}>Nhân viên</th>
                            <th style={styles.th}>Loại nghỉ</th>
                            <th style={styles.th}>Đã nghỉ</th>
                            <th style={styles.th}>Còn lại</th>
                            <th style={styles.th}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {balances.length > 0 ? (
                            balances.map((b, index) => (
                                <tr key={b.id || index} style={styles.tr}>
                                    <td style={styles.td}><b>{getEmployeeName(b)}</b></td>
                                    <td style={styles.td}>
                                        {b.leaveType?.leaveName || b.leaveName || `ID: ${b.leaveId || b.leave_id}`}
                                    </td>
                                    <td style={{...styles.td, color: '#e67e22', fontWeight: 'bold'}}>
                                        {b.daysUsed || b.days_used || 0} ngày
                                    </td>
                                    <td style={{...styles.td, color: '#27ae60', fontWeight: 'bold'}}>
                                        {b.daysRemaining || b.days_remaining || 0} ngày
                                    </td>
                                    <td style={styles.td}>
                                        <button 
                                            style={styles.editBtn} 
                                            onClick={() => { setEditingBalance(b); setIsModalOpen(true); }}
                                        >
                                            Điều chỉnh
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Dữ liệu MySQL đang trống.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL ĐIỀU CHỈNH */}
            {isModalOpen && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h3>ĐIỀU CHỈNH QUỸ PHÉP</h3>
                        <form onSubmit={handleUpdate} style={{marginTop: '15px'}}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Số ngày đã nghỉ:</label>
                                <input name="daysUsed" type="number" defaultValue={editingBalance?.daysUsed || editingBalance?.days_used} style={styles.input} required />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Số ngày còn lại:</label>
                                <input name="daysRemaining" type="number" defaultValue={editingBalance?.daysRemaining || editingBalance?.days_remaining} style={styles.input} required />
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
    header: { marginBottom: '30px' },
    title: { margin: 0, color: '#2c3e50', fontSize: '24px' },
    tableWrapper: { backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { backgroundColor: '#1abc9c', color: '#fff' },
    th: { padding: '15px', textAlign: 'left' },
    td: { padding: '15px', borderBottom: '1px solid #eee' },
    tr: { transition: '0.3s' },
    editBtn: { padding: '5px 12px', backgroundColor: '#f39c12', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', width: '350px' },
    inputGroup: { marginBottom: '15px' },
    label: { display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '5px' },
    input: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' },
    btnGroup: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
    btnCancel: { padding: '10px 20px', backgroundColor: '#eee', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    btnSave: { padding: '10px 20px', backgroundColor: '#1abc9c', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }
};

export default LeaveBalanceList;