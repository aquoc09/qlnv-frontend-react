import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const MainLayout = ({ children, user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarWidth = "280px";

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        width: "100vw",
        backgroundColor: "#ffffff",
        overflowX: "hidden",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Sidebar cố định */}
      <aside
        style={{
          width: sidebarWidth,
          backgroundColor: "#0f172a",
          color: "#f8fafc",
          padding: "40px 24px",
          position: "fixed",
          height: "100vh",
          zIndex: 1000,
          boxShadow: "4px 0 10px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "48px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: "#6366f1",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
            }}
          >
            H
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: "800", margin: 0 }}>
            HR PRO
          </h2>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <Link to="/dashboard" style={navItemStyle(isActive("/dashboard"))}>
            🏠 Tổng quan
          </Link>
          <Link to="/employees" style={navItemStyle(isActive("/employees"))}>
            👥 Nhân viên
          </Link>
          <Link
            to="/departments"
            style={navItemStyle(isActive("/departments"))}
          >
            🏢 Phòng ban
          </Link>
          <button onClick={handleLogout} style={logoutBtnStyle}>
            Đăng xuất
          </button>
        </nav>
      </aside>

      {/* Main Area */}
      <main
        style={{
          flex: 1,
          marginLeft: sidebarWidth,
          width: `calc(100% - ${sidebarWidth})`,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#fff",
        }}
      >
        {/* Header */}
        <header
          style={{
            height: "80px",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: "0 32px 0 0",
            borderBottom: "1px solid #f1f5f9",
            position: "sticky",
            top: 0,
            backgroundColor: "#fff",
            zIndex: 99,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#1e293b",
                }}
              >
                {user?.name || "Nguyễn Quản Trị"}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#94a3b8",
                  fontWeight: "600",
                }}
              >
                ADMIN
              </div>
            </div>
            <div style={avatarStyle}>{user?.name?.charAt(0) || "N"}</div>
          </div>
        </header>

        {/* Dashboard */}
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            padding: "60px 40px",
          }}
        >
          {/* Box Dashboard  */}
          <div
            style={{
              width: "100%",
              maxWidth: "1100px",
              margin: "0 auto",
            }}
          >
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

//navItemStyle, logoutBtnStyle, avatarStyle
const navItemStyle = (active) => ({
  color: active ? "#fff" : "#94a3b8",
  backgroundColor: active ? "#1e293b" : "transparent",
  textDecoration: "none",
  padding: "14px 20px",
  borderRadius: "12px",
  fontWeight: "600",
  display: "block",
  transition: "0.3s",
});
const logoutBtnStyle = {
  marginTop: "30px",
  backgroundColor: "#fee2e2",
  color: "#ef4444",
  border: "none",
  padding: "14px",
  cursor: "pointer",
  borderRadius: "12px",
  fontWeight: "bold",
};
const avatarStyle = {
  width: "45px",
  height: "45px",
  borderRadius: "14px",
  background: "linear-gradient(135deg, #6366f1, #4338ca)",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
  fontSize: "18px",
};

export default MainLayout;
