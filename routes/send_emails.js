var express = require('express');
var app = express();

var config = require('.././config.json')[app.get('env')];
const Mailgun = require('mailgun').Mailgun;
const mg = new Mailgun(config.MAILGUN_API_KEY);

module.exports = {
  email_connie: function (request_params, order_content, amount) {
    const servername = ''
    const options = {}
    var name = request_params.name
    var email = request_params.email
    var phone = request_params.phone
    var street_address = request_params.street_address_1 + " " + request_params.street_address_2
    var city = request_params.city
    var state = request_params.state
    var zip = request_params.zip
    var delivery = request_params.delivery

    var formatted_text_connie =
   `Hi Connie.
    This is a test email.
    ${name} just placed an order on the website. The order includes:
    ${order_content}

    Their subtotal is $${amount/100}.

    Delivery? ${delivery}

    Here is their contact and address information (if provided):
    ${name}
    ${email}
    ${phone}
    ${street_address}
    ${city}
    ${state}
    ${zip}`

    mg.sendText(
      'no-reply@appengine-mailgun-demo.com',
      'villagebagel1@gmail.com', //req.body.email
      'New Village Bagel Order',
      formatted_text_connie,
      servername,
      options,
      (err) => {
        if (err) {
          next(err);
          return
        }
      }
    )
  },

  email_customer: function(request_params, order_content, amount) {
    const servername = ''
    const options = {}
    var name = request_params.name
    var email = request_params.email
    var phone = request_params.phone
    var street_address = request_params.street_address_1 + " " + request_params.street_address_2
    var city = request_params.city
    var state = request_params.state
    var zip = request_params.zip
    var delivery = request_params.delivery

    var formatted_text_customer =
    `Hi ${name}.
    This is a test email.
    Thank you for placing and order with Village Bagel. Your order includes:
    ${order_content}

    Your subtotal is $${amount/100}.

    Delivery? ${delivery}

    Here is the contact and address information you provided:
    ${name}
    ${email}
    ${phone}
    ${street_address}
    ${city}
    ${state}
    ${zip}

    If you did not place this order, or there is a mistake, please call Connie at (914) 886-8851.

    Thanks!
    Village Bagel`

    mg.sendText(
      'no-reply@appengine-mailgun-demo.com',
      email, //req.body.email
      'Village Bagel Order Confirmation',
      formatted_text_customer,
      servername,
      options,
      (err) => {
        if (err) {
          next(err);
          return
        }
      })
  }
}
