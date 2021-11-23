let exphbs = require('express-handlebars');
let bodyParser = require('body-parser');
let avos = require("./avo-shopper");
const express = require('express');
const app = express();
const PORT =  process.env.PORT || 3019;


const connectionString = process.env.DATABASE_URL || 'postgresql://codex:pg123@localhost:5432/avo_shopper';

const { Pool } = require('pg');

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

let avo = avos(pool);

app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// enable the static folder...
app.use(express.static('public'));

app.get('/', function(req, res) {
	res.render('index', {
	});
});

app.get('/shops', async function(req, res) {
	res.render('shoplist', {
		shops: await avo.listShops(),
	});
});

app.get('/shops/:specificShop', async function(req, res) {
	res.render('specificShop', {
		shop: req.params.specificShop,
		jj: await avo.dealsForShop()
	});
});

app.get('/addShops', async function(req, res) {
	res.render('addShop', {
	}); 
});

app.post('/addShops', async function(req, res) {
	console.log(req.body)

	await avo.createShop(req.body.shop)

 	res.redirect('/shops')
});

app.get('/deals', async function(req, res) {
	res.render('createdeal', {
		 shop: await avo.listShops(),
	});
});

app.post('/deals', async function(req, res) {
	console.log(req.body)

	const shopId = req.body.shop_id;
	const quantity = req.body.qty;
	const amount = req.body.price;

	await avo.createDeal(shopId,quantity,amount)
	
	res.render('createdeal', {
		 shop: await avo.listShops(),
	});

	res.redirect('/topDeals')
}); 

app.get('/topDeals', async function(req, res) {
	
	res.render('topDeals', {
		 deals: await avo.topFiveDeals()
	});
}); 

app.post('/topDeals', async function(req, res) {
	const amount = req.body.price;
	console.log(amount) 
	
	res.render('topDeals', {
		deals: await avo.topFiveDeals(),
		recommendDeals: await avo.recommendDeals(amount)
	});
});

// start  the server and start listening for HTTP request on the PORT number specified...
app.listen(PORT, function() {
	console.log(`AvoApp started on port ${PORT}`)
});