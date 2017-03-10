var format_cart_contents = require('./format_cart_contents')

function compute_cost(request_params) {
  var delivery = request_params.delivery

  var result = {}
  var tax = 0.08;
  var amount = 0
  var product_array = request_params.products.split(',')
  //remove last empty element
  x = product_array.pop()

  result.order_content = format_cart_contents(product_array)

  var bagel_total = 0,
    shmear_sm_total = 0,
    shmear_lg_total = 0,
    spread_lg_total = 0,
    spread_sm_total = 0

  product_array.forEach(function(element) {
  /*var toPrint = element
  toPrint = toPrint.split('|')
  if (toPrint[3]) {
    toPrint = `${toPrint[1]} ${toPrint[2]} ${toPrint[0]} ${toPrint[3]}`
  } else {
    toPrint = `${toPrint[1]} ${toPrint[2]} ${toPrint[0]}`
  }
  console.log(toPrint)
  order_content += `\n ${toPrint}`
  */

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
  if (delivery === 'yes'){
    amount += 600
  }
  amount += amount * tax

  result.amount = Number(amount)

  return result
}


  module.exports = compute_cost;
