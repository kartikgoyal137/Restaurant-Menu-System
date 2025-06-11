const fs = require('fs');
const path = require('path');
const pool = require('./db.js');

const filePath = path.join(__dirname, './mealData/meals_full.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

data.meals.forEach(food => {
    const sql = 'UPDATE menu SET ingredientList = ? WHERE product_id = ?;';
    ingTxt = `${food.strIngredient1},${food.strIngredient2},${food.strIngredient3},${food.strIngredient4},${food.strIngredient5},${food.strIngredient6}`;
    if(food.strCategory === "Side" )
    {
    pool.promise().query(sql, [ingTxt, food.idMeal]);
    }
    
});