var unirest = require('unirest');

var access_token = 'sandbox-sq0atb-4Kmp_8uPC4xEDBAkrJY3mQ'

var response = unirest.get('https://connect.squareup.com/v2/locations', headers= {
  'Accept': 'application/json',
  'Authorization': 'Bearer ' + access_token
})

console.log(response.body)
