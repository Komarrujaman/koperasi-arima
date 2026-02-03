const db = require("../config/db");

exports.getDashboard = (req, res) => {
  const result = {};

  db.query("SELECT COUNT(*) AS totalProduk FROM products", (e1, r1) => {
    result.totalProduk = r1[0].totalProduk;

    db.query("SELECT SUM(current_stock) AS totalStok FROM products", (e2, r2) => {
      result.totalStok = r2[0].totalStok || 0;

      db.query("SELECT COUNT(*) AS stokKritis FROM products WHERE current_stock < 10", (e3, r3) => {
        result.stokKritis = r3[0].stokKritis;

        db.query("SELECT id, name, current_stock FROM products WHERE current_stock < 10", (e4, r4) => {
          result.produkKritis = r4;
          res.json(result);
        });
      });
    });
  });
};
