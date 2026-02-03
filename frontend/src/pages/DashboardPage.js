import { useEffect, useState } from "react";
import authFetch from "../utils/authFetch";

function DashboardPage({ setPage }) {
  const [data, setData] = useState(null);
  const [predictStatus, setPredictStatus] = useState({});

  useEffect(() => {
    authFetch("/dashboard")
      .then(setData)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!data || !data.produkKritis) return;

    data.produkKritis.forEach((p) => {
      authFetch(`/predict/status/${p.id}`).then((res) => {
        setPredictStatus((prev) => ({
          ...prev,
          [p.id]: res,
        }));
      });
    });
  }, [data]);

  if (!data) return <p>Loading dashboard...</p>;

  return (
    <div className="space-y-6">
      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Produk" value={data.totalProduk} />
        <StatCard title="Total Stok" value={data.totalStok} />
        <StatCard title="Stok Kritis" value={data.stokKritis} danger />
      </div>

      {/* STOK KRITIS */}
      <div className="bg-white rounded shadow p-5">
        <h3 className="text-lg font-semibold mb-3">Produk dengan Stok Kritis</h3>

        {!data.produkKritis || data.produkKritis.length === 0 ? (
          <p className="text-green-600">Semua stok dalam kondisi aman</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Produk</th>
                <th className="text-left py-2">Stok</th>
                <th className="text-left py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.produkKritis.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="py-2">{p.name}</td>
                  <td className="py-2 text-red-600 font-semibold">{p.current_stock}</td>
                  <td className="py-2">
                    {predictStatus[p.id]?.canPredict ? (
                      <button
                        onClick={() => {
                          localStorage.setItem("selectedProductId", p.id);
                          setPage("prediction");
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        Prediksi
                      </button>
                    ) : (
                      <button disabled title={`Data baru ${predictStatus[p.id]?.totalPeriod || 0} periode`} className="text-red-600 cursor-not-allowed">
                        Belum dapat diprediksi ARIMA
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* CTA GLOBAL */}
      <div className="bg-blue-50 border border-blue-200 rounded p-5 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-blue-800">Prediksi Kebutuhan Stok</h3>
          <p className="text-sm text-blue-700">Gunakan ARIMA untuk memprediksi kebutuhan stok berdasarkan tren penjualan.</p>
        </div>
        <button onClick={() => setPage("prediction")} className="bg-blue-600 text-white px-4 py-2 rounded">
          Buka Prediksi
        </button>
      </div>
    </div>
  );
}

function StatCard({ title, value, danger }) {
  return (
    <div className={`bg-white rounded shadow p-5 ${danger ? "border-l-4 border-red-500" : ""}`}>
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

export default DashboardPage;
