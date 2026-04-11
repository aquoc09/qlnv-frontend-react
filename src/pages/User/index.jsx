import React, { useEffect, useState } from 'react';
import userApi from '../../api/userApi';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 1. LẤY DỮ LIỆU VÀ BÓC TRẦN (Gỡ lớp result lồng nhau)
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await userApi.getAll();
            
            // HÀM BÓC TÁCH: Nếu item có .result thì lấy .result (đây là ruột chứa tên, ngày sinh)
            const rawData = Array.isArray(response) ? response : (response?.result || []);
            const cleanUsers = rawData.map(item => (item.result ? item.result : item));
            
            setUsers(cleanUsers);
            console.log("Dữ liệu tài khoản đã bóc trần:", cleanUsers);
        } catch (error) {
            console.error("Lỗi lấy danh sách tài khoản:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    // 2. HÀM THÊM TÀI KHOẢN (Gửi dữ liệu chuẩn BE Java)
    const handleAddUser = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.target);
        const f = Object.fromEntries(formData.entries());
        
        const dataSubmit = {
            username: f.username,
            password: f.password,
            firstName: f.firstName,
            lastName: f.lastName,
            dob: f.dob,
            roles: [f.role] 
        };

        try {
            await userApi.create(dataSubmit);
            alert("Đã tạo tài khoản thành công vào MySQL!");
            setIsModalOpen(false);
            await fetchUsers(); // Load lại để hiện người mới
        } catch (error) {
            alert("Lỗi: " + (error.response?.data?.message || "Kiểm tra lại Username!"));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Đang bóc tách dữ liệu người dùng...</div>;

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
                            <th style={styles.th}>Username</th>
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
                                    {/* BÓC TRẦN TÊN: Dò tìm mọi trường BE có thể trả về */}
                                    <td style={styles.td}>
                                        {(u.firstName || u.first_name || '') + ' ' + (u.lastName || u.last_name || '')}
                                    </td>
                                    {/* BÓC TRẦN NGÀY SINH */}
                                    <td style={styles.td}>{u.dob || u.dateOfBirth || "---"}</td>
                                    <td style={styles.td}>
                                        {u.roles?.map((r, i) => (
                                            <span key={i} style={styles.roleBadge}>
                                                {typeof r === 'object' ? (r.name || r.roleName) : r}
                                            </span>
                                        ))}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>MySQL chưa có tài khoản nào.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h3 style={{marginTop: 0}}>THÊM TÀI KHOẢN MỚI</h3>
                        <form onSubmit={handleAddUser}>
                            <input name="username" placeholder="Tên đăng nhập (Email)" required style={styles.input}/>
                            <input name="password" type="password" placeholder="Mật khẩu" required style={styles.input}/>
                            
                            <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                                <input name="firstName" placeholder="Họ và tên đệm" required style={styles.input}/>
                                <input name="lastName" placeholder="Tên" required style={styles.input}/>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Ngày sinh:</label>
                                <input name="dob" type="date" required style={styles.input}/>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Quyền hạn:</label>
                                <select name="role" style={styles.input} required>
                                    <option value="ADMIN">QUẢN TRỊ VIÊN (ADMIN)</option>
                                    <option value="HR">NHÂN SỰ (HR)</option>
                                    <option value="USER">NHÂN VIÊN (USER)</option>
                                </select>
                            </div>
                            
                            <div style={styles.btnGroup}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.btnCancel}>Hủy</button>
                                <button type="submit" disabled={isSubmitting} style={styles.btnSave}>
                                    {isSubmitting ? "Đang lưu..." : "Lưu MySQL"}
                                </button>
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
    addButton: { padding: '12px 25px', backgroundColor: '#2980b9', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' },
    tableWrapper: { backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { backgroundColor: '#2c3e50', color: '#fff' },
    th: { padding: '15px', textAlign: 'left' },
    td: { padding: '15px', borderBottom: '1px solid #eee' },
    tr: { transition: '0.3s' },
    roleBadge: { padding: '3px 8px', backgroundColor: '#e1f5fe', color: '#01579b', borderRadius: '4px', fontSize: '11px', marginRight: '5px', fontWeight: 'bold' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', width: '450px' },
    inputGroup: { marginTop: '15px' },
    label: { display: 'block', fontWeight: 'bold', fontSize: '12px', marginBottom: '5px' },
    input: { width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' },
    btnGroup: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
    btnCancel: { padding: '10px 20px', backgroundColor: '#eee', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    btnSave: { padding: '10px 20px', backgroundColor: '#2980b9', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }
};

export default UserList;