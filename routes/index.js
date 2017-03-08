var express = require('express');
var router = express.Router();

var app = express();
var config = require('.././config.json')[app.get('env')];

var unirest = require('unirest');

var base_url = "https://connect.squareup.com/v2";

// data store for product cost
var product_cost = {"bagel": 250, "6bagels": 1200, "13bagels": 2300, "shmear-small": 500, "shmear-large": 900, "spread-small": 200, "spread-large": 600}

/* GET home page. */
router.get('/square', function(req, res, next) {
	//res.render('index', { title: 'Complete your payment', 'square_application_id': config.squareApplicationId });
});

router.get('/order', function(req, res, next) {
	//res.render('order', { titel: 'Place an Order', 'square_application_id': config.squareApplicationId });
});

router.post('/charges/charge_card', function(req,res,next){
	var location;
	var amount = 0
	var tax = 0.00;
	var request_params = req.body;

	//compute total to charge here
	var product_array = request_params.products.split(',')
	//remove last empty element
	x = product_array.pop()

	var bagel_total = 0,
			shmear_sm_total = 0,
			shmear_lg_total = 0,
			spread_lg_total = 0,
			spread_sm_total = 0

	product_array.forEach(function(element) {
		var item = element.split('|')
		if (item[0] === 'bagel') {
			bagel_total += Number(item[1])
		} else if (item[0] === 'shmear') {
			if (item[3] === 'Sm'){
				shmear_sm_total += Number(item[1])
			} else {
				shmear_lg_total += Number(item[1])
			}
		} else if (item[0] === 'spread') {
			if (item[3] === 'Sm'){
				spread_sm_total += Number(item[1])
			} else {
				spread_lg_total += Number(item[1])
			}
		}
		})
		if (bagel_total >= 13) {
			var multiple = Math.floor(bagel_total / 13)
			amount += multiple * 2300
			bagel_total = bagel_total % 13
		}
		if (bagel_total >= 6) {
			var multiple = Math.floor(bagel_total / 6)
			amount += multiple * 1200
			bagel_total = bagel_total % 6
		}

		amount += bagel_total * 250
		amount += shmear_sm_total * 500
		amount += shmear_lg_total * 900
		amount += spread_sm_total * 200
		amount += spread_lg_total * 600
		amount += amount * tax

	console.log('bagels'+ bagel_total, 'spreads' + spread_lg_total + ',' + spread_sm_total, 'shmears' + shmear_lg_total + ','  + shmear_sm_total)

	unirest.get(base_url + '/locations')
	.headers({
		'Authorization': 'Bearer ' + config.squareAccessToken,
		'Accept': 'application/json'
	})
	.end(function (response) {

		for (var i = response.body.locations.length - 1; i >= 0; i--) {
			if(response.body.locations[i].capabilities.indexOf("CREDIT_CARD_PROCESSING")>-1){
				location = response.body.locations[i];
				break;
			}
			if(i==0){
				return res.json({status: 400, errors: [{"detail": "No locations have credit card processing available."}] })
			}
		}


		var token = require('crypto').randomBytes(64).toString('hex');

		//Check if product exists
		/*
		if (!product_cost.hasOwnProperty(request_params.products)) {
			return res.json({status: 400, errors: [{"detail": "Product Unavailable"}] })
		}
		*/

		//Make sure amount is a valid integer

		request_body = {
			card_nonce: request_params.nonce,
			amount_money: {
				amount: amount,
				currency: 'USD'
			},
			idempotency_key: token
		}
		unirest.post(base_url + '/locations/' + location.id + "/transactions")
		.headers({
			'Authorization': 'Bearer ' + config.squareAccessToken,
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		})
		.send(request_body)
		.end(function(response){
			if (response.body.errors){
				res.json({status: 400, errors: response.body.errors})
			}else{
				res.json({status: 200})
			}
		})

	});
});

module.exports = router;