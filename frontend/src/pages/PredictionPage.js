import React, { useState } from "react";
import authFetch from "../utils/authFetch";

function PredictionPage() {
  const [productId, setProductId] = useState(1);
  const [predictions, setPredictions] = useState([]);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);

  const runPrediction = () => {
    setLoading(true);

    // 1️⃣ Jalankan ARIMA
    authFetch("/predict", {
      method: "POST",
      body: JSON.stringify({ product_id: productId }),
    })
      .then(() => {
        // 2️⃣ Ambil hasil prediksi
        return authFetch(`/predict/${productId}`);
      })
      .then((data) => {
        setPredictions(data.predictions || []);
        setEvaluation(data.evaluation || null);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Prediksi Stok Menggunakan ARIMA</h2>

      <div className="flex gap-3 items-center">
        <input type="number" value={productId} onChange={(e) => setProductId(e.target.value)} className="border rounded px-3 py-2 w-32" />
        <button disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
          {loading ? "Memproses..." : "Jalankan Prediksi"}
        </button>
      </div>

      {/* HASIL */}
      <div className="bg-white rounded shadow p-4">
        <h3 className="font-semibold mb-3">Hasil Prediksi (4 Minggu)</h3>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Periode</th>
              <th className="text-left py-2">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {predictions.map((p, i) => (
              <tr key={i} className="border-b">
                <td className="py-2">{p.period}</td>
                <td className="py-2">{p.predicted_value}</td>
              </tr>
            ))}
            {predictions.length === 0 && (
              <tr>
                <td colSpan="2" className="text-center py-4 text-gray-500">
                  Belum ada prediksi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* EVALUASI */}
      {evaluation && (
        <div className="bg-white rounded shadow p-4">
          <h3 className="font-semibold mb-2">Evaluasi Model</h3>
          <p>MAE : {evaluation.mae}</p>
          <p>RMSE: {evaluation.rmse}</p>
        </div>
      )}
    </div>
  );
}

export default PredictionPage;
