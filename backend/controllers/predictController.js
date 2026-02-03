const { exec } = require("child_process");
const path = require("path");
const db = require("../config/db");

// ===============================
// POST /predict
// Menjalankan ARIMA
// ===============================
exports.runPrediction = (req, res) => {
  // ✅ 1. AMBIL DULU product_id
  const { product_id } = req.body;

  // ✅ 2. VALIDASI
  if (!product_id) {
    return res.status(400).json({
      error: "product_id wajib diisi",
    });
  }

  // ✅ 3. HAPUS HASIL LAMA (SETELAH product_id ADA)
  db.query("DELETE FROM predictions WHERE product_id = ?", [product_id], (err) => {
    if (err) {
      return res.status(500).json(err);
    }

    // ✅ 4. PATH PYTHON (LINUX SERVER)
    const pythonPath = path.join(__dirname, "../../arima/venv/Scripts/python.exe");
    const scriptPath = path.join(__dirname, "../../arima/arima.py");

    const command = `${pythonPath} ${scriptPath} ${product_id}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("ARIMA error:", stderr);
        return res.status(500).json({
          error: "Gagal menjalankan ARIMA",
        });
      }

      res.json({
        message: "Prediksi berhasil dijalankan",
      });
    });
  });
};

// ===============================
// GET /predict/:product_id
// Ambil hasil prediksi + evaluasi
// ===============================
exports.getPredictionResult = (req, res) => {
  const { product_id } = req.params;

  db.query("SELECT period, predicted_value FROM predictions WHERE product_id = ? ORDER BY id DESC LIMIT 4", [product_id], (err, predictions) => {
    if (err) return res.status(500).json(err);

    db.query("SELECT mae, rmse FROM model_evaluations WHERE product_id = ? ORDER BY id DESC LIMIT 1", [product_id], (err2, evals) => {
      if (err2) return res.status(500).json(err2);

      res.json({
        predictions,
        evaluation: evals[0] || null,
      });
    });
  });
};

// ===============================
// GET /predict/status/:product_id
// Cek apakah data cukup untuk ARIMA
// ===============================
exports.checkPredictionStatus = (req, res) => {
  const { product_id } = req.params;

  const sql = `
    SELECT COUNT(*) AS total
    FROM sales_history
    WHERE product_id = ?
  `;

  db.query(sql, [product_id], (err, result) => {
    if (err) return res.status(500).json(err);

    const totalPeriod = result[0].total;

    res.json({
      canPredict: totalPeriod >= 10,
      totalPeriod,
      minRequired: 10,
    });
  });
};
