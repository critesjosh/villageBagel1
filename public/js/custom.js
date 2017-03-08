var cart = [];
var count = 0;

$(document).ready(

)

function addBagelsToCart () {
  event.preventDefault()
  var bagel = $('#bagel-type').val()
  var number = $('#bagel-number').val()
  bagel = bagel.replace('_', ' ')


  //if there is no number defined, make it 1
  if(!number) {
    number = 1
  }
  //create a string to pass to the server as product list
  var string = `bagel|${number}|${bagel}`

  if(number > 1) {
    cart.push({item: 'Bagels', number: number, type:bagel, id: count, size: '', string: string})
  } else if (number = 1){
    cart.push({item: 'Bagel', number: number, type:bagel, id: count, size: '',string: string})
  }
  count++
  updateCart()

  console.log(cart)
}

function addShmearsToCart () {
  event.preventDefault()
  var shmear = $('#shmear-type').val()
  var number = $('#shmear-number').val()
  size = $('#shmear-size').val()

  size = size.replace(/_/, ' ')
  shmear = shmear.replace(/_/g, ' ')

  var stringSize;
  if (size === "Half Pound") {
    stringSize = "Sm"
  } else if (size === "One Pound") {
    stringSize = "Lg"
  }
  if(!number) {
    number = 1
  }
  var string = `shmear|${number}|${shmear}|${stringSize}`

  if (number > 1) {
    cart.push({type: shmear, number: number, item: 'Shmears', size: size, id: count, string: string})
  } else if (number = 1){
    cart.push({type: shmear, number: number, item: 'Shmear', size: size, id: count, string: string})
  }
  count++
  updateCart()
}

function addSpreadsToCart () {
  event.preventDefault()
  var spread = $('#spread-type').val()
  var number = $('#spread-number').val()
  var size = $('#spread-size').val()

  if (spread === 'almond_butter') {
    spread = 'Almond Butter'
  }
  size = size.replace(/_/, " ")

  var stringSize;
  if (size === "Single") {
    stringSize = "Sm"
  } else if (size === "Half Pound") {
    stringSize = "Lg"
  }
  if(!number) {
    number = 1
  }

  var string = `spread|${number}|${spread}|${stringSize}`

  if (number > 1) {
    cart.push({type: spread, number: number, item:'Spreads', size: size, id: count, string: string})
  } else if (number = 1) {
    cart.push({type: spread, number: number, item:'Spread', size: size, id: count, string: string})
  }
  count++
  updateCart()

}

function updateCart () {
  var subtotal = 0
  var bagels = 0
  var shmearsHalf = 0
  var shmearsWhole = 0
  var spreadsSingle = 0
  var spreadsHalf = 0

  $('#cart').empty()
  cart.forEach(function(element, index, array){
    $('#cart').append(`<div class="cart-item">
      ${element.number} ${element.item}: ${element.type} ${element.size}
      <span style="float:right;" class="glyphicon glyphicon-remove" aria-hidden="true" onclick="deleteFromCart(${element.id})"></span>
      <hr/>
    </div>`)
  })

  cart.forEach(function(element, index){
    if(element.item === 'Bagel' || element.item === 'Bagels'){
      bagels = bagels + Number(element.number)
    }
    if(element.item === 'Shmear' || element.item === 'Shmears'){
      if(element.size === 'Half Pound') {
        shmearsHalf = shmearsHalf +  Number(element.number)
      }
      if(element.size === 'One Pound') {
        shmearsWhole = shmearsWhole +  Number(element.number)
      }
    }
    if(element.item === 'Spread' || element.item === 'Spreads'){
      if(element.size === 'Single') {
        spreadsSingle = spreadsSingle +  Number(element.number)
      }
      if(element.size === 'Half Pound') {
        spreadsHalf = spreadsHalf +  Number(element.number)
      }
    }
  })
  
  if (bagels >= 13) {
    var multiple = Math.floor(bagels / 13)
    subtotal += multiple * 23
    bagels = bagels % 13
  }
  if (bagels >= 6) {
    var multiple = Math.floor(bagels / 6)
    subtotal += multiple * 12
    bagels = bagels % 6
  }

  subtotal = subtotal + bagels * 2.5
  subtotal = subtotal + shmearsHalf * 5
  subtotal = subtotal + shmearsWhole * 9
  subtotal = subtotal + spreadsSingle * 2
  subtotal = subtotal + spreadsHalf * 6

  $('#subtotal').html(`$${subtotal}`)
}

function deleteFromCart(id) {
  cart.forEach(function(element, index){
    if (element.id === id){
      cart.splice(index, 1)
    }
  })
  updateCart()
}

function checkout () {

}

function workBagels(bagels) {
  if (bagels >= 13) {
    bagels = bagels - 13
  } else if (bagels >= 6){
    bagels = bagels - 6
  } else {
    return bagels
  }
  workBagels(bagels)
}

function workSubtotal(subtotal, bagels) {
  if (bagels >= 13) {
    subtotal = subtotal + 23
    bagels = bagels - 13
  } else if (bagels >= 6){
    subtotal = subtotal + 12
    bagels = bagels - 6
  } else {
    return subtotal
  }
  workBagels(subtotal, bagels)
}
