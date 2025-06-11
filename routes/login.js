const {Router, urlencoded} = require('express');
const pool = require('../db.js');
const router = Router();
const express = require('express');
const jwt = require('jsonwebtoken');
const parserC = require('cookie-parser');
const hashPassword = require('../hash.js');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const SECRET_KEY = 'sds';

router.use(urlencoded({ extended: true }));
router.use(express.static('public'));
router.use(parserC());

router.get('/', async (req,res) => {
    res.render('login');
}) 

async function authenticate1 (req,res,next)
{
  const { email , password } = req.body;
  const sql = `select * from users where email = ?`;
  const [rows] = await pool.promise().query(sql, [email])
  if(rows.length === 0) {return res.send('invalid user');}
  const truePass = rows[0].password_hash;
  if (!bcrypt.compareSync(password, truePass)) {
  return res.send('invalid password');
  }
  const user = {email : rows[0].email, user_id : rows[0].user_id};
  
  const token = jwt.sign(user, SECRET_KEY, {expiresIn : "1h"});
  res.cookie ('token', token , {httpOnly: true});
  next();
}

function authenticate2 (req,res,next)
{
  try {
    const token = req.cookies.token;
    const user = jwt.verify(token, SECRET_KEY);
    next();
  }
  catch (err) {
    res.clearCookie('token');
    return res.redirect('/');
  }
}

router.post('/signup', async (req, res) => {
  const ud = req.body;
  const sql = 'INSERT INTO users (first_name, last_name, contact, email, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)';

  await pool.promise().query(sql, [ud.firstName, ud.lastName, ud.phone, ud.email, hashPassword(ud.password), ud.role]);
  res.render('login');
});

router.post('/auth', authenticate1, (req,res) => {
  res.redirect('/home');
})

module.exports = {loginRouter : router, auth : authenticate2};