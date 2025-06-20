const pool = require("../../db.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
SECRET_KEY = process.env.SECRET_KEY;
const { Router, urlencoded } = require("express");

async function adminAuth(req, res, next) {
  const user = jwt.verify(req.cookies.token, SECRET_KEY);
  const sql = "SELECT * from users where user_id = ?";
  const [query] = await pool.promise().query(sql, [user.user_id]);
  if (query.length > 0) {
    if (query[0].role !== "administrator") {
      return res.status(403).redirect("/err");
    }
  }

  next();
}

module.exports = adminAuth;