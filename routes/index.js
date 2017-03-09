var express = require('express');
var router = express.Router();

var app = express();
var config = require('.././config.json')[app.get('env')];

var unirest = require('unirest');

const Mailgun = require('mailgun').Mailgun;
const mg = new Mailgun(config.MAILGUN_API_KEY);

var base_url = "https://connect.squareup.com/v2";

// data store for product cost
var product_cost = {"bagel": 250, "6bagels": 1200, "13bagels": 2300, "shmear-small": 500, "shmear-large": 900, "spread-small": 200, "spread-large": 600}

/* GET home page. */
router.get('/square', function(req, res, next) {
	//res.render('index', { title: 'Complete your payment', 'square_application_id': config.squareApplicationId });
});

router.get('/order', function(req, res, next) {
	res.render('order', { title: 'Place an Order', 'square_application_id': config.squareApplicationId });
});

router.post('/charges/charge_card', function(req,res,next){
	var location;
	var order_content = ''
	var amount = 0
	var tax = 0.00;
	const servername = ''
	const options = {}

	var request_params = req.body;

	//shipping information
	var name = request_params.name
	var email = request_params.email
	var phone = request_params.phone
	var street_address = request_params.street_address_1 + " " + request_params.street_address_2
	var city = request_params.city
	var state = request_params.state
	var zip = request_params.zip

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
		var toPrint = element
		toPrint = toPrint.split('|')
		if (toPrint[3]) {
			toPrint = `${toPrint[1]} ${toPrint[2]} ${toPrint[0]} ${toPrint[3]}`
		} else {
			toPrint = `${toPrint[1]} ${toPrint[2]} ${toPrint[0]}`
		}
		console.log(toPrint)
		order_content += `\n ${toPrint}`

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
				mg.sendText(
					'no-reply@appengine-mailgun-demo.com',
					'villagebagel1@gmail.com', //req.body.email
					'New Village Bagel Order',
					`Hi Connie.
					This is a test email.

					Someone just placed an order on the website.
					The order includes ${order_content}.

					Their subtotal is $${amount/100}.

					Here is their address information:
					${name}
					${email}
					${phone}
					${street_address}
					${city}
					${state}
					${zip}`,
					servername,
					options,
					(err) => {
						if (err) {
							next(err);
							return
						}
					}
				)
				res.json({status: 200})
			}
		})

	});
});

module.exports = router;
