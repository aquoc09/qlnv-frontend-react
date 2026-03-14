import React, { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

// --- CSS STYLES ---
const fullScreenWrapper = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100vw",
  height: "100vh",
  backgroundColor: "#f8fafc",
  margin: 0,
  padding: 0,
  position: "fixed",
  top: 0,
  left: 0,
  fontFamily: "'Inter', sans-serif",
};

const loginCardStyle = {
  padding: "48px",
  backgroundColor: "#fff",
  borderRadius: "24px",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)",
  width: "420px",
  textAlign: "center",
  border: "1px solid #e2e8f0",
};

const logoIcon = {
  width: "48px",
  height: "48px",
  backgroundColor: "#4f46e5",
  color: "#fff",
  borderRadius: "14px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "24px",
  fontWeight: "bold",
};

const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: "600",
  color: "#475569",
  marginBottom: "8px",
  marginLeft: "4px",
};

const inputStyle = {
  width: "100%",
  padding: "14px 18px",
  borderRadius: "12px",
  border: "1px solid #cbd5e1",
  boxSizing: "border-box",
  outline: "none",
  transition: "all 0.2s",
  fontSize: "15px",
};

const loginBtnStyle = {
  width: "100%",
  padding: "16px",
  backgroundColor: "#4f46e5",
  color: "#fff",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "600",
  boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
  transition: "all 0.2s",
};

// --- COMPONENT CHÍNH ---
const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.get("/users");
      const user = res.data.find(
        (u) => u.username === username.trim() && u.password === password.trim()
      );

      if (user) {
        // Lưu thông tin vào kho chứa cục bộ
        localStorage.setItem("user", JSON.stringify(user));
        
        // Dùng window.location.href để đảm bảo App.jsx nhận diện ngay quyền
        if (user.role === "admin" || user.role === "hr") {
          window.location.href = "/users";
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        alert("Sai tài khoản hoặc mật khẩu!");
      }
    } catch (error) {
      alert("Lỗi kết nối server!");
    }
  };

  return (
    <div style={fullScreenWrapper}>
      <form onSubmit={handleLogin} style={loginCardStyle}>
        <div style={{ marginBottom: "32px" }}>
          <div style={logoIcon}>H</div>
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#0f172a",
              margin: "16px 0 8px",
            }}
          >
            Chào mừng trở lại
          </h2>
          <p style={{ color: "#64748b", fontSize: "15px" }}>
            Vui lòng đăng nhập để quản lý hệ thống
          </p>
        </div>

        <div style={{ textAlign: "left", marginBottom: "20px" }}>
          <label style={labelStyle}>Tên đăng nhập</label>
          <input
            type="text"
            placeholder="Nhập tài khoản..."
            style={inputStyle}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div style={{ textAlign: "left", marginBottom: "32px" }}>
          <label style={labelStyle}>Mật khẩu</label>
          <input
            type="password"
            placeholder="••••••••"
            style={inputStyle}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button 
          type="submit" 
          style={loginBtnStyle}
          onMouseOver={(e) => (e.target.style.transform = "translateY(-2px)")}
          onMouseOut={(e) => (e.target.style.transform = "translateY(0)")}
        >
          Vào hệ thống
        </button>
      </form>
    </div>
  );
};

export default Login;