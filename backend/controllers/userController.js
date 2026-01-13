const db = require("../config/db");

exports.getAll = (req, res) => {
  db.query("SELECT id, username, role FROM users", (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
};
