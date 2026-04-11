import React, { useEffect, useState } from 'react';
import attendanceApi from '../../api/attendanceApi';

const AttendanceList = () => {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);

    // 1. LẤY DATA VÀ BÓC TRẦN (Lột sạch lớp result lồng nhau)
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await attendanceApi.getAll();
            console.log("Dữ liệu thô từ BE Chấm công:", response);

            // BÓC TÁCH MẠNH: Dò ruột mảng BE trả về
            let rawData = Array.isArray(response) ? response : (response?.result || []);
            
            // PHÁ VỎ TỪNG DÒNG: Nếu dòng đó bị bọc trong .result thì lột ra
            const cleanData = rawData.map(item => (item.result ? item.result : item));
            
            setList(cleanData);
            console.log("Dữ liệu Chấm công sau khi bóc trần:", cleanData);
        } catch (error) {
            console.error("Lỗi kết nối MySQL:", error);
            setList([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // 2. CHỨC NĂNG VÀO CA / RA CA (Đúng chuẩn API BE)
    const handleCheckIn = async () => {
        try {
            await attendanceApi.checkIn();
            alert("Hệ thống: Check-in thành công!");
            await fetchData(); // Cập nhật lại bảng ngay
        } catch (error) {
            alert("Lỗi: " + (error.response?.data?.message || "Hôm nay anh đã vào ca rồi!"));
        }
    };

    const handleCheckOut = async () => {
        try {
            await attendanceApi.checkOut();
            alert("Hệ thống: Check-out thành công!");
            await fetchData(); // Cập nhật lại bảng ngay
        } catch (error) {
            alert("Lỗi: " + (error.response?.data?.message || "Anh chưa vào ca hoặc đã ra ca rồi!"));
        }
    };

    // 3. CHỨC NĂNG SỬA (PUT)
    const handleUpdate = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            checkIn: formData.get('checkIn'),
            checkOut: formData.get('checkOut'),
            status: formData.get('status')
        };
        try {
            await attendanceApi.update(editingRecord.id || editingRecord.attendanceId, data);
            alert("Đã cập nhật giờ công!");
            setIsEditModalOpen(false);
            fetchData();
        } catch (error) {
            alert("Lỗi: Không có quyền sửa (999)!");
        }
    };

    // 4. CHỨC NĂNG XÓA (DELETE)
    const handleDelete = async (id) => {
        if (!window.confirm("Anh có chắc muốn xóa lịch sử chấm công này?")) return;
        try {
            await attendanceApi.delete(id);
            alert("Đã xóa bản ghi!");
            fetchData();
        } catch (error) {
            alert("Lỗi xóa: 999");
        }
    };

    const renderStatus = (status) => {
        const s = String(status || '').toUpperCase();
        if (s === 'PRESENT' || s === 'ĐÚNG GIỜ') return <span style={{...styles.badge, backgroundColor: '#d4edda', color: '#155724'}}>Đúng giờ</span>;
        if (s === 'LATE' || s === 'ĐI MUỘN') return <span style={{...styles.badge, backgroundColor: '#fff3cd', color: '#856404'}}>Đi muộn</span>;
        return <span style={{...styles.badge, backgroundColor: '#f8d7da', color: '#721c24'}}>Về sớm</span>;
    };

    if (loading) return <div style={{ padding: '20px' }}>Đang bóc tách dữ liệu chấm công...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>| 4. QUẢN LÝ CHẤM CÔNG</h2>
                <div style={styles.actionGroup}>
                    <button onClick={handleCheckIn} style={styles.btnIn}>VÀO CA (Check-in)</button>
                    <button onClick={handleCheckOut} style={styles.btnOut}>RA CA (Check-out)</button>
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
                                <td style={{...styles.td, color: '#27ae60', fontWeight: 'bold'}}>{item.checkIn || item.check_in || '---'}</td>
                                <td style={{...styles.td, color: '#e67e22', fontWeight: 'bold'}}>{item.checkOut || item.check_out || '---'}</td>
                                <td style={styles.td}>{renderStatus(item.status)}</td>
                                <td style={styles.td}>
                                    <button style={styles.btnEdit} onClick={() => { setEditingRecord(item); setIsEditModalOpen(true); }}>Sửa</button>
                                    <button style={styles.btnDel} onClick={() => handleDelete(item.id || item.attendanceId)}>Xóa</button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                                    <b>Bảng trống. Anh hãy nhấn nút "VÀO CA" để tạo dữ liệu mẫu!</b>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL SỬA GIỜ CÔNG */}
            {isEditModalOpen && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h3 style={{marginTop: 0}}>ĐIỀU CHỈNH GIỜ CÔNG</h3>
                        <form onSubmit={handleUpdate}>
                            <label style={styles.label}>Giờ vào:</label>
                            <input name="checkIn" type="time" step="1" defaultValue={editingRecord?.checkIn} style={styles.input} required />
                            <label style={styles.label}>Giờ ra:</label>
                            <input name="checkOut" type="time" step="1" defaultValue={editingRecord?.checkOut} style={styles.input} />
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
    btnIn: { padding: '12px 20px', backgroundColor: '#27ae60', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
    btnOut: { padding: '12px 20px', backgroundColor: '#e67e22', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
    tableWrapper: { backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { backgroundColor: '#2c3e50', color: '#fff' },
    th: { padding: '15px', textAlign: 'left' },
    td: { padding: '15px', borderBottom: '1px solid #eee' },
    tr: { transition: '0.3s' },
    badge: { padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' },
    btnEdit: { padding: '5px 10px', backgroundColor: '#f1c40f', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px', fontWeight: 'bold' },
    btnDel: { padding: '5px 10px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', width: '350px' },
    label: { display: 'block', fontWeight: 'bold', fontSize: '12px', marginTop: '10px' },
    input: { width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' },
    btnGroup: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
    btnCancel: { padding: '10px 20px', backgroundColor: '#eee', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    btnSave: { padding: '10px 20px', backgroundColor: '#2c3e50', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }
};

export default AttendanceList;