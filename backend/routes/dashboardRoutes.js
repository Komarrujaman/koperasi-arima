const express = require("express");
const router = express.Router();
const controller = require("../controllers/dashboardController");
const auth = require("../middleware/authMiddleware");

router.get("/", auth, controller.getDashboard);

module.exports = router;
