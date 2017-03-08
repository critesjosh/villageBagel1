'use strict';

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var unirest = require('unirest');

var config = require('./config.json')
const Mailgun = require('mailgun').Mailgun;
const mg = new Mailgun(config.development.MAILGUN_API_KEY);

var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);


app.use(express.static('public'))

// [START hello_world]
// Say hello!
app.get('/', (req, res) => {
  res.render('index', {
    'square_application_id': config.development.squareApplicationId,
  });
});

app.post('/', function(req, res, next) {
	const servername = ''
	const options = {}

	mg.sendText(
		'no-reply@appengine-mailgun-demo.com',
		'critesjosh@gmail.com', //req.body.email
		'Hello josh!',
		'Mailgun on Google App Engine with Node.js',
		servername,
		options,
		(err) => {
			if (err) {
				next(err);
				return
			}
			res.render('index', {
				sent: true
			});
		}

	)
})

if (module === require.main) {
  // [START server]
  // Start the server
  const server = app.listen(process.env.PORT || 8080, () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
  });
  // [END server]
}

module.exports = app;
