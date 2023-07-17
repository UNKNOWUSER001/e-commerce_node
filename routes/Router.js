const express = require('express');
const router = express.Router();
const monk = require('monk');
const db = monk('localhost:27017/e-commerce');

router.get('/', async (req, res) => {
  try {
    const products = await db.get('products').find()
    const categories = await db.get('categories').find();
    res.render('index', { categories,products });
  } catch (err) {
    console.error(err);
  }
});


module.exports = router;



