const express = require("express");
const app = express();
const axios = require("axios");
const pool = require("./db.js");
const cookieParser = require("cookie-parser");

const homeRouter = require("./routes/home.js");
const orderRouter = require("./routes/order.js");
const adminRouter = require("./routes/admin.js");
const chefRouter = require("./routes/chef.js");
const logoutRouter = require("./routes/logout.js");
const { loginRouter } = require("./routes/login.js");

const path = require("path");

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", "./views");

app.get("/", async (req, res) => {
  res.redirect("/home");
});

app.get("/err", async (req, res) => {
  res.status(404).render("error.ejs");
});

app.use("/login", loginRouter);
app.use("/home", homeRouter);
app.use("/order", orderRouter);
app.use("/chef", chefRouter);
app.use("/admin", adminRouter);
app.use("/logout", logoutRouter);

app.get("/users", (req, res) => {
  pool.query("SELECT * FROM users", (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.listen(4000, () => {
  console.log("listening on port 4000");
});
