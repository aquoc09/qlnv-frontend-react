g");
      const user = res.data.find(
        (u) => u.username === username.trim() && u.password === password.trim(),
      );

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        navigate("/dashboard");
        window.location.reload();
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
              fontWeight: "800",
              color: "#0f172a",
              margin: "12px 0 8px",
            }}
          >
            Chào mừng trở lại
          </h2>
          <p style={{ color: "#64748b", fontSize: "14px" }}>
            Vui lòng đăng nhập để quản lý hệ thống
          </p>
        </div>

        <div style={{ textAlign: "left", marginBottom: "20px" }}>
          <label style={labelStyle}>Tên đăng nhập</label>
          <input
            type="text"
            placeholder="Nhập thông tin"
            style={inputStyle}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div style={{ textAlign: "left", marginBottom: "30px" }}>
          <label style={labelStyle}>Mật khẩu</label>
          <input
            type="password"
            placeholder="••••••••"
            style={inputStyle}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" style={loginBtnStyle}>
          Vào hệ thống
        </button>
      </form>
    </div>
  );
};

// --- CSS STYLES ---

const fullScreenWrapper = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100vw",
  height: "100vh",
  backgroundColor: "#ffffff",
  margin: 0,
  padding: 0,
  position: "fixed",
  top: 0,
  left: 0,
  fontFamily: "'Plus Jakarta Sans', sans-serif",
};

const loginCardStyle = {
  padding: "48px",
  backgroundColor: "#fff",
  borderRadius: "32px",
  boxShadow:
    "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)",
  width: "420px",
  textAlign: "center",
  border: "1px solid #f1f5f9",
};

const logoIcon = {
  width: "48px",
  height: "48px",
  backgroundColor: "#6366f1",
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
  fontWeight: "700",
  color: "#1e293b",
  marginBottom: "8px",
  marginLeft: "4px",
};
const inputStyle = {
  width: "100%",
  padding: "14px 18px",
  borderRadius: "14px",
  border: "1.5px solid #e2e8f0",
  boxSizing: "border-box",
  outline: "none",
  transition: "0.3s",
  fontSize: "15px",
};
const loginBtnStyle = {
  width: "100%",
  padding: "16px",
  backgroundColor: "#0f172a",
  color: "#fff",
  border: "none",
  borderRadius: "14px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "700",
  boxShadow: "0 10px 15px -3px rgba(15, 23, 42, 0.2)",
};

export default Login;