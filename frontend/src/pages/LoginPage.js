import React, { useState } from "react";
import API_URL from "../api";

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const submit = () => {
    fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        localStorage.setItem("token", data.token);
        onLogin();
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Login Admin Koperasi</h2>

        <input className="w-full border p-2 mb-3 rounded" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />

        <input type="password" className="w-full border p-2 mb-4 rounded" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />

        <button onClick={submit} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Login
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
