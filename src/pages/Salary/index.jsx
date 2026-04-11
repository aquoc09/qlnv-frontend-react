import React, { useEffect, useState } from 'react';
import salaryApi from '../../api/salaryApi';
import employeeApi from '../../api/employeeApi'; 

const SalaryList = () => {
    const [salaries, setSalaries] = useState([]);
    const [employees, setEmployees] = useState([]); // Thêm state để lấy tên nhân viên
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resSalary, resEmp] = await Promise.all([
                salaryApi.getAll(),
                employeeApi.getAll()
            ]);

            // FIX: Bóc tách mảng trực tiếp từ BE như ảnh Console anh chụp
            const salaryData = resSalary?.result || (Array.isArray(resSalary) ? resSalary : []);
            const employeeData = resEmp?.result || (Array.isArray(resEmp) ? resEmp : []);

            setSalaries(salaryData);
            setEmployees(employeeData);
        } catch (error) {
            console.error("Lỗi kết nối MySQL:", error);
            setSalaries([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // HÀM TÌM TÊN NHÂN VIÊN: Đối chiếu ID lương với danh sách nhân viên
    const getEmployeeName = (item) => {
        const id = item.employeeId || item.employee_id || item.employee?.id;
        
        // 1. Nếu BE lồng sẵn object employee
        if (item.employee?.fullName || item.employee?.full_name) {
            return item.employee.fullName || item.employee.full_name;
        }
        // 2. Tìm trong danh sách nhân viên load từ BE
        const found = employees.find(e => e.id === id || e.employeeId === id);
        if (found) return found.fullName || found.full_name;

        return id ? `NV - ${id}` : "---";
    };

    const handleCalculate = async () => {
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();
        if (window.confirm(`Tính lương tháng ${month}/${year}?`)) {
            try {
                await salaryApi.calculate(month, year);
                alert("Đã chốt lương thành công!");
                fetchData();
            } catch (error) {
                alert("Lỗi: Có thể bảng lương tháng này đã tồn tại!");
            }
        }
    };

    const handlePay = async (id) => {
        try {
            await salaryApi.updateStatus(id, "PAID");
            alert("Thanh toán thành công!");
            fetchData();
        } catch (error) {
            alert("Lỗi khi thanh toán!");
        }
    };

    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (loading) return <div style={{ padding: '20px' }}>Đang nạp bảng lương MySQL...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>| 8. QUẢN LÝ TIỀN LƯƠNG</h2>
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
                            salaries.map((s, index) => (
                                <tr key={s.id || index} style={styles.tr}>
                                    <td style={styles.td}>
                                        <b>{getEmployeeName(s)}</b>
                                    </td>
                                    <td style={styles.td}>{s.month}/{s.year}</td>
                                    <td style={styles.td}>{formatVND(s.baseSalary || s.base_salary || 0)}</td>
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
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>Chưa có dữ liệu bảng lương trong MySQL.</td></tr>
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