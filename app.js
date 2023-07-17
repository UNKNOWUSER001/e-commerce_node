const express = require('express');
const path = require('path');
const app = express();
const router = require('./routes/Router');
const category = require('./routes/categories')
const product = require('./routes/product')
const monk = require('monk');
const session = require('express-session')
const stripe = require('stripe')('sk_test_51NFK05JqBizbNzBL79BKUfpcDzpDTk9AVzH4HxiU7EejwqntyHGdmTxIt1gUpiHsI1FCg4LZjGE0TFYYXhehR2re00S8py6JkT')
const cookieParser = require('cookie-parser');


const db = monk('localhost:27017/e-commerce');

db.then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(cookieParser());
app.use(session({secret: 'my session',resave: false,saveUninitialized: true}))
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname,'public')))

///จำกัดข้อความในการแสดงผล
app.locals.descriptionText = function(text,length){
  return text.substring(0,length)
}

////ใส่ , ในตัวเลข
app.locals.formatMoney = function(number) {
  return number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

//ชำระเงิน
app.post('/payment', async (req, res) => {
  try {
    const token = req.body.stripeToken;
    const amount = req.body.amount;
    const charge = await stripe.charges.create({
      amount: amount,
      currency: "thb",
      source: token
    });

    req.session.destroy();
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while processing the payment.");
  }
});


app.use('/',router);
app.use('/categories',category)
app.use('/products',product)

app.listen(8000, () => {
  console.log('Server started ');
});


