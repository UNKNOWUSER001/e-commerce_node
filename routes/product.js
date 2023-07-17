const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const monk = require('monk');
const db = monk('localhost:27017/e-commerce');
const productsCollection = db.get('products');/// ดึงมาลบ stock สินค้า


router.get('/add', async (req, res) => {
  try {
    const categories = await db.get('categories').find();
    res.render('addproduct', { categories });
  } catch (err) {
    console.error(err);
  }
});



//รายละเอียดสินค้า  สำหรับไปดูลายละเอียดสินค้าภายใน
router.get('/detailproduct/:id', async (req, res) => {
  try {
    const categories = await db.get('categories').find({});
    const products = await db.get('products').find(req.params.id);
    res.render('detailproduct', { categories, products });
  } catch (err) {
    console.error(err);
  }
});




/// แสดงเมนูที่แบ่งเป็นหมวดหมู่ category
router.get('/detailproduct', async (req, res) => {
  try {
    const categories = await db.get('categories').find({});
    const products = await db.get('products').find({ category: req.query.category });
    res.render('detailproduct2', { categories, products });
  } catch (err) {
    console.error(err);
  }
});









router.get('/cart', (req, res) => {
  var cart = req.session.cart;
  var displayCart = { items: [], total: 0 };
  var total = 0;

  for (item in cart) {
    displayCart.items.push(cart[item]);
    total += cart[item].qty * cart[item].price;
  }
  displayCart.total = total;
  res.render('cart', { displayCart });
});


///ลบสินค้า
router.post('/cart/delete', async (req, res) => {
  const itemId = req.body.itemId;
  if (req.session.cart[itemId]) {
    delete req.session.cart[itemId];
    res.redirect('/products/cart');
  } else {
    res.status(404).send('ไม่พบสินค้าในตะกร้า');
  }
});


//สร้างตะกร้า
router.post('/cart', async (req, res) => {
  const product_id = req.body.item_id;
  req.session.cart = req.session.cart || {};
  const cart = req.session.cart;
  ///ซื้อสินค้าชิ้นเดิมซ้ำ
  try {
    const product = await productsCollection.findOne({ _id: product_id });
    if (cart[product_id]) {
      cart[product_id].qty++;
      //console.log('ซื้อสินค้าเดิม')
    } else {
       ///ซื้อสินค้าครั้งแรก
      cart[product_id] = {
        item: product._id,
        title: product.name,
        price: product.price,
        qty: 1
      };
      //console.log('ซื้อสินค้าใหม่')
    }
    // ตัดสต็อกสินค้าออก
    await productsCollection.update({ _id: product_id }, { $inc: { stock: -1 } });

    res.redirect('/products/cart');
  } catch (err) {
    console.error(err);
  }
});

router.post('/add', [
  check('name', 'กรุณาใส่ชื่อสินค้า').notEmpty(),
  check('description', 'กรุณาใส่รายละเอียดสินค้า').notEmpty(),
  check('price', 'กรุป้อนราคาสินค้า').notEmpty(),
  check('category', 'กรุณาเลือกหมวดหมู่สินค้า').notEmpty(),
  check('stock', 'กรุณาใส่จำนวนสนค้า').notEmpty(),
  check('img', 'กรุณาใส่รูปภาพ').notEmpty()
], async (req, res) => {
  const result = validationResult(req);
  const errors = result.errors;
  //// เอา category มา
  const categories = await db.get('categories').find();
  const product = db.get('products');
  /////

  if (!result.isEmpty()) {
    res.render('addproduct', { categories, errors });
  } else {
    try {
      await product.insert({
        name: req.body.name,
        description: req.body.description,
        price: parseInt(req.body.price),
        category: req.body.category,
        stock: parseInt(req.body.stock),
        img: req.body.img,
      });
      res.redirect('/');
    } catch (err) {
      console.error(err);
      res.send(err);
    }
  }
});

module.exports = router;
