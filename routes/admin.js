const { Router, urlencoded } = require("express");
const router = Router();
const express = require("express");
const pool = require("../db.js");
const jwt = require("jsonwebtoken");
const { auth } = require("./login.js");
const { body, validationResult } = require("express-validator");

router.use(urlencoded({ extended: true }));

require("dotenv").config();
const SECRET_KEY = process.env.SECRET_KEY;
router.use(express.json());

async function adminAuth(req, res, next) {
  const user = jwt.verify(req.cookies.token, SECRET_KEY);
  const sql = "SELECT * from users where user_id = ?";
  const [query] = await pool.promise().query(sql, [user.user_id]);
  if (query.length > 0) {
    if (query[0].role !== "administrator") {
      return res.status(403).send("invalid credentials");
    }
  }

  next();
}

router.get("/", [auth, adminAuth], async (req, res) => {
  const sql = `select * from orders WHERE status IS NOT NULL`;
  let index = 0;
  const fullData = [];
  const [orderTable] = await pool.promise().query(sql);
  for (const item of orderTable) {
    const sql2 = "SELECT * FROM serve where order_id = ?";
    const [query2] = await pool.promise().query(sql2, [item.order_id]);
    fullData[index] = {};
    const sql3 = "SELECT * FROM payments where order_id = ?";
    const [query3] = await pool.promise().query(sql3, [item.order_id]);

    let products = [];
    query2.forEach((ele) => {
      const txt = `(${ele.product_id}/${ele.quantity})`;
      products.push(txt);
    });
    if (query3.length > 0) {
      fullData[index].paymentID = query3[0].transaction_id;
      fullData[index].price = query3[0].food_total;
      fullData[index].tip = query3[0].tip;
      fullData[index].bill = query3[0].tip + query3[0].food_total;
      fullData[index].timestamp = String(query3[0].created_at).substring(0, 25);
      fullData[index].status = query3[0].status;
    } else {
      fullData[index].paymentID = "N/A";
      fullData[index].price = 0;
      fullData[index].tip = 0;
      fullData[index].bill = 0;
      fullData[index].timestamp = "N/A";
      fullData[index].status = "Pending";
    }

    fullData[index].orderID = item.order_id;
    fullData[index].userID = item.user_id;
    fullData[index].instructions = item.instructions;
    fullData[index].dish = products.join(" - ");
    fullData[index].tableID = item.table_no;

    index++;
  }

  const sql4 = "SELECT * FROM users;";
  const [query4] = await pool.promise().query(sql4);
  let userData = [];
  if (query4.length > 0) {
    userData = query4;
  }

  res.status(200).render("admin", {
    data: fullData,
    users: userData,
  });
});

router.patch(
  "/status",
  [
    body("num").notEmpty().isInt({ min: 0, max: 2 }),
    body("paymentID").notEmpty().isInt(),
    auth,
    adminAuth,
  ],
  async (req, res) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err });
    }
    const sql = "UPDATE payments SET status = ? WHERE transaction_id = ? ;";
    let newS = "";
    if (Number(req.body.num) === 0) {
      newS = "Completed";
    } else {
      newS = "Pending";
    }
    const query = await pool
      .promise()
      .query(sql, [newS, Number(req.body.paymentID)]);

    res.status(200).end();
  },
);

router.patch(
  "/role",
  [
    body("num").notEmpty().isInt({ min: 0, max: 2 }),
    body("userID").notEmpty().isInt(),
    auth,
    adminAuth,
  ],
  async (req, res) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err });
    }
    const sql = "UPDATE users SET role = ? WHERE user_id = ? ;";
    let newS = "";
    if (Number(req.body.num) === 0) {
      newS = "chef";
    } else if (Number(req.body.num) === 1) {
      newS = "administrator";
    } else {
      newS = "customer";
    }
    if (req.body.userID === 10018) {
      return res.status(401).send(`<h2>can't remove ROOT ADMIN </h2>`);
    }
    const query = await pool
      .promise()
      .query(sql, [newS, Number(req.body.userID)]);

    res.status(200).end();
  },
);

module.exports = router;
