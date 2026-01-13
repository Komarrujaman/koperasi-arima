import React, { useEffect, useState } from "react";
import API_URL from "../api";

function UserPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then(setUsers);
  }, []);

  return (
    <div>
      <h2>Manajemen User</h2>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.username}</td>
              <td>{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserPage;
