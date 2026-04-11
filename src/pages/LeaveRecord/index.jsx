import React, { useEffect, useState } from 'react';
import leaveRecordApi from '../../api/leaveRecordApi';
import employeeApi from '../../api/employeeApi';

const LeaveRecordList = () => {
    const [records, setRecords] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    // HÀM LẤY DATA (Dùng để làm mới bảng)
    const fetchData = async () => {
        try {
            const [resRecord, resEmp] = await Promise.all([
                leaveRecordApi.getAll(),
                employeeApi.getAll()
            ]);

            const clean = (res) => {
                const raw = Array.isArray(res) ? res : (res?.result || []);
                return raw.map(item => item.result ? item.result : item);
            };

            setRecords(clean(resRecord));
            setEmployees(clean(resEmp));
        } catch (error) {
            console.error("Lỗi MySQL:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // XỬ LÝ DUYỆT / TỪ CHỐI
    const handleUpdateStatus = async (id, status) => {
        try {
            const response = await leaveRecordApi.updateStatus(id, status);
            if (response) {
                alert(`Hệ thống: Đã chuyển trạng thái sang ${status === 'APPROVED' ? 'ĐÃ DUYỆT' : 'TỪ CHỐI'}`);
                
                // QUAN TRỌNG: Phải đợi lấy dữ liệu mới xong thì giao diện mới đổi
                await fetchData(); 
            }
        } catch (error) {
            alert("Lỗi: Kiểm tra quyền Admin hoặc kết nối mạng (999)!");
        }
    };

    const getEmployeeName = (r) => {
        const found = employees.find(e => e.id === (r.employeeId || r.employee_id));
        return found ? found.fullName : `NV-${r.employeeId || r.employee_id}`;
    };

    // Hàm quy đổi trạng thái để hiển thị và bắt điều kiện ẩn nút
    const getStatusInfo = (status) => {
        const s = String(status || '').toUpperCase();
        if (s === 'APPROVED' || s === 'ĐÃ DUYỆT') return { label: 'Đã duyệt', color: '#2ecc71', bg: '#d4edda', active: false };
        if (s === 'REJECTED' || s === 'TỪ CHỐI') return { label: 'Từ chối', color: '#e74c3c', bg: '#f8d7da', active: false };
        return { label: 'Chờ duyệt', color: '#f39c12', bg: '#fff3cd', active: true };
    };

    if (loading) return <div style={{ padding: '20px' }}>Đang cập nhật trạng thái...</div>;

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>| 7. QUẢN LÝ ĐƠN NGHỈ PHÉP</h2>
            
            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeader}>
                            <th style={styles.th}>Nhân viên</th>
                            <th style={styles.th}>Lý do</th>
                            <th style={styles.th}>Trạng thái</th>
                            <th style={styles.th}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.length > 0 ? records.map((r, index) => {
                            const statusInfo = getStatusInfo(r.status);

                            return (
                                <tr key={r.id || index} style={styles.tr}>
                                    <td style={styles.td}><b>{getEmployeeName(r)}</b></td>
                                    <td style={styles.td}><i>{r.reason}</i></td>
                                    <td style={styles.td}>
                                        <span style={{...styles.badge, backgroundColor: statusInfo.bg, color: statusInfo.color}}>
                                            {statusInfo.label}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        {/* CHỈ HIỆN NÚT DUYỆT/TỪ CHỐI NẾU TRẠNG THÁI LÀ CHỜ DUYỆT */}
                                        {statusInfo.active ? (
                                            <div style={{display: 'flex', gap: '5px'}}>
                                                <button style={styles.btnApprove} onClick={() => handleUpdateStatus(r.id, 'APPROVED')}>Duyệt</button>
                                                <button style={styles.btnReject} onClick={() => handleUpdateStatus(r.id, 'REJECTED')}>Từ chối</button>
                                            </div>
                                        ) : (
                                            <span style={{color: '#7f8c8d', fontSize: '13px', fontWeight: '500'}}>✓ Hoàn tất</span>
                                        )}
                                        
                                        {/* Nút xóa luôn hiện để Admin dọn dẹp nếu muốn */}
                                        <button style={styles.btnDel} onClick={async () => {
                                            if(window.confirm("Xóa vĩnh viễn đơn này?")) {
                                                await leaveRecordApi.delete(r.id);
                                                fetchData();
                                            }
                                        }}>Xóa</button>
                                    </td>
                                </tr>
                            );
                        }) : <tr><td colSpan="4" style={{textAlign: 'center', padding: '40px'}}>Bảng trống.</td></tr>}
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
    btnApprove: { padding: '6px 12px', backgroundColor: '#2ecc71', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
    btnReject: { padding: '6px 12px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
    btnDel: { padding: '6px 12px', backgroundColor: '#ecf0f1', color: '#c0392b', border: '1px solid #dcdde1', borderRadius: '4px', cursor: 'pointer', marginLeft: '10px' }
};

export default LeaveRecordList;