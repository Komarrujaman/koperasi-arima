const db = require("../config/db");
const jwt = require("jsonwebtoken");

exports.login = (req, res) => {
  const { username, password } = req.body;

  db.query("SELECT * FROM users WHERE username = ?", [username], (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ message: "User tidak ditemukan" });
    }

    const user = results[0];

    // plaintext (OK utk skripsi)
    if (password !== user.password) {
      return res.status(401).json({ message: "Password salah" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES });

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
