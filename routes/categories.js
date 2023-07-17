const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const monk = require('monk');
const db = monk('localhost:27017/e-commerce');

router.get('/add', async (req, res) => {
  try {
    const categories = await db.get('categories').find();
    res.render('addcategory', { categories });
  } catch (err) {
    console.error(err);
  }
});







router.post('/add', [
  check('name', 'Please enter category name').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const categories = await db.get('categories').find();
    res.render('addcategory', { categories, errors: errors.array() });
  } else {
    try {
      await db.get('categories').insert({ name: req.body.name });
      res.redirect('/');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error adding category');
    }
  }
});

router.post('/delete/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    await db.get('categories').remove({ _id: categoryId });
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting category');
  }
});


module.exports = router;
