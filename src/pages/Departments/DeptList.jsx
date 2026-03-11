import React, { useState, useEffect } from "react";
import api from "../../services/api";

const DeptList = () => {
  const [depts, setDepts] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const [dRes, eRes] = await Promise.all([
        api.get("/departments"),
        api.get("/employees"),
      ]);
      setDepts(dRes.data);
      setEmployees(eRes.data);
    };
    loadData();
  }, []);

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: "35px" }}>
        <h2
          style={{
            margin: 0,
            color: "#0f172a",
            fontSize: "28px",
            fontWeight: "800",
          }}
        >
          Danh sách Phòng ban
        </h2>
        <p style={{ color: "#64748b", margin: "4px 0 0" }}>
          Cấu trúc tổ chức và nhân sự phụ trách
        </p>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{ borderBottom: "2px solid #f1f5f9", textAlign: "left" }}
            >
              <th style={thStyle}>MÃ</th>
              <th style={thStyle}>TÊN PHÒNG BAN</th>
              <th style={thStyle}>TRƯỞNG PHÒNG</th>
              <th style={thStyle}>QUY MÔ</th>
              <th style={thStyle}>THAO TÁC</th>
            </tr>
          </thead>

          <tbody>
            {depts.map((d) => (
              <tr key={d.id} style={trStyle}>
                <td style={tdStyle}>
                  <span style={{ fontWeight: "700" }}>{d.id}</span>
                </td>

                <td style={tdStyle}>
                  <strong style={{ color: "#0f172a", fontSize: "16px" }}>
                    {d.name}
                  </strong>
                </td>

                {/* TRƯỞNG PHÒNG */}
                <td style={tdStyle}>
                  <span style={{ fontWeight: "500" }}>{d.manager}</span>
                </td>

                {/* QUY MÔ */}
                <td style={tdStyle}>
                  <span style={memberBadge}>
                    {employees.filter((e) => e.deptId === d.id).length} thành
                    viên
                  </span>
                </td>

                {/* THAO TÁC */}
                <td style={tdStyle}>
                  <button style={editBtn}>Chi tiết</button>
                  <button style={deleteBtn}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Styles
const containerStyle = {
  backgroundColor: "white",
  padding: "35px",
  borderRadius: "24px",
  border: "1px solid #f1f5f9",
  width: "100%",
  boxSizing: "border-box",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
};

const thStyle = {
  padding: "18px",
  color: "#94a3b8",
  fontSize: "12px",
  fontWeight: "800",
  letterSpacing: "1px",
};

const tdStyle = {
  padding: "20px 18px",
  color: "#1e293b",
  fontSize: "15px",
};

const trStyle = {
  borderBottom: "1px solid #f8fafc",
};

const memberBadge = {
  backgroundColor: "#f1f5f9",
  color: "#1d4ed8",
  padding: "8px 16px",
  borderRadius: "12px",
  fontSize: "13px",
  fontWeight: "700",
  border: "1px solid #e2e8f0",
};

const editBtn = {
  color: "#6366f1",
  background: "none",
  border: "none",
  fontWeight: "700",
  marginRight: "20px",
  cursor: "pointer",
};

const deleteBtn = {
  color: "#ef4444",
  background: "none",
  border: "none",
  fontWeight: "700",
  cursor: "pointer",
};

export default DeptList;
