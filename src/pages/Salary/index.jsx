import React, { useEffect, useState } from 'react';
import salaryApi from '../../api/salaryApi';

const SalaryList = () => {
    const [salaries, setSalaries] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. LẤY DATA THẬT TỪ MYSQL
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await salaryApi.getAll();
            if (response && response.code === 1000) {
                setSalaries(response.result || []);
            } else if (Array.isArray(response)) {
                setSalaries(response);
            }
        } catch (error) {
            console.error("Lỗi kết nối bảng lương:", error);
            setSalaries([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // 2. CHỨC NĂNG TÍNH LƯƠNG (HÀM NÀY GỌI BE TỰ QUÉT CHẤM CÔNG ĐỂ RA TIỀN)
    const handleCalculate = async () => {
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();
        if (window.confirm(`Anh có muốn hệ thống tự động tính lương cho tháng ${month}/${year}?`)) {
            try {
                await salaryApi.calculate(month, year);
                alert("Đã tính toán xong bảng lương dựa trên ngày công thực tế!");
                fetchData();
            } catch (error) {
                alert("Lỗi: Không thể tính lương. Có thể bảng lương tháng này đã tồn tại!");
            }
        }
    };

    // 3. CHỨC NĂNG DUYỆT CHI (THANH TOÁN)
    const handlePay = async (id) => {
        try {
            await salaryApi.updateStatus(id, "PAID"); // Giả sử Enum BE là PAID
            alert("Đã xác nhận thanh toán lương!");
            fetchData();
        } catch (error) {
            alert("Lỗi khi cập nhật trạng thái thanh toán!");
        }
    };

    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (loading) return <div style={{ padding: '20px' }}>Đang kết nối cổng thanh toán...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>| 8. QUẢN LÝ TIỀN LƯƠNG</h2>
                    <p style={styles.info}>Dữ liệu thu nhập trích xuất trực tiếp từ MySQL</p>
                </div>
                {/* NÚT CHỨC NĂNG TÍNH LƯƠNG TỔNG THỂ */}
                <button style={styles.calcBtn} onClick={handleCalculate}>+ Chốt lương tháng này</button>
            </div>
            
            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeader}>
                            <th style={styles.th}>Nhân viên</th>
                            <th style={styles.th}>Tháng/Năm</th>
                            <th style={styles.th}>Lương CB</th>
                            <th style={styles.th}>Thực nhận</th>
                            <th style={styles.th}>Trạng thái</th>
                            <th style={styles.th}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {salaries.length > 0 ? (
                            salaries.map((s) => (
                                <tr key={s.id} style={styles.tr}>
                                    <td style={styles.td}>
                                        <b>{s.employee?.fullName || s.employeeName || `Mã NV: ${s.employeeId}`}</b>
                                    </td>
                                    <td style={styles.td}>{s.month}/{s.year}</td>
                                    <td style={styles.td}>{formatVND(s.baseSalary || 0)}</td>
                                    <td style={{...styles.td, color: '#e67e22', fontWeight: 'bold'}}>
                                        {formatVND(s.finalSalary || s.final_salary || 0)}
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.statusBadge,
                                            backgroundColor: (s.status === 'PAID' || s.status === 'Đã thanh toán') ? '#d1f2eb' : '#fff3cd',
                                            color: (s.status === 'PAID' || s.status === 'Đã thanh toán') ? '#16a085' : '#856404'
                                        }}>
                                            {s.status === 'PAID' ? 'Đã thanh toán' : 'Chờ duyệt chi'}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        {(s.status !== 'PAID' && s.status !== 'Đã thanh toán') && (
                                            <button style={styles.payBtn} onClick={() => handlePay(s.id)}>Thanh toán</button>
                                        )}
                                        <button style={styles.delBtn} onClick={async () => {
                                            if(window.confirm("Xóa bản ghi lương này?")) {
                                                await salaryApi.delete(s.id);
                                                fetchData();
                                            }
                                        }}>Xóa</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>Chưa có dữ liệu bảng lương trong Database.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '40px', backgroundColor: '#f4f7f6', minHeight: '100vh' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    title: { margin: 0, color: '#2c3e50', fontSize: '24px' },
    info: { color: '#666', margin: 0 },
    calcBtn: { padding: '12px 20px', backgroundColor: '#2c3e50', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
    tableWrapper: { backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { backgroundColor: '#34495e', color: '#fff' },
    th: { padding: '15px', textAlign: 'left' },
    td: { padding: '15px', borderBottom: '1px solid #eee' },
    tr: { transition: '0.3s' },
    statusBadge: { padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' },
    payBtn: { padding: '5px 10px', backgroundColor: '#27ae60', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' },
    delBtn: { padding: '5px 10px', backgroundColor: '#eb4d4b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};

export default SalaryList;