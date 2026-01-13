const { exec } = require("child_process");
const path = require("path");
const db = require("../config/db");

// ===============================
// POST /predict
// Menjalankan ARIMA
// ===============================
exports.runPrediction = (req, res) => {
  db.query("DELETE FROM predictions WHERE product_id = ?", [product_id]);
  if (!product_id) {
    return res.status(400).json({
      error: "product_id wajib diisi",
    });
  }

  const { product_id } = req.body;

  const pythonPath = path.join(__dirname, "../../arima/venv/Scripts/python.exe");
  const scriptPath = path.join(__dirname, "../../arima/arima.py");

  const command = `"${pythonPath}" "${scriptPath}" ${product_id}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("ARIMA error:", error);
      return res.status(500).json({
        error: "Gagal menjalankan ARIMA",
      });
    }

    res.json({
      message: "Prediksi berhasil dijalankan",
      output: stdout,
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
