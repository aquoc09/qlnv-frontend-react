import React, { useState, useEffect } from "react";
import api from "../../services/api";

const List = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    code: "",
    name: "",
    deptId: "",
    salary: "",
  });

  // LOAD DATA
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.get("/employees");
        console.log("DATA:", res.data);
        setEmployees(res.data);
      } catch (err) {
        console.error("API ERROR:", err);
      }
    };

    loadData();
  }, []);

  // HANDLE FORM CHANGE
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ADD
  const handleAdd = async () => {
    try {
      const res = await api.post("/employees", form);

      setEmployees([...employees, res.data]);

      setForm({
        code: "",
        name: "",
        deptId: "",
        salary: "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    try {
      await api.delete(`/employees/${id}`);
      setEmployees(employees.filter((emp) => emp.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // UPDATE
  const handleUpdate = async () => {
    try {
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
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (emp) => {
    setEditingId(emp.id);

    setForm({
      code: emp.code,
      name: emp.name,
      deptId: emp.deptId,
      salary: emp.salary,
    });
  };

  const filteredData = employees.filter(
    (emp) =>
      (emp.name?.toLowerCase().includes(search.toLowerCase()) ||
        emp.code?.toLowerCase().includes(search.toLowerCase())) &&
      (filterDept === "" || emp.deptId === filterDept)
  );

  return (
    <div>
      <h2>Quản lý nhân viên</h2>

      <input
        placeholder="Search..."
        onChange={(e) => setSearch(e.target.value)}
      />

      <table border="1">
        <thead>
          <tr>
            <th>Mã NV</th>
            <th>Tên</th>
            <th>Phòng ban</th>
            <th>Lương</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredData.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.code}</td>
              <td>{emp.name}</td>
              <td>{emp.deptId}</td>
              <td>{emp.salary}</td>

              <td>
                <button onClick={() => handleEdit(emp)}>Edit</button>
                <button onClick={() => handleDelete(emp.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default List;