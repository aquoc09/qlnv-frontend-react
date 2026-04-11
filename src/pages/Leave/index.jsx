import React, { useEffect, useState } from 'react';
import leaveApi from '../../api/leaveApi';

const LeaveTypeList = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentLeave, setCurrentLeave] = useState(null);

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            const response = await leaveApi.getAll();
            if (response && response.code === 1000) {
                setLeaves(response.result || []);
            } else if (Array.isArray(response)) {
                setLeaves(response.map(item => item.result || item).filter(Boolean));
            }
        } catch (error) {
            console.error("Lỗi lấy danh mục nghỉ:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLeaves(); }, []);

    const handleDelete = async (id) => {
        if (window.confirm(`Anh có chắc muốn xóa loại nghỉ này?`)) {
            try {
                await leaveApi.delete(id);
                alert("Xóa thành công!");
                fetchLeaves();
            } catch (error) {
                alert("Lỗi: Không thể xóa loại nghỉ đang được sử dụng!");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            leaveName: formData.get('leaveName'),
            defaultDays: parseInt(formData.get('defaultDays')),
            paid: formData.get('paid') === 'true'
        };

        try {
            if (currentLeave) {
                await leaveApi.update(currentLeave.id, data);
                alert("Cập nhật thành công!");
            } else {
                await leaveApi.create(data);
                alert("Thêm mới thành công!");
            }
            setIsModalOpen(false);
            fetchLeaves();
        } catch (error) {
            alert("Lỗi khi lưu dữ liệu!");
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Đang nạp dữ liệu từ MySQL...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>| QUẢN LÝ LOẠI NGHỈ</h2>
                <button style={styles.addButton} onClick={() => { setCurrentLeave(null); setIsModalOpen(true); }}>
                    + Thêm loại nghỉ
                </button>
            </div>

            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeader}>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>Tên Loại Nghỉ</th>
                            <th style={styles.th}>Số ngày tối đa</th>
                            <th style={styles.th}>Chế độ</th>
                            <th style={styles.th}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaves.map((l) => (
                            <tr key={l.id} style={styles.tr}>
                                <td style={styles.td}>{l.id}</td>
                                <td style={styles.td}><b>{l.leaveName || l.leave_name}</b></td>
                                <td style={styles.td}>{l.defaultDays || l.default_days} ngày</td>
                                <td style={styles.td}>{l.paid ? "Có lương" : "Không lương"}</td>
                                <td style={styles.td}>
                                    <button style={styles.editBtn} onClick={() => { setCurrentLeave(l); setIsModalOpen(true); }}>Sửa</button>
                                    <button style={styles.deleteBtn} onClick={() => handleDelete(l.id)}>Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h3>{currentLeave ? "SỬA LOẠI NGHỈ" : "THÊM LOẠI NGHỈ"}</h3>
                        <form onSubmit={handleSubmit}>
                            <input name="leaveName" defaultValue={currentLeave?.leaveName || currentLeave?.leave_name} placeholder="Tên loại nghỉ" required style={styles.input}/>
                            <input name="defaultDays" type="number" defaultValue={currentLeave?.defaultDays || currentLeave?.default_days} placeholder="Số ngày tối đa" required style={styles.input}/>
                            <select name="paid" defaultValue={currentLeave?.paid} style={styles.input}>
                                <option value="true">Có trả lương</option>
                                <option value="false">Nghỉ không lương</option>
                            </select>
                            <div style={styles.btnGroup}>
                                <button type="button" onClick={() => setIsModalOpen(false)}>Hủy</button>
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
    container: { padding: '40px', backgroundColor: '#f4f7f6', minHeight: '100vh' },
    header: { display: 'flex', justifyContent: 'space-between', marginBottom: '30px' },
    title: { margin: 0, color: '#2c3e50', fontSize: '24px' },
    addButton: { padding: '10px 20px', backgroundColor: '#9b59b6', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    tableWrapper: { backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { backgroundColor: '#9b59b6', color: '#fff' },
    th: { padding: '15px', textAlign: 'left' },
    td: { padding: '15px', borderBottom: '1px solid #eee' },
    tr: { transition: '0.3s' },
    editBtn: { marginRight: '5px', padding: '5px 10px', backgroundColor: '#f1c40f', border: 'none', borderRadius: '3px' },
    deleteBtn: { padding: '5px 10px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '3px' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
    modal: { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', width: '300px' },
    input: { width: '100%', padding: '10px', marginTop: '10px', boxSizing: 'border-box' },
    btnGroup: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
    btnSave: { backgroundColor: '#9b59b6', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px' }
};

export default LeaveTypeList;