import React, { useEffect, useState } from "react";
import authFetch from "../utils/authFetch";

function ProductPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    category: "",
    current_stock: "",
  });

  const loadProducts = () => {
    authFetch("/products")
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", category: "", current_stock: "" });
    setModal(true);
  };

  const openEdit = (p) => {
    setEditing(p.id);
    setForm({
      name: p.name,
      category: p.category,
      current_stock: p.current_stock,
    });
    setModal(true);
  };

  const submit = () => {
    const endpoint = editing ? `/products/${editing}` : "/products";
    const method = editing ? "PUT" : "POST";

    authFetch(endpoint, {
      method,
      body: JSON.stringify(form),
    })
      .then(() => {
        setModal(false);
        loadProducts();
      })
      .catch(() => {});
  };

  const remove = (id) => {
    if (!window.confirm("Hapus produk ini?")) return;

    authFetch(`/products/${id}`, {
      method: "DELETE",
    })
      .then(loadProducts)
      .catch(() => {});
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Produk</h1>
        <p className="text-gray-500">Kelola data barang koperasi kampus</p>
      </div>

      {/* CARD */}
      <div className="bg-white rounded-xl shadow-sm border">
        {/* TOOLBAR */}
        <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b">
          <input className="border rounded-lg px-3 py-2 w-full md:w-64 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="🔍 Cari produk..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            + Tambah Produk
          </button>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Nama</th>
                <th className="px-6 py-3 text-left">Kategori</th>
                <th className="px-6 py-3 text-left">Stok</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-gray-500">
                    Tidak ada data produk
                  </td>
                </tr>
              )}

              {filtered.map((p) => (
                <tr key={p.id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-800">{p.name}</td>
                  <td className="px-6 py-4 text-gray-600">{p.category}</td>
                  <td className="px-6 py-4">{p.current_stock}</td>
                  <td className="px-6 py-4">{p.current_stock < 10 ? <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">Kritis</span> : <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Aman</span>}</td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button onClick={() => openEdit(p)} className="text-blue-600 hover:underline">
                      Edit
                    </button>
                    <button onClick={() => remove(p.id)} className="text-red-600 hover:underline">
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-96 p-6 space-y-4">
            <h2 className="text-lg font-semibold">{editing ? "Edit Produk" : "Tambah Produk"}</h2>

            <input className="border rounded px-3 py-2 w-full" placeholder="Nama Produk" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="border rounded px-3 py-2 w-full" placeholder="Kategori" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <input
              type="number"
              className="border rounded px-3 py-2 w-full"
              placeholder="Stok"
              value={form.current_stock}
              onChange={(e) =>
                setForm({
                  ...form,
                  current_stock: e.target.value,
                })
              }
            />

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setModal(false)} className="px-4 py-2 rounded border">
                Batal
              </button>
              <button onClick={submit} className="bg-blue-600 text-white px-4 py-2 rounded">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductPage;
