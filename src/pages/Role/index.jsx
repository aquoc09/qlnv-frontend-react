import React, { useEffect, useState } from 'react';
import roleApi from '../../api/roleApi';

const RoleList = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 1. LẤY DATA THẬT TỪ BE
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await roleApi.getAll();
            if (response && response.code === 1000) {
                setRoles(response.result || []);
            } else if (Array.isArray(response)) {
                setRoles(response);
            }
        } catch (error) {
            console.error("Lỗi kết nối MySQL:", error);
            setRoles([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // 2. XỬ LÝ THÊM QUYỀN MỚI
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            await roleApi.create(data);
            alert("Đã thêm vai trò mới vào hệ thống!");
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            alert("Lỗi: Vai trò này đã tồn tại hoặc BE không cho phép!");
        }
    };

    // 3. XỬ LÝ XÓA QUYỀN
    const handleDelete = async (roleName) => {
        if (window.confirm(`Anh có chắc muốn xóa quyền ${roleName}?`)) {
            try {
                await roleApi.delete(roleName);
                alert("Đã xóa quyền!");
                fetchData();
            } catch (error) {
                alert("Không thể xóa quyền này (có thể do đang có User sử dụng)!");
            }
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Đang nạp cấu hình bảo mật...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>| 11. PHÂN QUYỀN HỆ THỐNG</h2>
                    <p style={{color: '#666', margin: 0}}>Quản lý vai trò bảo mật trích xuất từ MySQL</p>
                </div>
                <button style={styles.addButton} onClick={() => setIsModalOpen(true)}>+ Thêm quyền mới</button>
            </div>
            
            <div style={styles.grid}>
                {roles.length > 0 ? (
                    roles.map((role, index) => (
                        <div key={role.name || index} style={styles.card}>
                            <button 
                                style={styles.delBtn} 
                                onClick={() => handleDelete(role.name)}
                                title="Xóa quyền này"
                            >
                                ×
                            </button>
                            <div style={styles.cardIcon}>🛡️</div>
                            <h3 style={styles.roleName}>{role.name}</h3>
                            <p style={styles.roleDesc}>{role.description || "Quyền hạn truy cập và thao tác các module hệ thống."}</p>
                            <div style={styles.badge}>Hệ thống</div>
                        </div>
                    ))
                ) : (
                    <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '50px'}}>
                        <b>Chưa có dữ liệu phân quyền thực tế trong Database.</b>
                    </div>
                )}
            </div>

            {/* MODAL THÊM QUYỀN */}
            {isModalOpen && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h3 style={{marginTop: 0}}>THÊM VAI TRÒ MỚI</h3>
                        <form onSubmit={handleSubmit}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Tên quyền (Viết hoa, ví dụ: MANAGER):</label>
                                <input name="name" style={styles.input} placeholder="ADMIN / USER..." required />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Mô tả chi tiết:</label>
                                <textarea name="description" style={styles.input} rows="3" placeholder="Quyền hạn của vai trò này..."></textarea>
                            </div>
                            <div style={styles.btnGroup}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.btnCancel}>Hủy</button>
                                <button type="submit" style={styles.btnSave}>Lưu vào MySQL</button>
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
    addButton: { padding: '10px 20px', backgroundColor: '#34495e', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' },
    card: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'center', position: 'relative' },
    cardIcon: { fontSize: '40px', marginBottom: '15px' },
    roleName: { color: '#2c3e50', margin: '0 0 10px 0', fontSize: '20px', textTransform: 'uppercase' },
    roleDesc: { color: '#7f8c8d', fontSize: '14px', lineHeight: '1.5' },
    badge: { position: 'absolute', top: '15px', right: '15px', backgroundColor: '#e1f5fe', color: '#0288d1', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' },
    delBtn: { position: 'absolute', top: '5px', left: '10px', border: 'none', background: 'none', fontSize: '20px', color: '#ccc', cursor: 'pointer' },
    // Modal
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', width: '350px' },
    inputGroup: { marginBottom: '15px' },
    label: { display: 'block', fontWeight: 'bold', fontSize: '12px', marginBottom: '5px' },
    input: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' },
    btnGroup: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
    btnCancel: { padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    btnSave: { padding: '10px 20px', backgroundColor: '#34495e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }
};

export default RoleList;