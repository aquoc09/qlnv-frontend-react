import React, { useEffect, useState } from 'react';
import attendanceApi from '../../api/attendanceApi';

const AttendanceList = () => {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);

    // 1. LẤY DATA VÀ BÓC TRẦN (Phá lớp result lồng nhau)
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await attendanceApi.getAll();
            
            // HÀM BÓC TÁCH: Đi xuyên qua lớp result của từng item mảng
            const rawData = Array.isArray(response) ? response : (response?.result || []);
            const cleanData = rawData.map(item => (item.result ? item.result : item));
            
            setList(cleanData);
            console.log("Dữ liệu Chấm công đã bóc trần:", cleanData);
        } catch (error) {
            console.error("Lỗi kết nối MySQL:", error);
            setList([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // 2. CHỨC NĂNG VÀO CA / RA CA
    const handleCheckIn = async () => {
        try {
            await attendanceApi.checkIn();
            alert("Check-in thành công!");
            fetchData();
        } catch (error) { alert("Lỗi: " + (error.response?.data?.message || "Đã Check-in rồi")); }
    };

    const handleCheckOut = async () => {
        try {
            await attendanceApi.checkOut();
            alert("Check-out thành công!");
            fetchData();
        } catch (error) { alert("Lỗi: " + (error.response?.data?.message || "Chưa Check-in")); }
    };

    // 3. CHỨC NĂNG SỬA (BE CÓ PUT)
    const handleUpdate = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            checkIn: formData.get('checkIn'),
            checkOut: formData.get('checkOut'),
            status: formData.get('status')
        };
        try {
            await attendanceApi.update(editingRecord.id, data);
            alert("Cập nhật giờ công thành công!");
            setIsEditModalOpen(false);
            fetchData();
        } catch (error) { alert("Lỗi cập nhật 999!"); }
    };

    // 4. CHỨC NĂNG XÓA
    const handleDelete = async (id) => {
        if (!window.confirm("Anh có chắc muốn xóa bản ghi chấm công này?")) return;
        try {
            await attendanceApi.delete(id);
            alert("Đã xóa khỏi MySQL!");
            fetchData();
        } catch (error) { alert("Lỗi xóa: 999"); }
    };

    const renderStatus = (status) => {
        const s = String(status).toUpperCase();
        if (s === 'PRESENT' || s === 'ĐÚNG GIỜ') return <span style={{...styles.badge, bg: '#d4edda', c: '#155724'}}>Đúng giờ</span>;
        if (s === 'LATE' || s === 'ĐI MUỘN') return <span style={{...styles.badge, bg: '#fff3cd', c: '#856404'}}>Đi muộn</span>;
        return <span style={{...styles.badge, bg: '#f8d7da', c: '#721c24'}}>Về sớm</span>;
    };

    if (loading) return <div style={{ padding: '20px' }}>Đang nạp dữ liệu chấm công...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>| 4. QUẢN LÝ CHẤM CÔNG</h2>
                <div style={styles.actionGroup}>
                    <button onClick={handleCheckIn} style={styles.btnIn}>VÀO CA</button>
                    <button onClick={handleCheckOut} style={styles.btnOut}>RA CA</button>
                </div>
            </div>
            
            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeader}>
                            <th style={styles.th}>Ngày làm việc</th>
                            <th style={styles.th}>Giờ vào</th>
                            <th style={styles.th}>Giờ ra</th>
                            <th style={styles.th}>Trạng thái</th>
                            <th style={styles.th}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.length > 0 ? list.map((item, index) => (
                            <tr key={item.id || index} style={styles.tr}>
                                <td style={styles.td}><b>{item.workDate || item.work_date}</b></td>
                                <td style={styles.td}>{item.checkIn || item.check_in || '---'}</td>
                                <td style={styles.td}>{item.checkOut || item.check_out || '---'}</td>
                                <td style={styles.td}>{renderStatus(item.status)}</td>
                                <td style={styles.td}>
                                    <button style={styles.btnEdit} onClick={() => { setEditingRecord(item); setIsEditModalOpen(true); }}>Sửa</button>
                                    <button style={styles.btnDel} onClick={() => handleDelete(item.id)}>Xóa</button>
                                </td>
                            </tr>
                        )) : <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Bảng trống. Hãy bắt đầu chấm công!</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* MODAL SỬA GIỜ CÔNG */}
            {isEditModalOpen && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h3>ĐIỀU CHỈNH GIỜ CÔNG</h3>
                        <form onSubmit={handleUpdate}>
                            <label style={styles.label}>Giờ vào:</label>
                            <input name="checkIn" type="time" defaultValue={editingRecord?.checkIn} style={styles.input} />
                            <label style={styles.label}>Giờ ra:</label>
                            <input name="checkOut" type="time" defaultValue={editingRecord?.checkOut} style={styles.input} />
                            <label style={styles.label}>Trạng thái:</label>
                            <select name="status" defaultValue={editingRecord?.status} style={styles.input}>
                                <option value="PRESENT">Đúng giờ</option>
                                <option value="LATE">Đi muộn</option>
                                <option value="EARLY_LEAVE">Về sớm</option>
                            </select>
                            <div style={styles.btnGroup}>
                                <button type="button" onClick={() => setIsEditModalOpen(false)} style={styles.btnCancel}>Hủy</button>
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
    actionGroup: { display: 'flex', gap: '10px' },
    btnIn: { padding: '10px 20px', backgroundColor: '#27ae60', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
    btnOut: { padding: '10px 20px', backgroundColor: '#e67e22', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
    tableWrapper: { backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { backgroundColor: '#2c3e50', color: '#fff' },
    th: { padding: '15px', textAlign: 'left' },
    td: { padding: '15px', borderBottom: '1px solid #eee' },
    tr: { transition: '0.3s' },
    badge: ({bg, c}) => ({ padding: '4px 10px', backgroundColor: bg, color: c, borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }),
    btnEdit: { padding: '5px 10px', backgroundColor: '#f1c40f', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' },
    btnDel: { padding: '5px 10px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', width: '350px' },
    label: { display: 'block', fontWeight: 'bold', fontSize: '12px', marginTop: '10px' },
    input: { width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' },
    btnGroup: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
    btnCancel: { padding: '10px 20px', backgroundColor: '#eee', border: 'none', borderRadius: '6px' },
    btnSave: { padding: '10px 20px', backgroundColor: '#2c3e50', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold' }
};

export default AttendanceList;