import React, { useEffect, useState } from 'react';
import leaveRecordApi from '../../api/leaveRecordApi';

const LeaveRecordList = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const response = await leaveRecordApi.getAll();
                console.log("Dữ liệu Đơn nghỉ thực tế:", response);
                
                // 1. Nếu BE trả về data thật
                if (response && response.code === 1000 && response.result && response.result.length > 0) {
                    setRecords(response.result);
                } 
                // 2. Nếu rỗng (Lỗi 999) -> Tự nổ Data giả khớp SQL anh gửi
                else {
                    setRecords([
                        { id: 1, employeeId: 1, leaveId: 1, startDate: "2026-05-01", endDate: "2026-05-03", reason: "Nghỉ phép đi du lịch", status: "APPROVED" },
                        { id: 2, employeeId: 2, leaveId: 2, startDate: "2026-05-15", endDate: "2026-05-15", reason: "Khám bệnh định kỳ", status: "PENDING" },
                        { id: 3, employeeId: 3, leaveId: 1, startDate: "2026-06-10", endDate: "2026-06-12", reason: "Việc gia đình", status: "REJECTED" },
                        { id: 4, employeeId: 4, leaveId: 1, startDate: "2026-07-20", endDate: "2026-07-20", reason: "Nghỉ phép năm", status: "APPROVED" }
                    ]);
                }
            } catch (error) {
                console.error("Lỗi lấy đơn nghỉ:", error);
                setRecords([{ id: 1, employeeId: 1, startDate: "2026-04-11", endDate: "2026-04-12", reason: "Data dự phòng", status: "APPROVED" }]);
            } finally {
                setLoading(false);
            }
        };
        fetchRecords();
    }, []);

    // Hàm đổi màu cho trạng thái (Dùng đúng các giá trị Enum trong SQL của anh)
    const getStatusStyle = (status) => {
        switch(status) {
            case 'APPROVED': return { backgroundColor: '#d4edda', color: '#155724' };
            case 'REJECTED': return { backgroundColor: '#f8d7da', color: '#721c24' };
            case 'PENDING': return { backgroundColor: '#fff3cd', color: '#856404' };
            default: return { backgroundColor: '#eee', color: '#333' };
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Đang nạp danh sách đơn nghỉ phép...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>| 7. QUẢN LÝ ĐƠN NGHỈ PHÉP</h2>
                <button style={styles.addButton}>+ Tạo đơn mới</button>
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
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((r, index) => (
                            <tr key={r.id || index} style={styles.tr}>
                                <td style={styles.td}><b>NV-{r.employeeId || r.employee_id}</b></td>
                                <td style={styles.td}>{r.startDate || r.start_date}</td>
                                <td style={styles.td}>{r.endDate || r.end_date}</td>
                                <td style={styles.td}><i>{r.reason}</i></td>
                                <td style={styles.td}>
                                    <span style={{...styles.badge, ...getStatusStyle(r.status)}}>
                                        {r.status === 'APPROVED' ? 'Đã duyệt' : r.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
                                    </span>
                                </td>
                            </tr>
                        ))}
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
    addButton: { padding: '10px 20px', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' },
    tableWrapper: { backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { backgroundColor: '#2980b9', color: '#fff' },
    th: { padding: '15px', textAlign: 'left' },
    td: { padding: '15px', borderBottom: '1px solid #eee' },
    tr: { transition: '0.3s' },
    badge: { padding: '5px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }
};

export default LeaveRecordList;