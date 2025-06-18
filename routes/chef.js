const { Router, urlencoded } = require("express");
const router = Router();
const express = require("express");
const pool = require("../db.js");
const jwt = require("jsonwebtoken");
const { auth, chefAuth } = require("../middlewares/auth");
const { body, validationResult } = require("express-validator");
router.use(urlencoded({ extended: true }));

require("dotenv").config();
const SECRET_KEY = process.env.SECRET_KEY;
const role = {
  c: "chef",
  a: "administrator",
  u: "customer",
};
const status = {
  c: "Completed",
  o: "Cooking",
};
router.use(express.json());

router.get("/", [auth, chefAuth], async (req, res) => {
  const sql = `select * from orders WHERE status IS NOT NULL`;
  let index = 0;
  const fullData = [];
  const [orderTable] = await pool.promise().query(sql);
  for (const item of orderTable) {
    if (item.status === status.c) {
      continue;
    }
    const sql2 = "SELECT * FROM serve where order_id = ?";
    const [query2] = await pool.promise().query(sql2, [item.order_id]);

    fullData[index] = {};

    let products = [];
    query2.forEach((ele) => {
      const txt = `(${ele.product_id}/${ele.quantity})`;
      products.push(txt);
    });

    fullData[index].orderID = item.order_id;
    fullData[index].userID = item.user_id;
    fullData[index].status = item.status;
    fullData[index].instructions = item.instructions;
    fullData[index].dish = products.join(" - ");
    fullData[index].tableID = item.table_no;
    fullData[index].timestamp = String(item.created_at).substring(0, 25);

    index++;
  }

  const sql6 = "SELECT * FROM users WHERE user_id = ?;";
  const user = jwt.verify(req.cookies.token, SECRET_KEY);
  const [query6] = await pool.promise().query(sql6, [user.user_id]);

  res.status(200).render("chef", {
    data: fullData,
    cRole: query6[0].role,
  });
});

router.patch(
  "/status",
  [
    body("num").notEmpty().isInt({ min: 0, max: 2 }),
    body("orderID").notEmpty().isInt(),
    auth,
    chefAuth,
  ],
  async (req, res) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err });
    }
    const sql = "UPDATE orders SET status = ? WHERE ORDER_ID = ? ;";
    let newS = "";
    if (Number(req.body.num) === 0) {
      newS = status.o;
    } else if (Number(req.body.num) === 1) {
      newS = status.c;
    } else if (Number(req.body.num) === 2) {
      newS = status.c;
    }

    const users = jwt.verify(req.cookies.token, SECRET_KEY);
    const sql5 = "SELECT * FROM users WHERE user_id = ?;";
    const [query5] = await pool.promise().query(sql5, [users.user_id]);
    if (query5[0].role !== role.c) {
      return res.status(401).end();
    }

    const query = await pool.promise().query(sql, [newS, req.body.orderID]);

    res.status(200).end();
  },
);

module.exports = router;
