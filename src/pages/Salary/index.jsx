import React, { useEffect, useState } from 'react';
import salaryApi from '../../api/salaryApi';
import employeeApi from '../../api/employeeApi'; 

const SalaryList = () => {
    const [salaries, setSalaries] = useState([]);
    const [employees, setEmployees] = useState([]); 
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resSalary, resEmp] = await Promise.all([
                salaryApi.getAll(),
                employeeApi.getAll()
            ]);

            // HÀM BÓC TÁCH GỠ LỚP RESULT LỒNG NHAU (Fix lỗi trắng bảng)
            const cleanData = (res) => {
                const raw = Array.isArray(res) ? res : (res?.result || []);
                // Nhìn F12 của anh: mỗi phần tử lại có .result bên trong
                return raw.map(item => (item.result ? item.result : item));
            };

            const finalSalaries = cleanData(resSalary);
            const finalEmployees = cleanData(resEmp);

            setSalaries(finalSalaries);
            setEmployees(finalEmployees);
            
            console.log("Dữ liệu Lương đã bóc trần:", finalSalaries);
        } catch (error) {
            console.error("Lỗi MySQL:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // HÀM TÌM TÊN NHÂN VIÊN
    const getEmployeeName = (item) => {
        const id = item.employeeId || item.employee_id;
        const found = employees.find(e => e.id === id);
        return found ? found.fullName : `NV - ${id || '???'}`;
    };

    // 1. CHỨC NĂNG CHỐT LƯƠNG THÁNG NÀY (Gọi API BE)
    const handleCalculate = async () => {
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();
        if (!window.confirm(`Xác nhận tính lương tháng ${month}/${year} cho toàn bộ nhân viên?`)) return;
        
        try {
            await salaryApi.calculate(month, year);
            alert("Hệ thống đã chốt lương thành công!");
            fetchData();
        } catch (error) {
            alert("Lỗi: " + (error.response?.data?.message || "999 - Không có quyền!"));
        }
    };

    // 2. CHỨC NĂNG THANH TOÁN (Cập nhật trạng thái PAID)
    const handlePay = async (id) => {
        try {
            await salaryApi.updateStatus(id, "PAID");
            alert("Đã xác nhận thanh toán!");
            fetchData();
        } catch (error) {
            alert("Lỗi thanh toán: " + (error.response?.data?.message || "999"));
        }
    };

    // 3. CHỨC NĂNG XÓA
    const handleDelete = async (id) => {
        if (!window.confirm("Anh có chắc muốn xóa bản ghi lương này?")) return;
        try {
            await salaryApi.delete(id);
            alert("Đã xóa bản ghi!");
            fetchData();
        } catch (error) {
            alert("Lỗi xóa: " + (error.response?.data?.message || "999"));
        }
    };

    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
    };

    if (loading) return <div style={{ padding: '20px' }}>Đang nạp dữ liệu từ MySQL...</div>;

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
                                    <td style={styles.td}><b>{getEmployeeName(s)}</b></td>
                                    <td style={styles.td}>
                                        {/* Bóc tách trường từ result của BE */}
                                        {(s.month || '---')}/{(s.year || '---')}
                                    </td>
                                    <td style={styles.td}>{formatVND(s.baseSalary || s.base_salary)}</td>
                                    <td style={{...styles.td, color: '#e67e22', fontWeight: 'bold'}}>
                                        {formatVND(s.finalSalary || s.final_salary)}
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.statusBadge,
                                            backgroundColor: (s.status === 'PAID' || s.status === 'Đã thanh toán') ? '#d1f2eb' : '#fff3cd',
                                            color: (s.status === 'PAID' || s.status === 'Đã thanh toán') ? '#16a085' : '#856404'
                                        }}>
                                            {(s.status === 'PAID' || s.status === 'Đã thanh toán') ? 'Đã thanh toán' : 'Chờ duyệt chi'}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        {(s.status !== 'PAID' && s.status !== 'Đã thanh toán') && (
                                            <button style={styles.payBtn} onClick={() => handlePay(s.id)}>Thanh toán</button>
                                        )}
                                        <button style={styles.delBtn} onClick={() => handleDelete(s.id)}>Xóa</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>Bảng lương trống. Hãy nhấn "Chốt lương" để bắt đầu!</td></tr>
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