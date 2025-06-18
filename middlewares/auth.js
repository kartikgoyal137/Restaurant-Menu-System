async function authenticate1(req, res, next) {
  const { email, password } = req.body;
  const sql = `select * from users where email = ?`;
  const [rows] = await pool.promise().query(sql, [email]);
  if (rows.length === 0) {
    return res.status(401).render("login.ejs", {
      error: "Wrong credentials",
    });
  }
  const truePass = rows[0].password_hash;
  if (!bcrypt.compareSync(password, truePass)) {
    return res.status(401).render("login.ejs", {
      error: "Wrong credentials",
    });
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

async function chefAuth(req, res, next) {
  const user = jwt.verify(req.cookies.token, SECRET_KEY);
  const sql = "SELECT * from users where user_id = ?";
  const [query] = await pool.promise().query(sql, [user.user_id]);
  if (query.length > 0) {
    if (query[0].role === "customer") {
      return res.status(403).send("invalid credentials");
    }
  }

  next();
}

module.exports = { authenticate1, auth: authenticate2, chefAuth, adminAuth };
