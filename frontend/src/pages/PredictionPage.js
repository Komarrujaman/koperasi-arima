import React, { useEffect, useState } from "react";
import authFetch from "../utils/authFetch";

function PredictionPage() {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");
  const [duration, setDuration] = useState(7);
  const [predictions, setPredictions] = useState([]);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [canPredict, setCanPredict] = useState(true);
  const [totalPeriod, setTotalPeriod] = useState(0);

  // ===============================
  // PAGINATION STATE
  // ===============================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ===============================
  // Ambil product_id dari dashboard
  // ===============================
  useEffect(() => {
    const pid = localStorage.getItem("selectedProductId");
    if (pid) setProductId(pid);
  }, []);

  // ===============================
  // Load produk
  // ===============================
  useEffect(() => {
    authFetch("/products").then(setProducts);
  }, []);

  // ===============================
  // Cek status data cukup
  // ===============================
  useEffect(() => {
    if (!productId) return;

    authFetch(`/predict/status/${productId}`).then((res) => {
      setCanPredict(res.canPredict);
      setTotalPeriod(res.totalPeriod);
    });
  }, [productId]);

  // ===============================
  // Jalankan prediksi
  // ===============================
  const runPrediction = () => {
    if (!productId) {
      alert("Pilih produk terlebih dahulu");
      return;
    }

    setLoading(true);
    setPredictions([]);
    setEvaluation(null);
    setCurrentPage(1); // reset pagination

    authFetch("/predict", {
      method: "POST",
      body: JSON.stringify({
        product_id: productId,
        duration: duration,
      }),
    })
      .then(() => authFetch(`/predict/${productId}`))
      .then((data) => {
        setPredictions(data.predictions || []);
        setEvaluation(data.evaluation || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  // ===============================
  // PAGINATION LOGIC
  // ===============================
  const totalPages = Math.ceil(predictions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPredictions = predictions.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Prediksi Stok Menggunakan ARIMA</h2>

      {/* ===============================
          INPUT KONTROL
         =============================== */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* PILIH PRODUK */}
        <select value={productId} onChange={(e) => setProductId(e.target.value)} className="border px-3 py-2 rounded">
          <option value="">Pilih Produk</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* PILIH DURASI */}
        <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="border px-3 py-2 rounded">
          <option value={3}>3 Hari</option>
          <option value={7}>1 Minggu</option>
          <option value={30}>1 Bulan</option>
        </select>

        {/* BUTTON */}
        {canPredict ? (
          <button onClick={runPrediction} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
            {loading ? "Memproses..." : "Jalankan Prediksi"}
          </button>
        ) : (
          <button disabled className="bg-red-600 text-white px-4 py-2 rounded cursor-not-allowed">
            Data belum cukup ({totalPeriod}/10)
          </button>
        )}
      </div>

      {/* ===============================
          HASIL PREDIKSI
         =============================== */}
      <div className="bg-white rounded shadow p-4">
        <h3 className="font-semibold mb-3">Hasil Prediksi ({predictions.length} Periode)</h3>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Periode</th>
              <th className="text-left py-2">Jumlah Terjual</th>
            </tr>
          </thead>
          <tbody>
            {currentPredictions.map((p, i) => (
              <tr key={i} className="border-b">
                <td className="py-2">{p.period}</td>
                <td className="py-2">{p.predicted_value}</td>
              </tr>
            ))}

            {!loading && predictions.length === 0 && (
              <tr>
                <td colSpan="2" className="text-center py-4 text-gray-500">
                  Belum ada hasil prediksi
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ===============================
            PAGINATION
           =============================== */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-4 text-sm gap-3">
            <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded disabled:opacity-50">
              Prev
            </button>

            <span>
              {currentPage} of {totalPages}
            </span>

            <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded disabled:opacity-50">
              Next
            </button>
          </div>
        )}
      </div>

      {/* ===============================
          EVALUASI MODEL
         =============================== */}
      {evaluation && (
        <div className="bg-white rounded shadow p-4 space-y-1">
          <h3 className="font-semibold mb-2">Evaluasi Model</h3>
          <p>MAE : {evaluation.mae}</p>
          <p>MSE : {evaluation.mse}</p>
          <p>RMSE: {evaluation.rmse}</p>
          <p>MAPE: {evaluation.mape}%</p>
          <p>Akurasi: {evaluation.accuracy}%</p>
          <p>R² Score: {evaluation.r2}</p>
        </div>
      )}
    </div>
  );
}

export default PredictionPage;
