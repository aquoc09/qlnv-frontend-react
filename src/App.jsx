import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login';
import EmployeeList from './pages/Employee';
import DepartmentList from './pages/Department';
import ContractList from './pages/Contract';
import AttendanceList from './pages/Attendance';
import LeaveTypeList from './pages/Leave';
import LeaveRecordList from './pages/LeaveRecord';
import LeaveBalanceList from './pages/LeaveBalance';
import SalaryList from './pages/Salary';
import RewardDisciplineList from './pages/RewardDiscipline';
import UserList from './pages/User';
import RoleList from './pages/Role'; // Module cuối cùng

function App() {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <div style={{ display: 'flex' }}>
        {token && (
          <nav style={styles.sidebar}>
            <div style={styles.logoArea}>
              <h3 style={{ color: '#fff', margin: 0, fontSize: '18px' }}>QUẢN LÝ NHÂN VIÊN</h3>
              <small style={{ color: '#bdc3c7' }}>Hệ thống Core v1.0</small>
            </div>
            <div style={styles.menuGroup}>
                <Link to="/employee" style={styles.navLink}>1. Nhân viên</Link>
                <Link to="/department" style={styles.navLink}>2. Phòng ban</Link>
                <Link to="/contract" style={styles.navLink}>3. Hợp đồng</Link>
                <Link to="/attendance" style={styles.navLink}>4. Chấm công</Link>
                <Link to="/leave" style={styles.navLink}>5. Loại nghỉ</Link>
                <Link to="/leave-record" style={styles.navLink}>6. Đơn nghỉ phép</Link>
                <Link to="/leave-balance" style={styles.navLink}>7. Quỹ phép</Link>
                <Link to="/salary" style={styles.navLink}>8. Tiền lương</Link>
                <Link to="/reward" style={styles.navLink}>9. Thưởng phạt</Link>
                <Link to="/user" style={styles.navLink}>10. Tài khoản</Link>
                <Link to="/role" style={styles.navLink}>11. Phân quyền</Link>
            </div>
            <button onClick={() => { localStorage.clear(); window.location.href='/login'; }} style={styles.logoutBtn}> ĐĂNG XUẤT </button>
          </nav>
        )}

        <div style={{ flex: 1, backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/employee" element={<EmployeeList />} />
            <Route path="/department" element={<DepartmentList />} />
            <Route path="/contract" element={<ContractList />} />
            <Route path="/attendance" element={<AttendanceList />} />
            <Route path="/leave" element={<LeaveTypeList />} />
            <Route path="/leave-record" element={<LeaveRecordList />} />
            <Route path="/leave-balance" element={<LeaveBalanceList />} />
            <Route path="/salary" element={<SalaryList />} />
            <Route path="/reward" element={<RewardDisciplineList />} />
            <Route path="/user" element={<UserList />} />
            <Route path="/role" element={<RoleList />} />
            
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

const styles = {
  sidebar: { width: '260px', backgroundColor: '#2c3e50', minHeight: '100vh', padding: '20px', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0 },
  logoArea: { marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #34495e', textAlign: 'center' },
  menuGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  navLink: { color: '#ecf0f1', textDecoration: 'none', padding: '12px 15px', borderRadius: '6px', backgroundColor: '#34495e', transition: '0.3s', fontSize: '14px' },
  logoutBtn: { marginTop: 'auto', padding: '12px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }
};

export default App;