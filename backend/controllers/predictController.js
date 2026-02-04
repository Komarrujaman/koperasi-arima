const { exec } = require("child_process");
const path = require("path");
const db = require("../config/db");

// ===============================
// POST /predict
// Body: { product_id, duration }
// duration: 3 (hari) | 7 (minggu) | 30 (bulan)
// ===============================
exports.runPrediction = (req, res) => {
  const { product_id, duration } = req.body;

  // 🔒 VALIDASI
  if (!product_id) {
    return res.status(400).json({ error: "product_id wajib diisi" });
  }

  const steps = parseInt(duration) || 7; // default 7 periode

  // 🧹 HAPUS HASIL LAMA
  db.query("DELETE FROM predictions WHERE product_id = ?", [product_id], (err) => {
    if (err) return res.status(500).json(err);

    // 🐍 PATH PYTHON (LINUX)
    const pythonPath = "python";
    const scriptPath = path.resolve(__dirname, "../../arima/arima.py");

    const command = `${pythonPath} ${scriptPath} ${product_id} ${steps}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("ARIMA STDERR:", stderr);
        return res.status(500).json({
          error: "Gagal menjalankan ARIMA",
          detail: stderr,
        });
      }

      console.log("ARIMA OUTPUT:", stdout);

      res.json({
        message: "Prediksi berhasil dijalankan",
        steps,
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

  db.query("SELECT period, predicted_value FROM predictions WHERE product_id = ? ORDER BY id ASC", [product_id], (err, predictions) => {
    if (err) return res.status(500).json(err);

    db.query("SELECT mae, mse, rmse, mape, accuracy, r2 FROM model_evaluations WHERE product_id = ? ORDER BY id DESC LIMIT 1", [product_id], (err2, evals) => {
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
