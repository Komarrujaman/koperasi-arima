import React, { useEffect, useState } from "react";
import authFetch from "../utils/authFetch";

function TransactionPage() {
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [type, setType] = useState("out");
  const [form, setForm] = useState({
    product_id: "",
    quantity: "",
  });

  // LOAD DATA
  useEffect(() => {
    authFetch("/products").then(setProducts);
    loadTransactions();
  }, []);

  const loadTransactions = () => {
    authFetch("/transactions").then(setTransactions);
  };

  // SUBMIT TRANSAKSI
  const submit = () => {
    if (!form.product_id || !form.quantity) {
      alert("Lengkapi data transaksi");
      return;
    }

    authFetch("/transactions", {
      method: "POST",
      body: JSON.stringify({
        product_id: form.product_id,
        transaction_type: type,
        quantity: Number(form.quantity),
        transaction_date: new Date().toISOString().slice(0, 10),
        user_id: 1, // admin sementara
      }),
    }).then(() => {
      setForm({ product_id: "", quantity: "" });
      loadTransactions();
    });
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Transaksi Stok</h1>
        <p className="text-gray-500">Pencatatan barang masuk dan keluar koperasi kampus</p>
      </div>

      {/* FORM TRANSAKSI */}
      <div className="bg-white rounded-xl shadow p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* JENIS */}
        <select className="border rounded px-3 py-2" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="out">Barang Keluar</option>
          <option value="in">Barang Masuk</option>
        </select>

        {/* PRODUK */}
        <select className="border rounded px-3 py-2" value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })}>
          <option value="">Pilih Produk</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* JUMLAH */}
        <input type="number" min="1" className="border rounded px-3 py-2" placeholder="Jumlah" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />

        {/* BUTTON */}
        <button onClick={submit} className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4">
          Simpan
        </button>
      </div>

      {/* RIWAYAT TRANSAKSI */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Tanggal</th>
              <th className="px-4 py-3 text-left">Produk</th>
              <th className="px-4 py-3 text-left">Jenis</th>
              <th className="px-4 py-3 text-left">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{new Date(t.transaction_date).toLocaleDateString()}</td>
                <td className="px-4 py-2">{t.product_name}</td>
                <td className="px-4 py-2">{t.transaction_type === "out" ? <span className="text-red-600 font-medium">Keluar</span> : <span className="text-green-600 font-medium">Masuk</span>}</td>
                <td className="px-4 py-2">{t.quantity}</td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500">
                  Belum ada transaksi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TransactionPage;
