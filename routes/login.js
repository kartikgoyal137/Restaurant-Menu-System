const { Router, urlencoded } = require("express");
const pool = require("../db.js");
const router = Router();
const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const hashPassword = require("../hash.js");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const tokenVerify = require("../middlewares/auth/token.js");
const loginAuth = require("../middlewares/auth/login.js");
const role = {
  c: "chef",
  a: "administrator",
  u: "customer",
};
const saltRounds = 10;
require("dotenv").config();
const SECRET_KEY = process.env.SECRET_KEY;

router.use(urlencoded({ extended: true }));
router.use(express.static("public"));
router.use(cookieParser());
router.use(express.json());

router.get("/", (req, res) => {
  res.render("login.ejs", {
    error: "",
    type: ""
  });
});

router.post(
  "/signup",
  [
    body("firstName").notEmpty().isAlpha(),
    body("lastName").notEmpty().isAlpha(),
    body("phone").notEmpty().isNumeric().isLength({ max: 10, min: 10 }),
    body("email").notEmpty().isEmail(),
    body("password").notEmpty().isLength({ min: 8 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    let errM = "";
    if (!errors.isEmpty()) {
      errors.errors.forEach((ele) => {
        errM += ` -- [${ele.value}] is invalid value for the field [${ele.path}] -- `;
      });
      return res.status(400).render("login.ejs", {
        error: errM,
        type: "Signup Error",
      });
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
    res.status(200).render("login", {
      error: "",
      type: ""
    });
  },
);

router.post(
  "/auth",
  [
    body("email").notEmpty().isEmail(),
    body("password").notEmpty(),
    loginAuth,
  ],
  async (req, res) => {
    errors = validationResult(req);
    let errM = "";
    if (!errors.isEmpty()) {
      errors.errors.forEach((ele) => {
        errM += `[${ele.value}] is invalid value for the field [${ele.path}]`;
      });
      return res.status(400).render("/login", {
        error: errM,
      });
      return res.status(400).send(`${errM}`);
    }
    const [query] = await pool
      .promise()
      .query("SELECT * FROM users WHERE email = ?", [req.body.email]);
    if (query[0].role === role.a) {
      return res.status(200).redirect("/admin");
    } else if (query[0].role === role.c) {
      return res.status(200).redirect("/chef");
    }

    res.status(200).redirect("/home");
  },
);

module.exports = { loginRouter: router };
