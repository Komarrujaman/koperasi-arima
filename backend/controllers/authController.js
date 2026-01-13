const db = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const SECRET = "koperasi_secret_key";

exports.login = (req, res) => {
  const { username, password } = req.body;

  db.query("SELECT * FROM users WHERE username = ?", [username], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ message: "User tidak ditemukan" });
    }

    const user = results[0];

    // sementara plaintext (boleh untuk skripsi)
    if (password !== user.password) {
      return res.status(401).json({ message: "Password salah" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: "1h" });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  });
};
