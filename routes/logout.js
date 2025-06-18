const { Router } = require("express");
const router = Router();

router.get("/", async (req, res) => {
  res.clearCookie("token", { path: "/" });
  res.clearCookie("order_id", { path: "/" });
  res.clearCookie("table", { path: "/" });
  res.clearCookie("total", { path: "/" });
  res.redirect("/login");
});

module.exports = router;
