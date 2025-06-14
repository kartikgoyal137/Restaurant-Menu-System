const { Router, urlencoded } = require("express");
const pool = require("../db.js");
const router = Router();
const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const hashPassword = require("../hash.js");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");

const saltRounds = 10;
require("dotenv").config();
const SECRET_KEY = process.env.SECRET_KEY;

router.use(urlencoded({ extended: true }));
router.use(express.static("public"));
router.use(cookieParser());
router.use(express.json());

async function authenticate1(req, res, next) {
  const { email, password } = req.body;
  const sql = `select * from users where email = ?`;
  const [rows] = await pool.promise().query(sql, [email]);
  if (rows.length === 0) {
    return res.status(401).send("invalid user");
  }
  const truePass = rows[0].password_hash;
  if (!bcrypt.compareSync(password, truePass)) {
    return res.status(401).send("invalid password");
  }
  const user = { email: rows[0].email, user_id: rows[0].user_id };

  const token = jwt.sign(user, SECRET_KEY, { expiresIn: "1h" });
  res.cookie("token", token, { httpOnly: true });
  next();
}

function authenticate2(req, res, next) {
  try {
    const token = req.cookies.token;
    const user = jwt.verify(token, SECRET_KEY);
    next();
  } catch (err) {
    res.clearCookie("token");
    return res.status(401).redirect("/login");
  }
}

router.get("/", (req, res) => {
  res.render("login.ejs");
});

router.post(
  "/signup",
  [
    body("firstName").notEmpty().isAlpha(),
    body("lastName").notEmpty().isAlpha(),
    body("phone").notEmpty().isNumeric(),
    body("email").notEmpty().isEmail(),
    body("password").notEmpty().isLength({ min: 8 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    let errM = "";
    if (!errors.isEmpty()) {
      errors.errors.forEach((ele) => {
        errM += `<h4> [${ele.value}] is invalid value for the field [${ele.path}] </h4>`;
      });
      return res.status(400).send(`${errM}`);
    }

    const ud = req.body;
    const sql =
      "INSERT INTO users (first_name, last_name, contact, email, password_hash) VALUES (?, ?, ?, ?, ?)";

    await pool
      .promise()
      .query(sql, [
        ud.firstName,
        ud.lastName,
        ud.phone,
        ud.email,
        hashPassword(ud.password),
      ]);
    res.status(200).render("login");
  },
);

router.post(
  "/auth",
  [
    body("email").notEmpty().isEmail(),
    body("password").notEmpty(),
    authenticate1,
  ],
  async (req, res) => {
    const errors = validationResult(req);
    let errM = "";
    if (!errors.isEmpty()) {
      errors.errors.forEach((ele) => {
        errM += `<h4> [${ele.value}] is invalid value for the field [${ele.path}] </h4>`;
      });
      return res.status(400).send(`${errM}`);
    }
    const [query] = await pool
      .promise()
      .query("SELECT * FROM users WHERE email = ?", [req.body.email]);
    if (query[0].role === "administrator") {
      return res.status(200).redirect("/admin");
    } else if (query[0].role === "chef") {
      return res.status(200).redirect("/chef");
    }

    res.status(200).redirect("/home");
  },
);

module.exports = { loginRouter: router, auth: authenticate2 };
