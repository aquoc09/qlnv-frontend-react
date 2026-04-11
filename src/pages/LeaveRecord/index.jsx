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

            // HÀM BÓC TÁCH DỮ LIỆU CHUẨN (Phá lớp result lồng nhau)
            const cleanData = (res) => {
                const raw = Array.isArray(res) ? res : (res?.result || []);
                return raw.map(item => item.result ? item.result : item);
            };

            setRecords(cleanData(resRecord));
            setEmployees(cleanData(resEmp));
            setLeaveTypes(cleanData(resType));

        } catch (error) {
            console.error("Lỗi MySQL:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // HÀM TÌM TÊN NHÂN VIÊN & LOẠI NGHỈ
    const getEmployeeName = (r) => {
        const found = employees.find(e => e.id === (r.employeeId || r.employee_id));
        return found ? found.fullName : `NV-${r.employeeId || r.employee_id}`;
    };
    const getLeaveName = (r) => {
        const found = leaveTypes.find(t => t.id === (r.leaveId || r.leave_id));
        return found ? found.leaveName : `Loại-${r.leaveId || r.leave_id}`;
    };

    // 2. XỬ LÝ DUYỆT / TỪ CHỐI (Quan trọng: Sau khi xong phải load lại data)
    const handleUpdateStatus = async (id, status) => {
        try {
            const response = await leaveRecordApi.updateStatus(id, status);
            console.log("Kết quả duyệt:", response);
            alert(`Đã thực hiện: ${status === 'APPROVED' ? 'DUYỆT' : 'TỪ CHỐI'}`);
            // GỌI LẠI HÀM FETCH ĐỂ CẬP NHẬT GIAO DIỆN VÀ ẨN NÚT
            await fetchData(); 
        } catch (error) {
            alert("Lỗi: Không có quyền (999) hoặc sai API!");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Xóa đơn này?")) {
            try { await leaveRecordApi.delete(id); fetchData(); } 
            catch (error) { alert("Lỗi xóa!"); }
        }
    };

    // Style trạng thái linh hoạt
    const getStatusInfo = (status) => {
        const s = String(status).toUpperCase();
        if (s === 'APPROVED' || s === 'ĐÃ DUYỆT') return { label: 'Đã duyệt', color: '#2ecc71', bg: '#d4edda' };
        if (s === 'REJECTED' || s === 'TỪ CHỐI') return { label: 'Từ chối', color: '#e74c3c', bg: '#f8d7da' };
        return { label: 'Chờ duyệt', color: '#f39c12', bg: '#fff3cd' };
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
                        {records.length > 0 ? records.map((r, index) => {
                            const statusInfo = getStatusInfo(r.status);
                            const canAction = (String(r.status).toUpperCase() === 'PENDING' || r.status === 'Chờ duyệt');

                            return (
                                <tr key={r.id || index} style={styles.tr}>
                                    <td style={styles.td}><b>{getEmployeeName(r)}</b></td>
                                    <td style={styles.td}>{getLeaveName(r)}</td>
                                    <td style={styles.td}>{r.startDate || r.start_date} ➔ {r.endDate || r.end_date}</td>
                                    <td style={styles.td}><i>{r.reason}</i></td>
                                    <td style={styles.td}>
                                        <span style={{...styles.badge, backgroundColor: statusInfo.bg, color: statusInfo.color}}>
                                            {statusInfo.label}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        {/* NẾU LÀ CHỜ DUYỆT THÌ HIỆN NÚT, NẾU KHÁC THÌ ẨN */}
                                        {canAction && (
                                            <div style={{display: 'inline-flex', gap: '5px'}}>
                                                <button style={styles.btnApprove} onClick={() => handleUpdateStatus(r.id, 'APPROVED')}>Duyệt</button>
                                                <button style={styles.btnReject} onClick={() => handleUpdateStatus(r.id, 'REJECTED')}>Từ chối</button>
                                            </div>
                                        )}
                                        <button style={styles.btnDel} onClick={() => handleDelete(r.id)}>Xóa</button>
                                    </td>
                                </tr>
                            );
                        }) : <tr><td colSpan="6" style={{textAlign: 'center', padding: '40px'}}>Trống.</td></tr>}
                    </tbody>
                </table>
            </div>
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
    btnApprove: { padding: '5px 10px', backgroundColor: '#2ecc71', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    btnReject: { padding: '5px 10px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    btnDel: { padding: '5px 10px', backgroundColor: '#eee', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: '5px' }
};

export default LeaveRecordList;