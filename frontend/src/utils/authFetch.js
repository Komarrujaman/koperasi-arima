import API_URL from "../api";

export default async function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  // 🔴 TOKEN EXPIRED / INVALID
  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.reload(); // auto logout
    throw new Error("Unauthorized");
  }

  return res.json();
}
