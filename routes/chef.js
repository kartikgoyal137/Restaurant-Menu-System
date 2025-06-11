const {Router, urlencoded} = require('express');
const router = Router();
const express = require('express');
const pool = require('../db.js');
const jwt = require('jsonwebtoken');
const {auth} = require('./login.js');
router.use(urlencoded({ extended: true })); 
const SECRET_KEY = 'sds';
router.use(express.json());


async function chefAuth (req,res,next) {
    const user = jwt.verify(req.cookies.token,SECRET_KEY);
    const sql = 'SELECT * from users where user_id = ?'
    const [query] = await pool.promise().query(sql, [user.user_id]);
    if(query[0].role === 'customer')
    {
        return res.send('invalid credentials');
    }
    next();
}

router.get('/', [auth, chefAuth], async (req,res) => {
    const sql = `select * from orders WHERE status IS NOT NULL`;
    let index = 0
    const fullData = []
    const [orderTable] = await pool.promise().query(sql);
    for (const item of orderTable)
    {   
        if (item.status === 'Completed')
        {
            continue;
        }
        const sql2 = 'SELECT * FROM serve where order_id = ?';
        const [query2] = await pool.promise().query(sql2, [item.order_id]);

        fullData[index] = {};

        let products = [];
        query2.forEach(ele => {
            const txt = `(${ele.product_id}/${ele.quantity})`
            products.push(txt);
        });

        fullData[index].orderID = item.order_id;
        fullData[index].userID = item.user_id;
        fullData[index].status = item.status;
        fullData[index].instructions = item.instructions;
        fullData[index].dish = products.join(' - ');
        fullData[index].tableID = item.table_no;
        fullData[index].timestamp = String(item.created_at).substring(0,25);
        
        

        index++;
    }
    res.status(200).render('chef', {
        data : fullData
        });
})

router.patch('/status', [auth,chefAuth], async (req,res) => {
    const sql = 'UPDATE orders SET status = ? WHERE ORDER_ID = ? ;';
    let newS = "";
    if(Number(req.body.num)===0)
    {
        newS = 'Cooking'
    }
    else if (Number(req.body.num)===1)
    {
        newS = 'Completed'
    }
    else if (Number(req.body.num)===2)
    {
        newS = 'Completed'
    }
    const query = await pool.promise().query(sql, [newS, req.body.orderID]);

    res.end();
})













module.exports = router;