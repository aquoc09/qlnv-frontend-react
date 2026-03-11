import React, { useState, useEffect } from "react";
import api from "../../services/api";

  // STATE

const List = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");

  const [form, setForm] = useState({
  code: "",
  name: "",
  deptId: "",
  salary: "",
});

// HÀM NHẬP DỮ LIỆU

const handleChange = (e) => {
  setForm({
    ...form,
    [e.target.name]: e.target.value,
  });
};

const handleAdd = async () => {
    const res = await api.post("/employees", form);

    setEmployees([...employees, res.data]);

    setForm({
      code: "",
      name: "",
      deptId: "",
      salary: "",
    });
  };

 const handleDelete = async (id) => {
  await api.delete(`/employees/${id}`);

  setEmployees(employees.filter(emp => emp.id !== id));
};

const handleUpdate = async () => {
  await api.put(`/employees/${editingId}`, form);

  setEmployees(
    employees.map((emp) =>
      emp.id === editingId ? { ...emp, ...form } : emp
    )
  );

  setEditingId(null);

  setForm({
    code: "",
    name: "",
    deptId: "",
    salary: "",
  });
};

const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    api.get("/employees").then((res) => setEmployees(res.data));
  }, []);

  const filteredData = employees.filter(
    (emp) =>
      (emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.code.toLowerCase().includes(search.toLowerCase())) &&
      (filterDept === "" || emp.deptId === filterDept),
  );

  return (
    <div style={containerStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "35px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              color: "#0f172a",
              fontSize: "28px",
              fontWeight: "800",
            }}
          >
            Quản lý Nhân viên
          </h2>
          <p style={{ color: "#64748b", margin: "4px 0 0" }}>
            Hiển thị danh sách nhân sự toàn công ty
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "16px", marginBottom: "30px" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <input
            placeholder="Tìm kiếm tên hoặc mã nhân viên..."
            style={inputSearchStyle}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          style={selectStyle}
          onChange={(e) => setFilterDept(e.target.value)}
        >
          <option value="">Tất cả phòng ban</option>
          <option value="d1">Kỹ thuật</option>
          <option value="d2">Kế toán</option>
        </select>
      </div>

<div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
  <input
    name="code"
    placeholder="Mã NV"
    value={form.code}
    onChange={handleChange}
  />

  <input
    name="name"
    placeholder="Tên NV"
    value={form.name}
    onChange={handleChange}
  />

  <input
    name="deptId"
    placeholder="Phòng ban"
    value={form.deptId}
    onChange={handleChange}
  />

  <input
    name="salary"
    placeholder="Lương"
    value={form.salary}
    onChange={handleChange}
  />

  {editingId ? (
    <button onClick={handleUpdate}>Cập nhật</button>
  ) : (
    <button onClick={handleAdd}>Thêm</button>
  )}
</div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{ textAlign: "left", borderBottom: "2px solid #f1f5f9" }}
            >
              <th style={thStyle}>MÃ NV</th>
              <th style={thStyle}>HỌ TÊN</th>
              <th style={thStyle}>PHÒNG BAN</th>
              <th style={thStyle}>MỨC LƯƠNG</th>
              <th style={thStyle}>TRẠNG THÁI</th>
              <th style={thStyle}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((emp) => (
              <tr key={emp.id} style={trStyle}>
                <td style={tdStyle}>
                  <span style={{ fontWeight: "700", color: "#6366f1" }}>
                    {emp.code}
                  </span>
                </td>
                <td style={tdStyle}>
                  <div style={{ fontWeight: "600", color: "#1e293b" }}>
                    {emp.name}
                  </div>
                </td>
                <td style={tdStyle}>
                  <span style={badgeStyle}>{emp.deptId}</span>
                </td>
                <td style={tdStyle}>
                  <span style={{ color: "#059669", fontWeight: "700" }}>
                    {emp.salary}
                  </span>
                </td>
                <td style={tdStyle}>
                  <span style={statusBadge}>Đang làm việc</span>
                </td>
                <td style={tdStyle}>
                <button
                  style={actionBtn}
                  onClick={() => handleEdit(emp)}
                >
                  Sửa
                </button>

                <button
                  style={{ ...actionBtn, color: "red", marginLeft: "10px" }}
                  onClick={() => handleDelete(emp.id)}
                >
                  Xóa
                </button>
              </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Styles cho List
const containerStyle = {
  backgroundColor: "#fff",
  padding: "35px",
  borderRadius: "24px",
  border: "1px solid #f1f5f9",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
  width: "100%",
  boxSizing: "border-box",
};
const inputSearchStyle = {
  padding: "14px 0px",
  borderRadius: "14px",
  border: "1.5px solid #e2e8f0",
  width: "50%",
  outline: "none",
  fontSize: "15px",
};
const selectStyle = {
  padding: "14px",
  borderRadius: "14px",
  border: "1.5px solid #e2e8f0",
  cursor: "pointer",
  minWidth: "200px",
  outline: "none",
  fontWeight: "500",
};
const btnPrimary = {
  backgroundColor: "#6366f1",
  color: "#fff",
  border: "none",
  padding: "14px 28px",
  borderRadius: "14px",
  fontWeight: "700",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)",
};
const thStyle = {
  padding: "18px",
  color: "#94a3b8",
  fontSize: "12px",
  fontWeight: "800",
  letterSpacing: "1px",
};
const tdStyle = { padding: "20px 18px", color: "#1e293b", fontSize: "15px" };
const trStyle = { borderBottom: "1px solid #f8fafc", transition: "0.2s" };
const badgeStyle = {
  backgroundColor: "#eef2ff",
  color: "#6366f1",
  padding: "6px 14px",
  borderRadius: "10px",
  fontSize: "13px",
  fontWeight: "700",
};
const statusBadge = {
  backgroundColor: "#ecfdf5",
  color: "#059669",
  padding: "6px 14px",
  borderRadius: "10px",
  fontSize: "13px",
  fontWeight: "700",
};
const actionBtn = {
  color: "#6366f1",
  border: "none",
  background: "none",
  fontWeight: "700",
  cursor: "pointer",
  textDecoration: "underline",
};

export default List;
