const db = require("../config/db");

// ===============================
// GET /transactions
// ===============================
exports.getAll = (req, res) => {
  const sql = `
    SELECT 
      t.id,
      t.product_id,
      p.name AS product_name,
      t.transaction_type,
      t.quantity,
      t.transaction_date,
      t.user_id
    FROM stock_transactions t
    JOIN products p ON p.id = t.product_id
    ORDER BY t.transaction_date DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

// ===============================
// POST /transactions
// ===============================
exports.create = (req, res) => {
  const {
    product_id,
    transaction_type, // 'in' | 'out'
    quantity,
    transaction_date,
    user_id,
  } = req.body;

  // 🔒 VALIDASI DASAR
  if (!product_id || !transaction_type || !quantity) {
    return res.status(400).json({
      message: "Data transaksi tidak lengkap",
    });
  }

  const date = transaction_date || new Date();

  const insertSql = `
    INSERT INTO stock_transactions
    (product_id, transaction_type, quantity, transaction_date, user_id)
    VALUES (?,?,?,?,?)
  `;

  db.query(insertSql, [product_id, transaction_type, quantity, date, user_id || null], (err) => {
    if (err) return res.status(500).json(err);

    // 🔄 UPDATE STOK PRODUK
    const stockSql = transaction_type === "in" ? "UPDATE products SET current_stock = current_stock + ? WHERE id = ?" : "UPDATE products SET current_stock = current_stock - ? WHERE id = ?";

    db.query(stockSql, [quantity, product_id], (err2) => {
      if (err2) return res.status(500).json(err2);

      res.json({ message: "Transaksi berhasil disimpan" });
    });
  });
};
