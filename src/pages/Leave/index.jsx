import React, { useEffect, useState } from 'react';
import leaveApi from '../../api/leaveApi';

const LeaveTypeList = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaves = async () => {
            try {
                const response = await leaveApi.getAll();
                console.log("Dữ liệu Loại nghỉ:", response);
                
                // Logic bóc tách dữ liệu linh hoạt
                if (Array.isArray(response)) {
                    const extracted = response.map(item => item.result || item).filter(Boolean);
                    setLeaves(extracted);
                } else if (response && response.code === 1000) {
                    setLeaves(response.result || []);
                }
            } catch (error) {
                console.error("Lỗi lấy danh mục nghỉ:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaves();
    }, []);

    if (loading) return <div style={{ padding: '20px' }}>Đang kết nối Database MySQL...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>| DANH MỤC LOẠI NGHỈ</h2>
                <div style={styles.info}>Cấu hình ngày nghỉ mặc định của công ty</div>
            </div>
            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeader}>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>Tên Loại Nghỉ</th>
                            <th style={styles.th}>Số ngày tối đa</th>
                            <th style={styles.th}>Tính lương</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaves.length > 0 ? (
                            leaves.map((l, index) => (
                                <tr key={l.id || index} style={styles.tr}>
                                    <td style={styles.td}>{l.id}</td>
                                    <td style={styles.td}><b>{l.leave_name || l.leaveName}</b></td>
                                    <td style={styles.td}>{l.default_days || l.defaultDays} ngày</td>
                                    <td style={styles.td}>
                                        {l.paid ? 
                                            <span style={{color: '#28a745', fontWeight: 'bold'}}>Có trả lương</span> : 
                                            <span style={{color: '#dc3545'}}>Nghỉ không lương</span>
                                        }
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{textAlign: 'center', padding: '40px'}}>
                                    <b>Bảng hiện đang trống.</b> <br/>
                                    <small>Anh hãy kiểm tra bảng `leaves` trong MySQL xem có dữ liệu chưa nhé!</small>
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
    header: { marginBottom: '30px' },
    title: { margin: 0, color: '#2c3e50', fontSize: '24px' },
    info: { color: '#666', marginTop: '5px' },
    tableWrapper: { backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { backgroundColor: '#9b59b6', color: '#fff' },
    th: { padding: '15px', textAlign: 'left', fontWeight: 'bold' },
    td: { padding: '15px', borderBottom: '1px solid #eee' },
    tr: { transition: '0.3s' }
};

export default LeaveTypeList;