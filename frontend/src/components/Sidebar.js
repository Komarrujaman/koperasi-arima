function Sidebar({ setPage }) {
  return (
    <aside className="w-64 bg-slate-800 text-white p-5">
      <h2 className="text-xl font-bold mb-6">Koperasi Kampus</h2>

      <nav className="space-y-2">
        <button onClick={() => setPage("dashboard")} className="w-full text-left px-3 py-2 rounded hover:bg-slate-700">
          Dashboard
        </button>

        <button onClick={() => setPage("products")} className="w-full text-left px-3 py-2 rounded hover:bg-slate-700">
          Produk
        </button>

        <button onClick={() => setPage("transactions")} className="w-full text-left px-3 py-2 rounded hover:bg-slate-700">
          Transaksi
        </button>

        <button onClick={() => setPage("prediction")} className="w-full text-left px-3 py-2 rounded hover:bg-slate-700">
          Prediksi Stok
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;
