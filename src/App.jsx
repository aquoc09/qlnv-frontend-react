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
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <Router>
      <Routes>
        {/* Trang đăng nhập */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" /> : <Login />}
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

        {/* Trang Quản lý Nhân viên */}
        <Route
          path="/employees"
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
      </Routes>
    </Router>
  );
}

export default App;
