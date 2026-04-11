import React, { useEffect, useState } from 'react';
import employeeApi from '../../api/employeeApi';

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEmp, setCurrentEmp] = useState(null); 

    const fetchEmployees = async () => {
        try {
            const response = await employeeApi.getAll();
            if (Array.isArray(response)) {
                const data = response.map(item => item.result || item).filter(Boolean);
                setEmployees(data);
            } else if (response && response.code === 1000) {
                setEmployees(response.result || []);
            }
        } catch (error) {
            console.error("Lỗi tải danh sách:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEmployees(); }, []);

    // HÀM XÓA - ĐÃ ĐƯỢC TỐI ƯU
    const handleDelete = async (id) => {
        if (!id) {
            alert("Lỗi: Không tìm thấy ID nhân viên để xóa!");
            return;
        }
        
        console.log("Đang gửi lệnh xóa ID:", id); // Anh bật F12 xem dòng này

        if (window.confirm(`Xác nhận xóa nhân viên có ID: ${id}?`)) {
            try {
                const res = await employeeApi.delete(id);
                // Một số BE trả về object có code, một số trả về true/false trực tiếp
                if (res && (res.code === 1000 || res.status === 200 || res === true)) {
                    alert("Xóa thành công khỏi MySQL!");
                    fetchEmployees();
                } else {
                    alert("Backend từ chối xóa. Anh kiểm tra lại log BE!");
                }
            } catch (err) {
                console.error("Lỗi xóa chi tiết:", err.response);
                alert("Lỗi: " + (err.response?.data?.message || "Có ràng buộc dữ liệu (Hợp đồng/Lương) nên không thể xóa!"));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        try {
            if (currentEmp) {
                const id = currentEmp.employee_id || currentEmp.employeeId || currentEmp.id;
                await employeeApi.update(id, data);
                alert("Sửa thành công!");
            } else {
                await employeeApi.create(data);
                alert("Thêm thành công!");
            }
            setIsModalOpen(false);
            fetchEmployees();
        } catch (err) { alert("Lỗi khi lưu!"); }
    };

    if (loading) return <div style={{padding: '20px', textAlign: 'center'}}>Đang kết nối Database...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>| QUẢN LÝ NHÂN VIÊN</h2>
                <button style={styles.addButton} onClick={() => { setCurrentEmp(null); setIsModalOpen(true); }}>+ Thêm nhân viên</button>
            </div>
            
            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeader}>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>Họ và Tên</th>
                            <th style={styles.th}>Vị trí</th>
                            <th style={styles.th}>Email</th>
                            <th style={styles.th}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((emp) => {
                            const empId = emp.employee_id || emp.employeeId || emp.id;
                            return (
                                <tr key={empId} style={styles.tr}>
                                    <td style={styles.td}>{empId}</td>
                                    <td style={styles.td}><b>{emp.full_name || emp.fullName}</b></td>
                                    <td style={styles.td}>{emp.position}</td>
                                    <td style={styles.td}>{emp.email}</td>
                                    <td style={styles.td}>
                                        <button style={styles.editBtn} onClick={() => { setCurrentEmp(emp); setIsModalOpen(true); }}>Sửa</button>
                                        <button style={styles.deleteBtn} onClick={() => handleDelete(empId)}>Xóa</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h3>{currentEmp ? "SỬA NHÂN VIÊN" : "THÊM MỚI"}</h3>
                        <form onSubmit={handleSubmit}>
                            <input name="fullName" placeholder="Họ tên" defaultValue={currentEmp?.full_name || currentEmp?.fullName} required style={styles.input}/>
                            <input name="position" placeholder="Vị trí" defaultValue={currentEmp?.position} required style={styles.input}/>
                            <input name="email" placeholder="Email" defaultValue={currentEmp?.email} required style={styles.input}/>
                            <select name="gender" defaultValue={currentEmp?.gender || "Male"} style={styles.input}>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                            <div style={styles.btnGroup}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.btnCancel}>Hủy</button>
                                <button type="submit" style={styles.btnSave}>Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: { padding: '40px', backgroundColor: '#f4f7f6' },
    header: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
    title: { color: '#2c3e50' },
    addButton: { padding: '10px 20px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    tableWrapper: { backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { backgroundColor: '#007bff', color: '#fff' },
    th: { padding: '15px', textAlign: 'left' },
    td: { padding: '15px', borderBottom: '1px solid #eee' },
    tr: { transition: '0.2s' },
    editBtn: { padding: '5px 12px', backgroundColor: '#ffc107', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' },
    deleteBtn: { padding: '5px 12px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
    modal: { backgroundColor: '#fff', padding: '30px', borderRadius: '10px', width: '400px' },
    input: { width: '100%', padding: '10px', marginTop: '10px', border: '1px solid #ddd', borderRadius: '5px', boxSizing: 'border-box' },
    btnGroup: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
    btnCancel: { padding: '8px 15px', backgroundColor: '#eee', border: 'none', borderRadius: '5px' },
    btnSave: { padding: '8px 15px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px' }
};

export default EmployeeList;