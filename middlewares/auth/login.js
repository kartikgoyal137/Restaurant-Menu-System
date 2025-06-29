const pool = require("../../db.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
SECRET_KEY = process.env.SECRET_KEY;
const { Router, urlencoded } = require("express");

async function loginAuth(req, res, next) {
  const { email, password } = req.body;
  const sql = `select * from users where email = ?`;
  const [rows] = await pool.promise().query(sql, [email]);
  if (rows.length === 0) {
    return res.status(401).render("login.ejs", {
      error: "Wrong credentials",
      type: ""
    });
  }
  const truePass = rows[0].password_hash;
  if (!bcrypt.compareSync(password, truePass)) {
    return res.status(401).render("login.ejs", {
      error: "Wrong credentials",
      type: ""
    });
  }
  const user = { email: rows[0].email, user_id: rows[0].user_id };

  const token = jwt.sign(user, SECRET_KEY, { expiresIn: "1h" });
  res.cookie("token", token, { httpOnly: true });
  next();
}

module.exports = loginAuth;
