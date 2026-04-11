import React, { useEffect, useState } from 'react';
import userApi from '../../api/userApi';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null); // Để phân biệt Thêm hay Sửa

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await userApi.getAll();
            // BÓC TÁCH MẠNH: Lấy ruột từ .result hoặc mảng trực tiếp
            let rawData = Array.isArray(response) ? response : (response?.result || []);
            const cleanUsers = rawData.map(u => (u.result ? u.result : u));
            setUsers(cleanUsers);
        } catch (error) {
            console.error("Lỗi MySQL:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    // 1. XỬ LÝ LƯU (THÊM HOẶC SỬA)
    const handleSubmit = async (e) => {
        e.preventDefault();
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
            if (currentUser) {
                // Lệnh SỬA (PUT)
                await userApi.update(currentUser.id, dataSubmit);
                alert("Cập nhật tài khoản thành công!");
            } else {
                // Lệnh THÊM (POST)
                await userApi.create(dataSubmit);
                alert("Tạo tài khoản mới thành công!");
            }
            setIsModalOpen(false);
            fetchUsers();
        } catch (error) {
            alert("Lỗi: Username đã tồn tại hoặc Token 999 hết hạn!");
        }
    };

    // 2. XỬ LÝ XÓA
    const handleDelete = async (id) => {
        if (!window.confirm("Anh có chắc muốn xóa vĩnh viễn tài khoản này?")) return;
        try {
            await userApi.delete(id);
            alert("Đã xóa tài khoản khỏi MySQL!");
            fetchUsers();
        } catch (error) {
            alert("Lỗi xóa: Kiểm tra quyền Admin 999");
        }
    };

    const renderFullName = (u) => {
        const f = u.firstName || u.first_name || "";
        const l = u.lastName || u.last_name || "";
        return `${f} ${l}`.trim() || u.username;
    };

    if (loading) return <div style={{ padding: '20px' }}>Đang nạp danh sách tài khoản...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>| 10. QUẢN TRỊ TÀI KHOẢN</h2>
                <button style={styles.addButton} onClick={() => { setCurrentUser(null); setIsModalOpen(true); }}>+ Tạo tài khoản</button>
            </div>
            
            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeader}>
                            <th style={styles.th}>Username</th>
                            <th style={styles.th}>Họ và Tên</th>
                            <th style={styles.th}>Ngày sinh</th>
                            <th style={styles.th}>Quyền hạn</th>
                            <th style={styles.th}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u, index) => (
                            <tr key={u.id || index} style={styles.tr}>
                                <td style={styles.td}><b>{u.username}</b></td>
                                <td style={styles.td}>{renderFullName(u)}</td>
                                <td style={styles.td}>{u.dob || u.dateOfBirth || "---"}</td>
                                <td style={styles.td}>
                                    {u.roles?.map((r, i) => (
                                        <span key={i} style={styles.roleBadge}>{typeof r === 'object' ? r.name : r}</span>
                                    ))}
                                </td>
                                <td style={styles.td}>
                                    <button style={styles.editBtn} onClick={() => { setCurrentUser(u); setIsModalOpen(true); }}>Sửa</button>
                                    <button style={styles.delBtn} onClick={() => handleDelete(u.id)}>Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL THÊM/SỬA */}
            {isModalOpen && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h3>{currentUser ? "CẬP NHẬT TÀI KHOẢN" : "THÊM TÀI KHOẢN MỚI"}</h3>
                        <form onSubmit={handleSubmit}>
                            <label style={styles.label}>Tên đăng nhập:</label>
                            <input name="username" defaultValue={currentUser?.username} disabled={!!currentUser} style={styles.input} required />
                            
                            <label style={styles.label}>Mật khẩu:</label>
                            <input name="password" type="password" placeholder={currentUser ? "Để trống nếu không đổi" : "Nhập mật khẩu"} style={styles.input} required={!currentUser} />
                            
                            <div style={{display: 'flex', gap: '10px'}}>
                                <div style={{flex: 1}}>
                                    <label style={styles.label}>Họ:</label>
                                    <input name="firstName" defaultValue={currentUser?.firstName} style={styles.input} required />
                                </div>
                                <div style={{flex: 1}}>
                                    <label style={styles.label}>Tên:</label>
                                    <input name="lastName" defaultValue={currentUser?.lastName} style={styles.input} required />
                                </div>
                            </div>

                            <label style={styles.label}>Ngày sinh:</label>
                            <input name="dob" type="date" defaultValue={currentUser?.dob} style={styles.input} required />

                            <label style={styles.label}>Quyền hạn:</label>
                            <select name="role" defaultValue={currentUser?.roles?.[0]?.name || "USER"} style={styles.input}>
                                <option value="ADMIN">ADMIN</option>
                                <option value="HR">HR</option>
                                <option value="USER">USER</option>
                            </select>

                            <div style={styles.btnGroup}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.btnCancel}>Hủy</button>
                                <button type="submit" style={styles.btnSave}>Lưu MySQL</button>
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
    addButton: { padding: '10px 20px', backgroundColor: '#2980b9', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' },
    tableWrapper: { backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { backgroundColor: '#2c3e50', color: '#fff' },
    th: { padding: '15px', textAlign: 'left' },
    td: { padding: '15px', borderBottom: '1px solid #eee' },
    tr: { transition: '0.3s' },
    editBtn: { padding: '5px 10px', backgroundColor: '#f1c40f', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' },
    delBtn: { padding: '5px 10px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    roleBadge: { padding: '2px 6px', backgroundColor: '#e1f5fe', color: '#01579b', borderRadius: '4px', fontSize: '11px', marginRight: '5px' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', width: '400px' },
    label: { display: 'block', fontWeight: 'bold', fontSize: '12px', marginTop: '10px' },
    input: { width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' },
    btnGroup: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
    btnCancel: { padding: '10px 20px', backgroundColor: '#eee', border: 'none', borderRadius: '6px' },
    btnSave: { padding: '10px 20px', backgroundColor: '#2980b9', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold' }
};

export default UserList;