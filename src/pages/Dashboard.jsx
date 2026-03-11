import React, { useState, useEffect } from "react";
import api from "../services/api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    employees: 0,
    departments: 0,
    pending: 5,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [empRes, deptRes] = await Promise.all([
          api.get("/employees"),
          api.get("/departments"),
        ]);
        setStats({
          employees: empRes.data.length,
          departments: deptRes.data.length,
          pending: 5,
        });
      } catch (error) {
        console.error(error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div style={{ width: "100%" }}>
      {/* Tiêu đề */}
      <div style={{ marginBottom: "48px", textAlign: "center" }}>
        <h1
          style={{
            fontSize: "36px",
            color: "#0f172a",
            fontWeight: "800",
            margin: "0 0 12px 0",
            letterSpacing: "-1px",
          }}
        >
          Bảng điều khiển
        </h1>
        <p style={{ color: "#64748b", fontSize: "16px" }}>
          Hệ thống quản trị nhân sự chuyên nghiệp
        </p>
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "24px",
        }}
      >
        <div style={cardStyle}>
          <div
            style={{
              ...iconStyle,
              color: "#6366f1",
              backgroundColor: "#eef2ff",
            }}
          >
            👥
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={cardLabel}>TỔNG NHÂN VIÊN</div>
            <div style={cardValue}>{stats.employees}</div>
          </div>
        </div>

        <div style={cardStyle}>
          <div
            style={{
              ...iconStyle,
              color: "#10b981",
              backgroundColor: "#ecfdf5",
            }}
          >
            🏢
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={cardLabel}>PHÒNG BAN</div>
            <div style={cardValue}>{stats.departments}</div>
          </div>
        </div>

        <div style={cardStyle}>
          <div
            style={{
              ...iconStyle,
              color: "#f59e0b",
              backgroundColor: "#fffbeb",
            }}
          >
            ⏳
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={cardLabel}>ĐANG CHỜ DUYỆT</div>
            <div style={cardValue}>{stats.pending}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const cardStyle = {
  padding: "40px 24px",
  backgroundColor: "#fff",
  borderRadius: "24px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "20px",
  border: "1px solid #f1f5f9",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.06)",
  transition: "0.3s",
};
const iconStyle = {
  width: "64px",
  height: "64px",
  borderRadius: "18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "28px",
};
const cardLabel = {
  fontSize: "13px",
  fontWeight: "800",
  color: "#94a3b8",
  letterSpacing: "0.5px",
};
const cardValue = { fontSize: "42px", fontWeight: "800", color: "#1e293b" };

export default Dashboard;
