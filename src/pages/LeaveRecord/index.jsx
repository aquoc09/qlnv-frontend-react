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

    // 1. LẤY DỮ LIỆU THẬT TỪ BE (Vét mảng trực tiếp)
    const fetchData = async () => {
        setLoading(true);
        try {
            const [resRecord, resEmp, resType] = await Promise.all([
                leaveRecordApi.getAll(),
                employeeApi.getAll(),
                leaveApi.getAll()
            ]);

            // Bóc tách dữ liệu linh hoạt (Hỗ trợ cả .result hoặc Array trực tiếp)
            setRecords(resRecord?.result || (Array.isArray(resRecord) ? resRecord : []));
            setEmployees(resEmp?.result || (Array.isArray(resEmp) ? resEmp : []));
            setLeaveTypes(resType?.result || (Array.isArray(resType) ? resType : []));

        } catch (error) {
            console.error("Lỗi kết nối MySQL:", error);
            setRecords([]);
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

    // 2. XỬ LÝ DUYỆT / TỪ CHỐI (Gửi đúng status lên BE)
    const handleUpdateStatus = async (id, status) => {
        try {
            await leaveRecordApi.updateStatus(id, status);
            alert(`Đã thực hiện: ${status === 'APPROVED' ? 'DUYỆT' : 'TỪ CHỐI'}`);
            fetchData();
        } catch (error) {
            alert("Lỗi: Bạn không có quyền (999) hoặc sai cấu trúc API!");
        }
    };

    // 3. XỬ LÝ TẠO ĐƠN MỚI
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const raw = Object.fromEntries(formData.entries());

        const data = {
            ...raw,
            employeeId: Number(raw.employeeId),
            leaveId: Number(raw.leaveId)
        };

        try {
            await leaveRecordApi.create(data);
            alert("Gửi đơn nghỉ phép thành công!");
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            alert("Lỗi: Không thể tạo đơn!");
        }
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'APPROVED': return { backgroundColor: '#d4edda', color: '#155724' };
            case 'REJECTED': return { backgroundColor: '#f8d7da', color: '#721c24' };
            default: return { backgroundColor: '#fff3cd', color: '#856404' };
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Đang nạp dữ liệu đơn nghỉ...</div>;

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
                            <th style={styles.th}>Từ ngày</th>
                            <th style={styles.th}>Đến ngày</th>
                            <th style={styles.th}>Lý do</th>
                            <th style={styles.th}>Trạng thái</th>
                            <th style={styles.th}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.length > 0 ? (
                            records.map((r, index) => (
                                <tr key={r.id || index} style={styles.tr}>
                                    <td style={styles.td}><b>{getEmployeeName(r)}</b></td>
                                    <td style={styles.td}>{r.startDate || r.start_date}</td>
                                    <td style={styles.td}>{r.endDate || r.end_date}</td>
                                    <td style={styles.td}><i>{r.reason}</i></td>
                                    <td style={styles.td}>
                                        <span style={{...styles.badge, ...getStatusStyle(r.status)}}>
                                            {r.status === 'APPROVED' ? 'Đã duyệt' : r.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        {r.status === 'PENDING' && (
                                            <div style={{display: 'flex', gap: '5px'}}>
                                                <button style={styles.btnApprove} onClick={() => handleUpdateStatus(r.id, 'APPROVED')}>Duyệt</button>
                                                <button style={styles.btnReject} onClick={() => handleUpdateStatus(r.id, 'REJECTED')}>Từ chối</button>
                                            </div>
                                        )}
                                        <button style={styles.btnDel} onClick={async () => { if(window.confirm("Xóa đơn?")) { await leaveRecordApi.delete(r.id); fetchData(); } }}>Xóa</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" style={{textAlign: 'center', padding: '40px'}}>Chưa có đơn nghỉ phép nào trong Database.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL TẠO ĐƠN */}
            {isModalOpen && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h3>TẠO ĐƠN NGHỈ PHÉP</h3>
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
                                <label style={styles.label}>Loại nghỉ:</label>
                                <select name="leaveId" style={styles.input} required>
                                    {leaveTypes.map(type => (
                                        <option key={type.id} value={type.id}>{type.leaveName}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Từ ngày:</label>
                                <input name="startDate" type="date" style={styles.input} required />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Đến ngày:</label>
                                <input name="endDate" type="date" style={styles.input} required />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Lý do:</label>
                                <textarea name="reason" style={styles.input} rows="3" required></textarea>
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
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    title: { margin: 0, color: '#2c3e50', fontSize: '24px' },
    addButton: { padding: '10px 20px', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' },
    tableWrapper: { backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { backgroundColor: '#2980b9', color: '#fff' },
    th: { padding: '15px', textAlign: 'left' },
    td: { padding: '15px', borderBottom: '1px solid #eee' },
    tr: { transition: '0.3s' },
    badge: { padding: '5px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' },
    btnApprove: { padding: '5px 10px', backgroundColor: '#2ecc71', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    btnReject: { padding: '5px 10px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    btnDel: { padding: '5px 10px', backgroundColor: '#eee', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: '5px' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', width: '400px' },
    inputGroup: { marginBottom: '12px' },
    label: { display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '5px' },
    input: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' },
    btnGroup: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
    btnCancel: { padding: '10px 20px', backgroundColor: '#eee', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    btnSave: { padding: '10px 20px', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }
};

export default LeaveRecordList;