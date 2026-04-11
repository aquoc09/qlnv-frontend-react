import React, { useEffect, useState } from 'react';
import userApi from '../../api/userApi';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await userApi.getAll();
            console.log("Dữ liệu thô từ BE:", response);

            // BÓC TÁCH MẠNH: Chấp nhận mọi kiểu trả về từ Java (Mảng trực tiếp hoặc .result)
            let rawData = [];
            if (Array.isArray(response)) {
                rawData = response;
            } else if (response?.result && Array.isArray(response.result)) {
                rawData = response.result;
            } else if (response?.result) {
                rawData = [response.result];
            }

            // PHÁ VỎ TỪNG USER: Nếu user bị bọc trong .result thì lột ra
            const cleanUsers = rawData.map(u => (u.result ? u.result : u));
            
            setUsers(cleanUsers);
        } catch (error) {
            console.error("Lỗi lấy danh sách tài khoản:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    // HÀM HIỂN THỊ DỮ LIỆU (Dò tìm mọi tên biến có thể có trong MySQL/Java)
    const renderFullName = (u) => {
        const fName = u.firstName || u.first_name || u.firstname || "";
        const lName = u.lastName || u.last_name || u.lastname || "";
        const fullName = `${fName} ${lName}`.trim();
        return fullName || "Chưa đặt tên";
    };

    const renderDob = (u) => {
        return u.dob || u.dateOfBirth || u.birthday || u.birth_date || "---";
    };

    const renderRoles = (u) => {
        if (!u.roles || !Array.isArray(u.roles)) return <span style={styles.roleBadge}>USER</span>;
        return u.roles.map((r, i) => (
            <span key={i} style={styles.roleBadge}>
                {typeof r === 'object' ? (r.name || r.roleName || r.role_name) : r}
            </span>
        ));
    };

    if (loading) return <div style={{ padding: '20px' }}>Đang bóc tách dữ liệu từ MySQL online...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>| 10. QUẢN TRỊ TÀI KHOẢN</h2>
                <button style={styles.addButton} onClick={() => setIsModalOpen(true)}>+ Thêm tài khoản</button>
            </div>
            
            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeader}>
                            <th style={styles.th}>Username (Email)</th>
                            <th style={styles.th}>Họ và Tên</th>
                            <th style={styles.th}>Ngày sinh</th>
                            <th style={styles.th}>Quyền hạn</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? (
                            users.map((u, index) => (
                                <tr key={u.id || index} style={styles.tr}>
                                    <td style={styles.td}><b>{u.username}</b></td>
                                    {/* HIỆN HỌ TÊN - BÓC TRẦN BIẾN */}
                                    <td style={styles.td}>{renderFullName(u)}</td>
                                    {/* HIỆN NGÀY SINH - BÓC TRẦN BIẾN */}
                                    <td style={styles.td}>{renderDob(u)}</td>
                                    <td style={styles.td}>{renderRoles(u)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>Không có dữ liệu tài khoản.</td></tr>
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
    addButton: { padding: '12px 25px', backgroundColor: '#2980b9', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' },
    tableWrapper: { backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { backgroundColor: '#2c3e50', color: '#fff' },
    th: { padding: '15px', textAlign: 'left' },
    td: { padding: '15px', borderBottom: '1px solid #eee' },
    tr: { transition: '0.3s' },
    roleBadge: { padding: '3px 8px', backgroundColor: '#e1f5fe', color: '#01579b', borderRadius: '4px', fontSize: '11px', marginRight: '5px', fontWeight: 'bold' }
};

export default UserList;