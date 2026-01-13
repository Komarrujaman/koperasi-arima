const express = require("express");
const router = express.Router();
const controller = require("../controllers/transactionController");
const auth = require("../middleware/authMiddleware");

router.get("/", auth, controller.getAll);
router.post("/", auth, controller.create);

module.exports = router;
