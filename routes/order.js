const {Router, urlencoded} = require('express');
const router = Router();
const express = require('express');
const pool = require('../db.js');
const jwt = require('jsonwebtoken');
const {auth} = require('./login.js');
router.use(urlencoded({ extended: true })); 
router.use(express.json());
const SECRET_KEY = 'sds';

router.get('/', auth, async (req,res) => {
    const user = jwt.verify(req.cookies.token, SECRET_KEY);
    const sql = `select * from users where email = ?`;
    const [userData] = await pool.promise().query(sql, [user.email]);
    
    itemData = [];
    let index = 0
    let price = 0;

    const sql2 = 'SELECT * FROM serve where order_id = ?';
    const [query2] = await pool.promise().query(sql2, [req.cookies.order_id]);


    for (const item of query2) {
        const sql3 = 'SELECT * FROM menu where product_id = ?';
        const [query3] = await pool.promise().query(sql3, [item.product_id]);
        //query3[0] has product_id, price, imageg_url
        const itemPrice = Number(item.quantity) * Number(query3[0].price);
        itemData[index] = {url : query3[0].image_url , unitPrice : query3[0].price, totalPrice : itemPrice, name : query3[0].product_name, quantity : item.quantity}
        price += itemPrice ;
        index++;
    }
    // const sql3 = 'UPDATE payments SET food_total = ? WHERE order_id = ?';
    // const [query3] = await pool.promise().query(sql3, [price, req.cookies.order_id]);

    res.render('order.ejs', {
        userData : userData[0],
        orderID : req.cookies.order_id,
        itemData : itemData,
        price : price
    });
})

router.patch('/update', auth, async (req,res) => {
    const info = req.body;
    const token = req.cookies.token;
    const user = jwt.verify(token, SECRET_KEY);

    if(info.start === 0)
    {
        const sql_1 = 'INSERT INTO orders (user_id, created_at) VALUES (?, NOW()); '
        const query_1 = await pool.promise().query(sql_1, [user.user_id]);

        const sql_3 = 'SELECT * FROM orders where user_id = ?';
        const [query_3] = await pool.promise().query(sql_3, [user.user_id]);
        res.cookie('order_id', query_3.at(-1).order_id);
        res.end();
    }

    if(info.start === 1)
    {
        const sql_2 = `
                 INSERT INTO serve (order_id, product_id, quantity)
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity);
                `;

        const [rows] = await pool.promise().query(sql_2, [req.cookies.order_id, info.product_id, info.num]);
        res.end();
    }
})

router.post('/place', auth, async (req,res) => {
    let price = 0;

    const sql4 = 'SELECT * FROM serve where order_id = ?';
    const [query4] = await pool.promise().query(sql4, [req.cookies.order_id]);


    for (const item of query4) {
        const sql3 = 'SELECT * FROM menu where product_id = ?';
        const [query3] = await pool.promise().query(sql3, [item.product_id]);
        //query3[0] has product_id, price, imageg_url
        const itemPrice = Number(item.quantity) * Number(query3[0].price);
        price += itemPrice ;
    }

    const sql = 'UPDATE orders SET status = ?, instructions = ?, table_no = ? WHERE order_id = ?';
    const query = await pool.promise().query(sql, ['Yet to start', req.body.message, req.body.table, req.cookies.order_id]);

    const user = jwt.verify(req.cookies.token, SECRET_KEY);
    const sql2 = 'INSERT INTO payments (order_id, user_id, created_at, food_total, tip) VALUES (?, ?, NOW(), ?, ?);';
    const query2 = await pool.promise().query(sql2, [req.cookies.order_id, user.user_id, price, req.body.tip]);

    res.redirect('/home');
    res.end();
})







module.exports = router;