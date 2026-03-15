import React, { useState, useEffect } from "react";
import api from "../../services/api";

const List = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await api.get("/users");

        // lấy result từ API
        const data = res.data.map(item => item.result);

        setUsers(data);

      } catch (err) {
        console.error("API ERROR:", err);
      }
    };

    loadUsers();
  }, []);

  return (
    <div style={{ padding: "30px" }}>
      <h2>Danh sách người dùng</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Role</th>
          </tr>
        </thead>

        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.roles?.[0]?.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default List;