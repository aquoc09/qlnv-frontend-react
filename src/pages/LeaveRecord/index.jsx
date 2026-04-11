import React, { useEffect, useState } from 'react';
import leaveRecordApi from '../../api/leaveRecordApi';
import employeeApi from '../../api/employeeApi';
import leaveApi from '../../api/leaveApi';

const LeaveRecordList = () => {
    const [records, setRecords] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resRecord, resEmp, resType] = await Promise.all([
                leaveRecordApi.getAll(),
                employeeApi.getAll(),
                leaveApi.getAll()
            ]);

            // FIX CỰC QUAN TRỌNG: Bóc lớp "result" của từng nhân viên (nhìn theo F12 của anh)
            const rawEmployees = Array.isArray(resEmp) ? resEmp : (resEmp?.result || []);
            const cleanEmployees = rawEmployees.map(item => item.result ? item.result : item);
            
            const rawTypes = Array.isArray(resType) ? resType : (resType?.result || []);
            const cleanTypes = rawTypes.map(item => item.result ? item.result : item);

            const rawRecords = Array.isArray(resRecord) ? resRecord : (resRecord?.result || []);
            const cleanRecords = rawRecords.map(item => item.result ? item.result : item);

            setEmployees(cleanEmployees);
            setLeaveTypes(cleanTypes);
            setRecords(cleanRecords);

            console.log("Nhân viên sạch:", cleanEmployees);
        } catch (error) {
            console.error("Lỗi MySQL:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // HÀM HIỂN THỊ TÊN (Dùng mảng đã làm sạch)
    const getEmployeeName = (item) => {
        const id = item.employeeId || item.employee_id;
        const found = employees.find(e => e.id === id);
        return found ? found.fullName : `NV-${id || '???'}`;
    };

    const getLeaveName = (item) => {
        const id = item.leaveId || item.leave_id;
        const found = leaveTypes.find(t => t.id === id);
        return found ? found.leaveName : `Loại-${id}`;
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await leaveRecordApi.updateStatus(id, status);
            alert("Cập nhật thành công!");
            fetchData();
        } catch (error) { alert("Lỗi quyền hạn 999!"); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Anh muốn xóa đơn này?")) {
            try {
                await leaveRecordApi.delete(id);
                alert("Đã xóa đơn!");
                fetchData();
            } catch (error) { alert("Lỗi khi xóa!"); }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            employeeId: Number(formData.get('employeeId')),
            leaveId: Number(formData.get('leaveId')),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
            reason: formData.get('reason'),
            status: "PENDING"
        };
        try {
            await leaveRecordApi.create(data);
            alert("Tạo đơn thành công!");
            setIsModalOpen(false);
            fetchData();
        } catch (error) { alert("Lỗi tạo đơn!"); }
    };

    if (loading) return <div style={{ padding: '20px' }}>Đang nạp dữ liệu...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>| 7. QUẢN LÝ ĐƠN NGHỈ PHÉP</h2>
                <button style={styles.addButton} onClick={() => setIsModalOpen(true)}>+ Tạo đơn mới</button>
            </div>
            
            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeader}>
                            <th style={styles.th}>Nhân viên</th>
                            <th style={styles.th}>Loại nghỉ</th>
                            <th style={styles.th}>Thời gian</th>
                            <th style={styles.th}>Lý do</th>
                            <th style={styles.th}>Trạng thái</th>
                            <th style={styles.th}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.length > 0 ? records.map((r) => (
                            <tr key={r.id} style={styles.tr}>
                                <td style={styles.td}><b>{getEmployeeName(r)}</b></td>
                                <td style={styles.td}>{getLeaveName(r)}</td>
                                <td style={styles.td}>{r.startDate} ➔ {r.endDate}</td>
                                <td style={styles.td}><i>{r.reason}</i></td>
                                <td style={styles.td}>
                                    <span style={{...styles.badge, backgroundColor: r.status === 'APPROVED' ? '#d4edda' : '#fff3cd'}}>
                                        {r.status === 'APPROVED' ? 'Đã duyệt' : 'Chờ duyệt'}
                                    </span>
                                </td>
                                <td style={styles.td}>
                                    {r.status === 'PENDING' && (
                                        <>
                                            <button style={styles.btnApprove} onClick={() => handleUpdateStatus(r.id, 'APPROVED')}>Duyệt</button>
                                            <button style={styles.btnReject} onClick={() => handleUpdateStatus(r.id, 'REJECTED')}>Từ chối</button>
                                        </>
                                    )}
                                    <button style={styles.btnDel} onClick={() => handleDelete(r.id)}>Xóa</button>
                                </td>
                            </tr>
                        )) : <tr><td colSpan="6" style={{textAlign: 'center', padding: '40px'}}>Trống. Hãy nhấn tạo đơn mới!</td></tr>}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h3>TẠO ĐƠN MỚI</h3>
                        <form onSubmit={handleSubmit}>
                            <div style={styles.inputGroup}>
                                <label>Nhân viên:</label>
                                <select name="employeeId" style={styles.input} required>
                                    <option value="">-- Chọn nhân viên --</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={styles.inputGroup}>
                                <label>Loại nghỉ:</label>
                                <select name="leaveId" style={styles.input} required>
                                    <option value="">-- Chọn loại --</option>
                                    {leaveTypes.map(t => (
                                        <option key={t.id} value={t.id}>{t.leaveName}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={styles.inputGroup}><label>Từ:</label><input name="startDate" type="date" style={styles.input} required /></div>
                            <div style={styles.inputGroup}><label>Đến:</label><input name="endDate" type="date" style={styles.input} required /></div>
                            <div style={styles.inputGroup}><label>Lý do:</label><textarea name="reason" style={styles.input} required></textarea></div>
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
    addButton: { padding: '10px 20px', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    tableWrapper: { backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { backgroundColor: '#2980b9', color: '#fff' },
    th: { padding: '15px', textAlign: 'left' },
    td: { padding: '15px', borderBottom: '1px solid #eee' },
    tr: { transition: '0.3s' },
    badge: { padding: '5px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' },
    btnApprove: { padding: '5px 10px', backgroundColor: '#2ecc71', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' },
    btnReject: { padding: '5px 10px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' },
    btnDel: { padding: '5px 10px', backgroundColor: '#eee', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', width: '400px' },
    inputGroup: { marginBottom: '12px' },
    input: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' },
    btnGroup: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
    btnCancel: { padding: '10px 20px', backgroundColor: '#eee', borderRadius: '6px', cursor: 'pointer', border: 'none' },
    btnSave: { padding: '10px 20px', backgroundColor: '#3498db', color: '#fff', borderRadius: '6px', cursor: 'pointer', border: 'none' }
};

export default LeaveRecordList;