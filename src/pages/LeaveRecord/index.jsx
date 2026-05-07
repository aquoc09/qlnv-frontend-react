import React, { useEffect, useState } from 'react';
import leaveRecordApi from '../../api/leaveRecordApi';
import employeeApi from '../../api/employeeApi';
import leaveApi from '../../api/leaveApi';

const LeaveRecordList = () => {
    const [records, setRecords] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // State cho form tạo đơn mới
    const [formData, setFormData] = useState({
        employeeId: null,
        leaveId: null,
        startDate: '',
        endDate: '',
        reason: '',
        status: 'PENDING'
    });

    const fetchData = async () => {
        try {
            const [resRecord, resEmp, resType] = await Promise.all([
                leaveRecordApi.getAll(),
                employeeApi.getAll(),
                leaveApi.getAll()
            ]);

            const cleanData = (res) => {
                const raw = Array.isArray(res) ? res : (res?.result || []);
                return raw.map(item => item.result ? item.result : item);
            };

            setRecords(cleanData(resRecord));
            setEmployees(cleanData(resEmp));
            setLeaveTypes(cleanData(resType));
        } catch (error) {
            console.error("Lỗi nạp dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const getEmployeeName = (r) => {
        const id = r.employeeId || r.employee_id;
        const found = employees.find(e => e.id === id);
        return found ? found.fullName : `NV-${id}`;
    };

    const getLeaveName = (r) => {
        const id = r.leaveId || r.leave_id;
        const found = leaveTypes.find(t => t.id === id);
        return found ? found.leaveName : `Loại-${id}`;
    };

    // --- HÀM DUYỆT: ĐỔI TRẠNG THÁI VÀ GIỮ NGUYÊN ---
    const handleUpdateStatus = async (id, newStatus) => {
        const current = records.find(r => r.id === id);
        if (!current) return;

        // BƯỚC 1: Đổi trạng thái trực tiếp trên giao diện ngay lập tức
        // Điều này giúp nút "Duyệt" biến mất và hiện chữ "Đã duyệt" chốt luôn
        setRecords(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));

        // BƯỚC 2: Gom dữ liệu đầy đủ gửi lên Backend
        const updatedBody = {
            ...current,
            status: newStatus,
            leaveStatus: newStatus,
            trangThai: newStatus === 'APPROVED' ? 'ĐÃ DUYỆT' : 'TỪ CHỐI',
            employeeId: Number(current.employeeId || current.employee_id),
            leaveId: Number(current.leaveId || current.leave_id)
        };

        try {
            // BƯỚC 3: Gửi lệnh lên Backend
            await leaveRecordApi.update(id, updatedBody);
            
            // THÔNG BÁO THÀNH CÔNG
            // QUAN TRỌNG: Không gọi fetchData() ở đây để tránh bị dữ liệu cũ đè lại
            console.log("Đã gửi yêu cầu cập nhật lên Database.");

        } catch (error) {
            alert("Lỗi kết nối Backend!");
            fetchData(); // Chỉ khi lỗi thật sự mới tải lại dữ liệu cũ
        }
    };

    const handleSave = async () => {
        if (!formData.employeeId || !formData.leaveId) {
            alert("Vui lòng chọn đầy đủ thông tin!");
            return;
        }
        try {
            await leaveRecordApi.create(formData);
            alert("Tạo đơn thành công!");
            setIsModalOpen(false);
            fetchData(); // Load lại để hiện đơn vừa tạo
        } catch (error) {
            alert("Lỗi: Không thể tạo đơn!");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa đơn này?")) {
            try { 
                await leaveRecordApi.delete(id); 
                // Cập nhật giao diện xóa luôn
                setRecords(prev => prev.filter(r => r.id !== id));
            } catch (error) { alert("Lỗi khi xóa!"); }
        }
    };

    const getStatusInfo = (status) => {
        const s = String(status).toUpperCase();
        if (s === 'APPROVED' || s === 'ĐÃ DUYỆT') return { label: 'Đã duyệt', color: '#2ecc71', bg: '#d4edda' };
        if (s === 'REJECTED' || s === 'TỪ CHỐI') return { label: 'Từ chối', color: '#e74c3c', bg: '#f8d7da' };
        return { label: 'Chờ duyệt', color: '#f39c12', bg: '#fff3cd' };
    };

    if (loading) return <div style={{ padding: '20px' }}>Đang nạp dữ liệu...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>| 7. QUẢN LÝ ĐƠN NGHỈ PHÉP</h2>
                <button style={styles.addButton} onClick={() => setIsModalOpen(true)}>+ Tạo đơn mới</button>
            </div>
            
            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeader}>
                            <th style={styles.th}>Nhân viên</th>
                            <th style={styles.th}>Loại nghỉ</th>
                            <th style={styles.th}>Thời gian</th>
                            <th style={styles.th}>Lý do</th>
                            <th style={styles.th}>Trạng thái</th>
                            <th style={styles.th}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.length > 0 ? records.map((r, index) => {
                            const info = getStatusInfo(r.status);
                            const isPending = (String(r.status).toUpperCase() === 'PENDING' || r.status === 'Chờ duyệt');

                            return (
                                <tr key={r.id || index} style={styles.tr}>
                                    <td style={styles.td}><b>{getEmployeeName(r)}</b></td>
                                    <td style={styles.td}>{getLeaveName(r)}</td>
                                    <td style={styles.td}>{r.startDate} ➔ {r.endDate}</td>
                                    <td style={styles.td}><i>{r.reason}</i></td>
                                    <td style={styles.td}>
                                        <span style={{...styles.badge, backgroundColor: info.bg, color: info.color}}>
                                            {info.label}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        {isPending && (
                                            <div style={{display: 'inline-flex', gap: '5px'}}>
                                                <button style={styles.btnApprove} onClick={() => handleUpdateStatus(r.id, 'APPROVED')}>Duyệt</button>
                                                <button style={styles.btnReject} onClick={() => handleUpdateStatus(r.id, 'REJECTED')}>Từ chối</button>
                                            </div>
                                        )}
                                        <button style={styles.btnDel} onClick={() => handleDelete(r.id)}>Xóa</button>
                                    </td>
                                </tr>
                            );
                        }) : <tr><td colSpan="6" style={{textAlign: 'center', padding: '40px'}}>Trống.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Modal tạo đơn */}
            {isModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>THÊM ĐƠN NGHỈ PHÉP</h3>
                        <label>Chọn nhân viên:</label>
                        <select style={styles.input} onChange={(e) => setFormData({...formData, employeeId: Number(e.target.value)})}>
                            <option value="">-- Chọn nhân viên --</option>
                            {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.fullName}</option>)}
                        </select>
                        <label>Loại nghỉ:</label>
                        <select style={styles.input} onChange={(e) => setFormData({...formData, leaveId: Number(e.target.value)})}>
                            <option value="">-- Chọn loại nghỉ --</option>
                            {leaveTypes.map(type => <option key={type.id} value={type.id}>{type.leaveName}</option>)}
                        </select>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ flex: 1 }}><label>Từ:</label><input type="date" style={styles.input} onChange={(e) => setFormData({...formData, startDate: e.target.value})} /></div>
                            <div style={{ flex: 1 }}><label>Đến:</label><input type="date" style={styles.input} onChange={(e) => setFormData({...formData, endDate: e.target.value})} /></div>
                        </div>
                        <label>Lý do nghỉ:</label>
                        <textarea style={{ ...styles.input, height: '80px' }} onChange={(e) => setFormData({...formData, reason: e.target.value})} />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                            <button style={styles.btnCancel} onClick={() => setIsModalOpen(false)}>Hủy</button>
                            <button style={styles.btnSave} onClick={handleSave}>Lưu đơn</button>
                        </div>
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
    addButton: { padding: '10px 20px', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    tableWrapper: { backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { backgroundColor: '#2980b9', color: '#fff' },
    th: { padding: '15px', textAlign: 'left' },
    td: { padding: '15px', borderBottom: '1px solid #eee' },
    tr: { transition: '0.3s' },
    badge: { padding: '5px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' },
    btnApprove: { padding: '5px 10px', backgroundColor: '#2ecc71', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    btnReject: { padding: '5px 10px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    btnDel: { padding: '5px 10px', backgroundColor: '#eee', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: '5px' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: '#fff', padding: '30px', borderRadius: '10px', width: '450px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' },
    input: { width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '5px', boxSizing: 'border-box' },
    btnSave: { padding: '10px 25px', backgroundColor: '#8e44ad', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    btnCancel: { padding: '10px 25px', backgroundColor: '#eee', color: '#333', border: 'none', borderRadius: '5px', cursor: 'pointer' }
};

export default LeaveRecordList;
