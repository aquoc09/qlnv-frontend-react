import React, { useEffect, useState } from 'react';
import attendanceApi from '../../api/attendanceApi';

const AttendanceList = () => {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. HÀM LẤY DATA THẬT
    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const response = await attendanceApi.getAll();
            // Bóc tách dữ liệu chuẩn từ result của BE anh
            if (response && response.code === 1000) {
                setList(response.result || []);
            } else if (Array.isArray(response)) {
                setList(response);
            }
        } catch (error) {
            console.error("Lỗi kết nối API:", error);
            setList([]); // Nếu lỗi thì để danh sách trống, không dùng data giả nữa
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, []);

    // 2. CHỨC NĂNG CHECK-IN
    const handleCheckIn = async () => {
        try {
            await attendanceApi.checkIn();
            alert("Điểm danh VÀO thành công!");
            fetchAttendance();
        } catch (error) {
            alert("Lỗi: Bạn đã Check-in hôm nay rồi hoặc phiên làm việc chưa kết thúc!");
        }
    };

    // 3. CHỨC NĂNG CHECK-OUT
    const handleCheckOut = async () => {
        try {
            await attendanceApi.checkOut();
            alert("Điểm danh RA thành công!");
            fetchAttendance();
        } catch (error) {
            alert("Lỗi: Bạn chưa Check-in hoặc đã Check-out rồi!");
        }
    };

    // 4. CHỨC NĂNG XÓA (ADMIN)
    const handleDelete = async (id) => {
        if (window.confirm("Anh có chắc muốn xóa bản ghi chấm công này?")) {
            try {
                await attendanceApi.delete(id);
                fetchAttendance();
            } catch (error) {
                alert("Không thể xóa bản ghi này!");
            }
        }
    };

    const renderStatus = (status) => {
        switch(status) {
            case 'PRESENT': return <span style={{...styles.badge, backgroundColor: '#d4edda', color: '#155724'}}>Đúng giờ</span>;
            case 'LATE': return <span style={{...styles.badge, backgroundColor: '#fff3cd', color: '#856404'}}>Đi muộn</span>;
            case 'EARLY_LEAVE': return <span style={{...styles.badge, backgroundColor: '#f8d7da', color: '#721c24'}}>Về sớm</span>;
            default: return <span style={styles.badge}>{status || 'Chưa xác định'}</span>;
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Đang kết nối cơ sở dữ liệu...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>| QUẢN LÝ CHẤM CÔNG</h2>
                    <p style={styles.info}>Dữ liệu ghi nhận từ hệ thống máy chủ</p>
                </div>
                {/* NHÓM NÚT CHỨC NĂNG THỰC TẾ */}
                <div style={styles.actionGroup}>
                    <button onClick={handleCheckIn} style={styles.btnIn}>VÀO CA (Check-in)</button>
                    <button onClick={handleCheckOut} style={styles.btnOut}>RA CA (Check-out)</button>
                </div>
            </div>
            
            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeader}>
                            <th style={styles.th}>Ngày làm việc</th>
                            <th style={styles.th}>Giờ vào</th>
                            <th style={styles.th}>Giờ ra</th>
                            <th style={styles.th}>Trạng thái</th>
                            <th style={styles.th}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.length > 0 ? (
                            list.map((item, index) => (
                                <tr key={item.id || index} style={styles.tr}>
                                    <td style={styles.td}>{item.workDate || item.work_date}</td>
                                    <td style={{ ...styles.td, color: '#28a745', fontWeight: 'bold' }}>
                                        {item.checkIn || item.check_in}
                                    </td>
                                    <td style={{ ...styles.td, color: '#dc3545', fontWeight: 'bold' }}>
                                        {item.checkOut || item.check_out || '---'}
                                    </td>
                                    <td style={styles.td}>{renderStatus(item.status)}</td>
                                    <td style={styles.td}>
                                        <button 
                                            onClick={() => handleDelete(item.id)} 
                                            style={styles.btnDel}
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                                    Hiện chưa có dữ liệu chấm công thật trong MySQL.
                                </td>
                            </tr>
                        )}
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
    info: { color: '#666', margin: 0 },
    actionGroup: { display: 'flex', gap: '10px' },
    btnIn: { padding: '10px 20px', backgroundColor: '#27ae60', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
    btnOut: { padding: '10px 20px', backgroundColor: '#e67e22', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
    btnDel: { padding: '5px 10px', backgroundColor: '#eb4d4b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    tableWrapper: { backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { backgroundColor: '#2c3e50', color: '#fff' },
    th: { padding: '15px', textAlign: 'left' },
    td: { padding: '15px', borderBottom: '1px solid #eee' },
    tr: { transition: '0.3s' },
    badge: { padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }
};

export default AttendanceList;