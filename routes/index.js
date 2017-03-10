var express = require('express');
var router = express.Router();

var app = express();
var config = require('.././config.json')[app.get('env')];

var unirest = require('unirest');

const Mailgun = require('mailgun').Mailgun;
const mg = new Mailgun(config.MAILGUN_API_KEY);

var compute_cost = require('./compute_cost')
var send_emails = require('./send_emails')

var base_url = "https://connect.squareup.com/v2";

router.get('/order', function(req, res, next) {
	res.render('order', { title: 'Place an Order', 'square_application_id': config.squareApplicationId });
});

router.post('/charges/charge_card', function(req,res,next){
	var location;

	var request_params = req.body;

	//compute total to charge here
	var computed_result = compute_cost(request_params)
	var order_content = computed_result.order_content
	var amount = computed_result.amount

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
				send_emails.email_connie(request_params, order_content, amount)
				send_emails.email_customer(request_params, order_content, amount)
				res.json({status: 200})
			}
		})

	});
});

module.exports = router;
