import React, { useEffect, useState } from 'react';
import roleApi from '../../api/roleApi';

const RoleList = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await roleApi.getAll();
                console.log("Dữ liệu Phân quyền:", response);
                
                if (response && response.code === 1000) {
                    setRoles(response.result || []);
                } else if (Array.isArray(response)) {
                    const extracted = response.map(item => item.result || item).filter(Boolean);
                    setRoles(extracted);
                }
            } catch (error) {
                console.error("Lỗi lấy danh sách quyền:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRoles();
    }, []);

    if (loading) return <div style={{ padding: '20px' }}>Đang nạp cấu hình quyền...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>| 11. PHÂN QUYỀN HỆ THỐNG</h2>
                <p style={{color: '#666'}}>Quản lý các vai trò và chức năng truy cập</p>
            </div>
            
            <div style={styles.grid}>
                {roles.length > 0 ? (
                    roles.map((role, index) => (
                        <div key={role.name || index} style={styles.card}>
                            <div style={styles.cardIcon}>🛡️</div>
                            <h3 style={styles.roleName}>{role.name}</h3>
                            <p style={styles.roleDesc}>{role.description || "Quyền hạn truy cập và thao tác các module hệ thống."}</p>
                            <div style={styles.badge}>Active</div>
                        </div>
                    ))
                ) : (
                    <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '50px'}}>
                        <b>Chưa có dữ liệu phân quyền.</b>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '40px', backgroundColor: '#f4f7f6', minHeight: '100vh' },
    header: { marginBottom: '30px' },
    title: { margin: 0, color: '#2c3e50', fontSize: '24px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' },
    card: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'center', position: 'relative' },
    cardIcon: { fontSize: '40px', marginBottom: '15px' },
    roleName: { color: '#2c3e50', margin: '0 0 10px 0', fontSize: '20px', textTransform: 'uppercase' },
    roleDesc: { color: '#7f8c8d', fontSize: '14px', lineHeight: '1.5' },
    badge: { position: 'absolute', top: '15px', right: '15px', backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }
};

export default RoleList;