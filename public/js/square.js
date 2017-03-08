console.log(cart)
var cardNonce;
var paymentForm = new SqPaymentForm({
applicationId: {{square_application_id}},
inputClass: 'sq-input',
inputStyles: [
{
fontSize: '14px',
padding: '7px 12px',
backgroundColor: "transparent"
}
],
cardNumber: {
elementId: 'sq-card-number',
placeholder: '0000 0000 0000 0000'
},
cvv: {
elementId: 'sq-cvv',
placeholder: 'CVV'
},
expirationDate: {
elementId: 'sq-expiration-date',
placeholder: 'MM/YY'
},
postalCode: {
elementId: 'sq-postal-code',
placeholder: '94110'
},
callbacks: {
cardNonceResponseReceived: function(errors, nonce, cardData) {
if (errors){
var error_html = ""
for (var i =0; i < errors.length; i++){
error_html += "<li> " + errors[i].message + " </li>";
}
document.getElementById("card-errors").innerHTML = error_html;
document.getElementById('submit').disabled = false;
}else{
document.getElementById("card-errors").innerHTML = "";
chargeCardWithNonce(nonce);
}
},
unsupportedBrowserDetected: function() {
// Alert the buyer
alert('unsupported Browser Detected')
}
}
});
// build payment form after DOM load
document.addEventListener('page:change', function(){
console.log('dom loaded')
paymentForm.build()
});
var paymentFormSubmit = function(){
event.preventDefault()
console.log('submit clicked');
document.getElementById('submit').disabled = true;
paymentForm.requestCardNonce();
return false;
}
var chargeCardWithNonce = function(nonce) {
  var productsString = '';
  cart.forEach(function(element){
    productsString = productsString + element.string + ','
  })
var products = cart;
var name =  "null" || document.getElementById('name').value;
var email = document.getElementById('email').value || "null";
var street_address_1 = "null" || document.getElementById('street_address_1').value;
var street_address_2 = "null" || document.getElementById('street_address_2').value;
var city = "null" || document.getElementById('city').value;
var state = "null" || document.getElementById('state').value;
var zip = "null" || document.getElementById('zip').value;
var http = new XMLHttpRequest();
var url = "/charges/charge_card";
var params = "products=" + productsString
+"&name=" + name
+"&email=" + email
+ "&nonce=" + nonce
+ "&street_address_1=" + street_address_1
+ "&street_address_2=" + street_address_2
+ "&city=" + city
+ "&state=" + state
+ "&zip=" + zip;
http.open("POST", url, true);
//Send the proper header information along with the request
http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
http.setRequestHeader("X-CSRF-Token", "<%= form_authenticity_token %>");
http.onreadystatechange = function() {//Call a function when the state changes.
if(http.readyState == 4 && http.status == 200) {
var data = JSON.parse(http.responseText)
if (data.status == 200) {
document.getElementById("successNotification").style.display = "block";
document.getElementById("payment-form").style.display = "none";
window.scrollTo(0, 0);
}else if (data.status == 400){
var error_html = ""
for (var i =0; i < data.errors.length; i++){
error_html += "<li> " + data.errors[i].detail + " </li>";
}
document.getElementById("card-errors").innerHTML = error_html;
document.getElementById('submit').disabled = false;
}
}
}
http.send(params);
}
