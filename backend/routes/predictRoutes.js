const express = require("express");
const router = express.Router();
const predictController = require("../controllers/predictController");
const auth = require("../middleware/authMiddleware");

// Jalankan ARIMA (HARUS LOGIN)
router.post("/", auth, predictController.runPrediction);

// Ambil hasil prediksi (HARUS LOGIN)
router.get("/:product_id", auth, predictController.getPredictionResult);

// Validasi histori transaksi
router.get("/status/:product_id", auth, predictController.checkPredictionStatus);

module.exports = router;
