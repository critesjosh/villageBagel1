function format_cart_contents(product_array) {
  var order_content = ''
  product_array.forEach(function(element) {
    var toPrint = element
    toPrint = toPrint.split('|')
    if (toPrint[3]) {
      toPrint = `${toPrint[1]} ${toPrint[2]} ${toPrint[0]} ${toPrint[3]}`
    } else {
      toPrint = `${toPrint[1]} ${toPrint[2]} ${toPrint[0]}`
    }

    order_content += `\n ${toPrint}`
  })
  return order_content
}

module.exports = format_cart_contents
