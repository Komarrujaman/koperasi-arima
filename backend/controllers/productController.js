const db = require("../config/db");

// ===============================
// GET /products
// Ambil semua produk
// ===============================
exports.getAll = (req, res) => {
  db.query("SELECT * FROM products ORDER BY id DESC", (err, results) => {
    if (err) {
      console.error("GET products error:", err);
      return res.status(500).json({ message: "Gagal mengambil data produk" });
    }
    res.json(results);
  });
};

// ===============================
// POST /products
// Tambah produk baru
// ===============================
exports.create = (req, res) => {
  const { name, category, current_stock } = req.body;

  if (!name || !category || current_stock === undefined) {
    return res.status(400).json({
      message: "Nama, kategori, dan stok wajib diisi",
    });
  }

  const sql = "INSERT INTO products (name, category, current_stock) VALUES (?, ?, ?)";

  db.query(sql, [name, category, current_stock], (err) => {
    if (err) {
      console.error("CREATE product error:", err);
      return res.status(500).json({ message: "Gagal menambah produk" });
    }

    res.json({ message: "Produk berhasil ditambahkan" });
  });
};

// ===============================
// PUT /products/:id
// Update produk
// ===============================
exports.update = (req, res) => {
  const { id } = req.params;
  const { name, category, current_stock } = req.body;

  if (!name || !category || current_stock === undefined) {
    return res.status(400).json({
      message: "Nama, kategori, dan stok wajib diisi",
    });
  }

  const sql = "UPDATE products SET name = ?, category = ?, current_stock = ? WHERE id = ?";

  db.query(sql, [name, category, current_stock, id], (err, result) => {
    if (err) {
      console.error("UPDATE product error:", err);
      return res.status(500).json({ message: "Gagal update produk" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    res.json({ message: "Produk berhasil diupdate" });
  });
};

// ===============================
// DELETE /products/:id
// Hapus produk
// ===============================
exports.remove = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM products WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("DELETE product error:", err);
      return res.status(500).json({ message: "Gagal menghapus produk" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    res.json({ message: "Produk berhasil dihapus" });
  });
};
