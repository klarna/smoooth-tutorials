import api from '../services/api'

export default async (req, res) => {
  let checkoutResponse = await api.updateOrCreate(req)

  const reqData = JSON.parse(req.body)
  const orderLinesToCookie = reqData.orderLines
    .filter(orderLine => orderLine.quantity)
    .reduce((acc, orderLine) => {
      acc[orderLine.reference] = orderLine.quantity
      return acc
    }, {})

  res.setHeader('Set-Cookie', [
    `kcoOrderId=${checkoutResponse.data.order_id}; path=/;`,
    `merchantCart=${JSON.stringify(orderLinesToCookie)}; path=/;`,
  ])
  res.statusCode = checkoutResponse.status
  res.json({
    orderId: checkoutResponse.data.order_id,
    snippet: checkoutResponse.data.html_snippet,
  })
}
