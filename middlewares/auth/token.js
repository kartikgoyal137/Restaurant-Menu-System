const pool = require("../../db.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
SECRET_KEY = process.env.SECRET_KEY;
const { Router, urlencoded } = require("express");

function verifyToken(req, res, next) {
  try {
    const token = req.cookies.token;
    const user = jwt.verify(token, SECRET_KEY);
    next();
  } catch (err) {
    res.clearCookie("token");
    return res.status(401).redirect("/login");
  }
}

module.exports = verifyToken;