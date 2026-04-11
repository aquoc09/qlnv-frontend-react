import React, { useEffect, useState } from 'react';
import leaveBalanceApi from '../../api/leaveBalanceApi';
import employeeApi from '../../api/employeeApi'; 

const LeaveBalanceList = () => {
    const [balances, setBalances] = useState([]);
    const [employees, setEmployees] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBalance, setSelectedBalance] = useState(null);

    // 1. LẤY DATA THẬT TỪ BE (Bóc tách mảng trực tiếp)
    const fetchData = async () => {
        setLoading(true);
        try {
            const [resBalance, resEmp] = await Promise.all([
                leaveBalanceApi.getAll(),
                employeeApi.getAll()
            ]);

            // Vét mảng dữ liệu (Hỗ trợ cả .result hoặc Array trực tiếp từ Java)
            const balanceData = resBalance?.result || (Array.isArray(resBalance) ? resBalance : []);
            const employeeData = resEmp?.result || (Array.isArray(resEmp) ? resEmp : []);

            setBalances(balanceData);
            setEmployees(employeeData);
        } catch (error) {
            console.error("Lỗi kết nối MySQL:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // HÀM TÌM TÊN NHÂN VIÊN (Fix lỗi cột NV-undefined)
    const getEmployeeName = (item) => {
        const id = item.employeeId || item.employee_id || item.employee?.id;
        if (item.employee?.fullName || item.employee?.full_name) {
            return item.employee.fullName || item.employee.full_name;
        }
        const found = employees.find(e => e.id === id || e.employeeId === id);
        return found ? (found.fullName || found.full_name) : `NV - ${id || '???'}`;
    };

    // 2. CHỨC NĂNG CẬP NHẬT (Gửi lệnh PUT xuống MySQL)
    const handleUpdate = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        // Chuẩn hóa dữ liệu đúng kiểu số để BE nhận được
        const data = {
            daysRemaining: parseInt(formData.get('daysRemaining')),
            daysUsed: parseInt(formData.get('daysUsed'))
        };

        try {
            // Sử dụng đúng ID từ bản ghi MySQL
            const id = selectedBalance.id || selectedBalance.leave_balance_id;
            await leaveBalanceApi.update(id, data);
            alert("Đã điều chỉnh quỹ phép thành công!");
            setIsModalOpen(false);
            fetchData(); // Load lại để cập nhật số mới
        } catch (error) {
            alert("Lỗi: Không thể lưu. Kiểm tra lại quyền Admin (999)!");
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Đang nạp dữ liệu từ MySQL...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>| QUẢN LÝ QUỸ PHÉP NĂM</h2>
                <button style={styles.resetBtn} onClick={() => alert("Lệnh Reset cần Admin cấp cao!")}>Làm mới quỹ phép</button>
            </div>

            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeader}>
                            <th style={styles.th}>Nhân viên</th>
                            <th style={styles.th}>Loại phép</th>
                            <th style={styles.th}>Đã nghỉ</th>
                            <th style={styles.th}>Còn lại</th>
                            <th style={styles.th}>Trạng thái</th>
                            <th style={styles.th}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {balances.length > 0 ? (
                            balances.map((b, index) => (
                                <tr key={b.id || index} style={styles.tr}>
                                    <td style={styles.td}>
                                        <b>{getEmployeeName(b)}</b>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={styles.typeLabel}>
                                            {b.leaveType?.leaveName || b.leaveName || `Loại ID: ${b.leaveId}`}
                                        </span>
                                    </td>
                                    <td style={{...styles.td, color: '#e67e22', fontWeight: 'bold'}}>{b.daysUsed || b.days_used || 0} ngày</td>
                                    <td style={{...styles.td, color: '#27ae60', fontWeight: 'bold'}}>{b.daysRemaining || b.days_remaining || 0} ngày</td>
                                    <td style={styles.td}>
                                        {(b.daysRemaining || b.days_remaining) > 0 ? 
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
                        <h3 style={{marginTop: 0}}>ĐIỀU CHỈNH QUỸ PHÉP</h3>
                        <form onSubmit={handleUpdate}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Số ngày đã nghỉ:</label>
                                <input name="daysUsed" type="number" defaultValue={selectedBalance?.daysUsed || selectedBalance?.days_used} style={styles.input} required />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Số ngày còn lại:</label>
                                <input name="daysRemaining" type="number" defaultValue={selectedBalance?.daysRemaining || selectedBalance?.days_remaining} style={styles.input} required />
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
    resetBtn: { padding: '10px 20px', backgroundColor: '#34495e', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
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