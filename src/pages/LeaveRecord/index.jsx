import React, { useEffect, useState } from 'react';
import leaveRecordApi from '../../api/leaveRecordApi';
import employeeApi from '../../api/employeeApi';
import leaveApi from '../../api/leaveApi';

const LeaveRecordList = () => {
    const [records, setRecords] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    // HÀM LẤY DATA (Dùng chung để làm mới bảng)
    const fetchData = async () => {
        try {
            const [resRecord, resEmp, resType] = await Promise.all([
                leaveRecordApi.getAll(),
                employeeApi.getAll(),
                leaveApi.getAll()
            ]);

            const clean = (res) => {
                const raw = Array.isArray(res) ? res : (res?.result || []);
                return raw.map(item => item.result ? item.result : item);
            };

            setRecords(clean(resRecord));
            setEmployees(clean(resEmp));
            setLeaveTypes(clean(resType));
        } catch (error) {
            console.error("Lỗi MySQL:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // 1. CHỨC NĂNG DUYỆT / TỪ CHỐI (FIX TRIỆT ĐỂ)
    const handleUpdateStatus = async (id, status) => {
        try {
            // Gửi lệnh xuống Backend
            const response = await leaveRecordApi.updateStatus(id, status);
            
            // Nếu BE trả về thành công (thường là code 1000)
            if (response) {
                alert(`Đã thực hiện: ${status === 'APPROVED' ? 'DUYỆT' : 'TỪ CHỐI'} thành công!`);
                // QUAN TRỌNG: Gọi lại hàm lấy dữ liệu để ẩn nút ngay lập tức
                await fetchData(); 
            }
        } catch (error) {
            console.error("Lỗi thực hiện:", error.response?.data);
            alert("Lỗi: Bạn không có quyền Admin hoặc Token hết hạn (999)!");
        }
    };

    const getEmployeeName = (r) => {
        const found = employees.find(e => e.id === (r.employeeId || r.employee_id));
        return found ? found.fullName : `NV-${r.employeeId || r.employee_id}`;
    };

    const getStatusStyle = (status) => {
        const s = String(status).toUpperCase();
        if (s === 'APPROVED' || s === 'ĐÃ DUYỆT') return { label: 'Đã duyệt', color: '#155724', bg: '#d4edda' };
        if (s === 'REJECTED' || s === 'TỪ CHỐI') return { label: 'Từ chối', color: '#721c24', bg: '#f8d7da' };
        return { label: 'Chờ duyệt', color: '#856404', bg: '#fff3cd' };
    };

    if (loading) return <div style={{ padding: '20px' }}>Đang nạp dữ liệu...</div>;

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>| 7. QUẢN LÝ ĐƠN NGHỈ PHÉP</h2>
            
            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeader}>
                            <th style={styles.th}>Nhân viên</th>
                            <th style={styles.th}>Thời gian</th>
                            <th style={styles.th}>Lý do</th>
                            <th style={styles.th}>Trạng thái</th>
                            <th style={styles.th}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.length > 0 ? records.map((r, index) => {
                            const statusInfo = getStatusStyle(r.status);
                            // Kiểm tra: Chỉ hiện nút nếu trạng thái là PENDING (hoặc Chờ duyệt)
                            const isPending = String(r.status).toUpperCase() === 'PENDING' || r.status === 'Chờ duyệt';

                            return (
                                <tr key={r.id || index} style={styles.tr}>
                                    <td style={styles.td}><b>{getEmployeeName(r)}</b></td>
                                    <td style={styles.td}>{r.startDate} ➔ {r.endDate}</td>
                                    <td style={styles.td}><i>{r.reason}</i></td>
                                    <td style={styles.td}>
                                        <span style={{...styles.badge, backgroundColor: statusInfo.bg, color: statusInfo.color}}>
                                            {statusInfo.label}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        {isPending ? (
                                            <div style={{display: 'flex', gap: '5px'}}>
                                                <button style={styles.btnApprove} onClick={() => handleUpdateStatus(r.id, 'APPROVED')}>Duyệt</button>
                                                <button style={styles.btnReject} onClick={() => handleUpdateStatus(r.id, 'REJECTED')}>Từ chối</button>
                                            </div>
                                        ) : (
                                            <span style={{color: '#999', fontSize: '12px'}}>Đã xử lý xong</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        }) : <tr><td colSpan="5" style={{textAlign: 'center', padding: '40px'}}>Trống.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '40px', backgroundColor: '#f4f7f6', minHeight: '100vh' },
    title: { color: '#2c3e50', fontSize: '24px', marginBottom: '30px' },
    tableWrapper: { backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { backgroundColor: '#2980b9', color: '#fff' },
    th: { padding: '15px', textAlign: 'left' },
    td: { padding: '15px', borderBottom: '1px solid #eee' },
    tr: { transition: '0.3s' },
    badge: { padding: '5px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' },
    btnApprove: { padding: '5px 10px', backgroundColor: '#2ecc71', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    btnReject: { padding: '5px 10px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};

export default LeaveRecordList;