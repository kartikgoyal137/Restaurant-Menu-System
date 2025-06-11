const {Router, urlencoded} = require('express');
const router = Router();
const express = require('express');
const pool = require('../db.js');
const jwt = require('jsonwebtoken');
const {auth} = require('./login.js');
router.use(urlencoded({ extended: true })); 

async function fetchFoodData () {
    const sql = 'select * from categories;';
    const [rows,fields] = await pool.promise().query(sql);
    return rows;
}

const SECRET_KEY = 'sds';

router.get('/', auth,  async (req,res) => {
    const data = await fetchFoodData();
    const user = jwt.verify(req.cookies.token, SECRET_KEY);
    const sql = `select * from users where email = ?`;
    const sql2 = `select * from orders`;
    const userData = await pool.promise().query(sql, [user.email]);
    const orderq = await pool.promise().query(sql, [user.email]);
    res.status(200).render('home', {
        categories : data,
        userData : userData[0][0]
        });
}) 

router.get('/foods', auth , async (req,res) => {
    const data = await fetchFoodData();
    const id = parseInt(req.query.category) || 0;
    const item = data.find(item => item.category_id === id);

    let food = {
        name : item.category_name,
        description : item.description,
        image : item.image_url
    }

    const sql1 = `SELECT * from MENU WHERE category_id = ?;`;
    const [rows] = await pool.promise().query(sql1, [id])
    
    food.items = rows;
    res.status(200).json(food);
}) 

module.exports = router;