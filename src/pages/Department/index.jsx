import React, { useEffect, useState } from 'react';
import departmentApi from '../../api/departmentApi';

const DepartmentList = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Quản lý Modal và Dữ liệu đang chọn
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentDept, setCurrentDept] = useState(null); // null = Thêm, có data = Sửa

    // 1. HÀM LẤY DANH SÁCH THẬT TỪ BE
    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const response = await departmentApi.getAll();
            console.log("Dữ liệu bóc tách từ BE:", response);
            
            if (Array.isArray(response)) {
                const extractedData = response.map(item => item.result || item).filter(Boolean);
                setDepartments(extractedData);
            } else if (response && response.code === 1000) {
                setDepartments(response.result || []);
            }
        } catch (error) {
            console.error("Lỗi lấy danh sách phòng ban:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    // 2. HÀM XỬ LÝ XÓA PHÒNG BAN
    const handleDelete = async (id) => {
        if (!id) return;
        if (window.confirm(`Anh có chắc chắn muốn xóa phòng ban ID: ${id}?`)) {
            try {
                const res = await departmentApi.delete(id);
                // Kiểm tra nếu xóa thành công (BE trả về code 1000 hoặc response không lỗi)
                if (res && (res.code === 1000 || res)) {
                    alert("Đã xóa phòng ban thành công!");
                    fetchDepartments();
                }
            } catch (err) {
                alert("Lỗi khi xóa: Phòng ban này có thể đang chứa nhân viên, không thể xóa!");
            }
        }
    };

    // 3. HÀM XỬ LÝ LƯU (THÊM HOẶC SỬA)
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            if (currentDept) {
                // GỌI API UPDATE (PUT)
                const id = currentDept.department_id || currentDept.departmentId || currentDept.id;
                await departmentApi.update(id, data);
                alert("Cập nhật phòng ban thành công!");
            } else {
                // GỌI API CREATE (POST)
                await departmentApi.create(data);
                alert("Thêm phòng ban mới thành công!");
            }
            setIsModalOpen(false);
            fetchDepartments();
        } catch (err) {
            alert("Lỗi khi gửi dữ liệu lên Backend! Anh kiểm tra lại quyền truy cập.");
        }
    };

    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Đang nạp dữ liệu từ MySQL...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>| QUẢN LÝ PHÒNG BAN</h2>
                <button 
                    style={styles.addButton} 
                    onClick={() => { setCurrentDept(null); setIsModalOpen(true); }}
                >
                    + Thêm phòng ban mới
                </button>
            </div>

            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeader}>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>Tên Phòng Ban</th>
                            <th style={styles.th}>Mã Trưởng Phòng</th>
                            <th style={styles.th}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departments.length > 0 ? (
                            departments.map((dept, index) => {
                                const deptId = dept.department_id || dept.departmentId || dept.id;
                                return (
                                    <tr key={deptId || index} style={styles.tr}>
                                        <td style={styles.td}>PB-{deptId}</td>
                                        <td style={styles.td}><b>{dept.name}</b></td>
                                        <td style={styles.td}>{dept.manager_id || dept.managerId || 'Chưa gán'}</td>
                                        <td style={styles.td}>
                                            <button 
                                                style={styles.editBtn} 
                                                onClick={() => { setCurrentDept(dept); setIsModalOpen(true); }}
                                            >
                                                Sửa
                                            </button>
                                            <button 
                                                style={styles.deleteBtn} 
                                                onClick={() => handleDelete(deptId)}
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="4" style={{textAlign: 'center', padding: '40px'}}>
                                    <b>Bảng hiện đang trống.</b>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* FORM MODAL NỔ (SỬ DỤNG CHO CẢ THÊM VÀ SỬA) */}
            {isModalOpen && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h3 style={{marginTop: 0, color: '#2c3e50', borderBottom: '2px solid #eee', paddingBottom: '10px'}}>
                            {currentDept ? "SỬA PHÒNG BAN" : "THÊM PHÒNG BAN MỚI"}
                        </h3>
                        <form onSubmit={handleSubmit} style={{marginTop: '20px'}}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Tên phòng ban:</label>
                                <input 
                                    name="name" 
                                    defaultValue={currentDept?.name} 
                                    required 
                                    style={styles.input}
                                    placeholder="Ví dụ: Phòng Kỹ Thuật"
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>ID Trưởng phòng (Nếu có):</label>
                                <input 
                                    name="managerId" 
                                    type="number"
                                    defaultValue={currentDept?.manager_id || currentDept?.managerId} 
                                    style={styles.input}
                                    placeholder="Ví dụ: 1"
                                />
                            </div>
                            
                            <div style={styles.btnGroup}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.btnCancel}>Hủy bỏ</button>
                                <button type="submit" style={styles.btnSave}>
                                    {currentDept ? "Cập nhật" : "Thêm vào MySQL"}
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
    addButton: { padding: '12px 25px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
    tableWrapper: { backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { backgroundColor: '#34495e', color: '#fff' },
    th: { padding: '15px', textAlign: 'left', fontWeight: 'bold' },
    td: { padding: '15px', borderBottom: '1px solid #eee' },
    tr: { transition: '0.3s' },
    editBtn: { marginRight: '8px', padding: '6px 12px', backgroundColor: '#ffc107', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
    deleteBtn: { padding: '6px 12px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
    // Styles cho Modal
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { backgroundColor: '#fff', padding: '30px', borderRadius: '15px', width: '400px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' },
    inputGroup: { marginBottom: '15px' },
    label: { display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#555' },
    input: { width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' },
    btnGroup: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '25px' },
    btnCancel: { padding: '10px 20px', backgroundColor: '#eee', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    btnSave: { padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }
};

export default DepartmentList;