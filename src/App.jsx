import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import EmployeeList from "./pages/Employees/List";
import DeptList from "./pages/Departments/DeptList";
import Dashboard from "./pages/Dashboard";
import MainLayout from "./components/MainLayout";

function App() {
  const user = {
    username: "admin",
    role: "admin",
  };

  return (
    <Router>
      <Routes>
        {/* Trang đăng nhập */}
        <Route
          path="/"
          element={user ? <Navigate to="/users" /> : <Login />}
        />

        {/* Trang Users (Danh sách nhân viên) */}
        <Route
          path="/users"
          element={
            user && (user.role === "admin" || user.role === "hr") ? (
              <MainLayout user={user}>
                <EmployeeList />
              </MainLayout>
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Trang Dashboard */}
        <Route
          path="/dashboard"
          element={
            user ? (
              <MainLayout user={user}>
                <Dashboard />
              </MainLayout>
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Trang Quản lý Phòng ban */}
        <Route
          path="/departments"
          element={
            user && (user.role === "admin" || user.role === "hr") ? (
              <MainLayout user={user}>
                <DeptList />
              </MainLayout>
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Nếu nhập sai URL */}
        <Route path="*" element={<Navigate to="/users" />} />
      </Routes>
    </Router>
  );
}

export default App;