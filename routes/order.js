const {Router, urlencoded} = require('express');
const router = Router();
const express = require('express');
const pool = require('../db.js');
const jwt = require('jsonwebtoken');
const {auth} = require('./login.js');
router.use(urlencoded({ extended: true })); 
const {body, validationResult} = require('express-validator');
router.use(express.json());

require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;

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

    res.status(200).render('order.ejs', {
        userData : userData[0],
        orderID : req.cookies.order_id,
        itemData : itemData,
        price : price
    });
})

router.patch('/update', [
                        body('start').notEmpty().isInt({min: -1, max: +1}),
                        body('num').notEmpty().isInt({min: -1, max: +1}),
                        body('product_id').notEmpty().isInt({min: 51000, max: 54000}),
    auth], async (req,res) => {

    const Allerr = validationResult(req).array();
    const startErr = Allerr.find(ele => ele.path === 'start');
    const numErr = Allerr.find(ele => ele.path === 'num');
    const productErr = Allerr.find(ele => ele.path === 'product_id');
    
    if(startErr)
    {
        return res.status(400).json({ startError : startErr})
    }

    
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
        res.status(201).end();
    }

    if(info.start === 1)
    {

    if(productErr)
    {
        return res.status(400).json({ productError : productErr || 0})
    }
    if(numErr)
    {
        return res.status(400).json({ numError : numErr || 0})
    }

        const sql_2 = `
                 INSERT INTO serve (order_id, product_id, quantity)
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE quantity = IF(quantity + VALUES(quantity) >= 0, quantity + VALUES(quantity), quantity);
                `;
        const [rows] = await pool.promise().query(sql_2, [req.cookies.order_id, info.product_id, info.num]);

        const sql_3 = `DELETE FROM serve WHERE quantity <= 0`;
        const query_3 = await pool.promise().query(sql_3);
        res.status(200).end();
    }
})

router.post('/place', [
                        body('table').notEmpty().isInt(),
                        body('tip').notEmpty().isInt(),
    auth], async (req,res) => {

    const err = validationResult(req);
    let errM = "";
    if(!errors.isEmpty())
    {    
        errors.errors.forEach(ele => {
        errM += `<h4> [${ele.value}] is invalid value for the field [${ele.path}] </h4>`;
        });
        return res.status(400).send(`${errM}`);
    }
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

    //cleanup
    const sql3 = 'DELETE FROM payments p WHERE NOT EXISTS (SELECT 1 FROM serve s WHERE s.order_id = p.order_id);';
    const query3 = await pool.promise().query(sql3);
    const sql5 = 'DELETE FROM orders o WHERE NOT EXISTS (SELECT 1 FROM serve s WHERE s.order_id = o.order_id);';
    const query5 = await pool.promise().query(sql5);


    res.status(201).redirect('/home');
    res.end();
})







module.exports = router;