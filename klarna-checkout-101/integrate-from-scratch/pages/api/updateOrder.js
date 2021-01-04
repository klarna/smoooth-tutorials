import api from '../services/api'
import { getOrderIdFromCookie } from '../helpers/cookie'

export default async (req, res) => {
  const orderId = getOrderIdFromCookie(req.headers.cookie)
  const reqData = JSON.parse(req.body)
  let checkoutResponse = await api.updateOrCreate(orderId, reqData.orderLines)

  const orderLinesToCookie = reqData.orderLines
    .filter(orderLine => orderLine.quantity)
    .reduce((acc, orderLine) => {
      acc[orderLine.reference] = orderLine.quantity
      return acc
    }, {})
  let response = {}
  
  
  if (Object.keys(orderLinesToCookie).length){
      response = {
      orderId: checkoutResponse.data.order_id,
      snippet: checkoutResponse.data.html_snippet,
    }
  }  

  res.setHeader('Set-Cookie', [
    `kcoOrderId=${checkoutResponse.data.order_id}; path=/;`,
    `merchantCart=${JSON.stringify(orderLinesToCookie)}; path=/;`,
  ])
  res.statusCode = checkoutResponse.status
  res.json(response)
}
