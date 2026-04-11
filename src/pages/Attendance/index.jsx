import React, { useEffect, useState } from 'react';
import attendanceApi from '../../api/attendanceApi';

const AttendanceList = () => {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await attendanceApi.getAll();
            // FIX: BE trả về mảng trực tiếp (Array) hoặc trong result
            const data = response?.result || (Array.isArray(response) ? response : []);
            setList(data);
        } catch (error) {
            console.error("Lỗi lấy dữ liệu chấm công:", error);
            setList([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // 2. CHỨC NĂNG CHECK-IN (Đúng 100% API BE)
    const handleCheckIn = async () => {
        try {
            await attendanceApi.checkIn();
            alert("VÀO CA thành công!");
            fetchData();
        } catch (error) {
            const msg = error.response?.data?.message || "Bạn đã Check-in hôm nay rồi!";
            alert(`Lỗi: ${msg}`);
        }
    };

    // 3. CHỨC NĂNG CHECK-OUT (Đúng 100% API BE)
    const handleCheckOut = async () => {
        try {
            await attendanceApi.checkOut();
            alert("RA CA thành công!");
            fetchData();
        } catch (error) {
            const msg = error.response?.data?.message || "Bạn chưa Check-in hoặc đã Check-out rồi!";
            alert(`Lỗi: ${msg}`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Xóa bản ghi này?")) {
            try { await attendanceApi.delete(id); fetchData(); } 
            catch (error) { alert("Lỗi khi xóa!"); }
        }
    };

    const renderStatus = (status) => {
        switch(status) {
            case 'PRESENT': return <span style={{...styles.badge, backgroundColor: '#d4edda', color: '#155724'}}>Đúng giờ</span>;
            case 'LATE': return <span style={{...styles.badge, backgroundColor: '#fff3cd', color: '#856404'}}>Đi muộn</span>;
            case 'EARLY_LEAVE': return <span style={{...styles.badge, backgroundColor: '#f8d7da', color: '#721c24'}}>Về sớm</span>;
            default: return <span style={styles.badge}>{status || '---'}</span>;
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Đang nạp dữ liệu chấm công từ MySQL...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>| QUẢN LÝ CHẤM CÔNG</h2>
                {/* ĐÃ BỎ DÒNG CHỮ DỮ LIỆU GHI NHẬN... THEO Ý ANH */}
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
                        {list.length > 0 ? list.map((item, index) => (
                            <tr key={item.id || index} style={styles.tr}>
                                <td style={styles.td}>{item.workDate || item.work_date || '---'}</td>
                                <td style={{ ...styles.td, color: '#28a745', fontWeight: 'bold' }}>
                                    {item.checkIn || item.check_in || '---'}
                                </td>
                                <td style={{ ...styles.td, color: '#dc3545', fontWeight: 'bold' }}>
                                    {item.checkOut || item.check_out || '---'}
                                </td>
                                <td style={styles.td}>{renderStatus(item.status)}</td>
                                <td style={styles.td}>
                                    <button onClick={() => handleDelete(item.id)} style={styles.btnDel}>Xóa</button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Chưa có dữ liệu. Hãy nhấn "Vào ca" để bắt đầu!</td></tr>
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