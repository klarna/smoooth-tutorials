import axios from 'axios'
import { getOrderIdFromCookie } from '../helpers/cookie'

const checkoutUrl = 'https://api.playground.klarna.com/checkout/v3/orders'
const config = {
  headers: {
    Authorization: `Basic ${Buffer.from(`${process.env.KCO_USERNAME}:${process.env.KCO_PASSWORD}`).toString('base64')}`,
    'Content-Type': 'application/json',
  }
}

const defaultData = {
  'purchase_country': 'SE',
  'purchase_currency': 'SEK',
  'locale': 'en-GB',
  'merchant_urls': {
    'terms': 'http://localhost:3000/terms',
    'checkout': 'http://localhost:3000?order_id={checkout.order.id}',
    'confirmation': 'http://localhost:3000/confirmation?order_id={checkout.order.id}',
    'push': 'http://localhost:3000/api/push?order_id={checkout.order.id}'
  },
}

const calculateOrderLinesValues = (orderLines) => {
  let amount = 0, taxAmount = 0
  const currentOrderLines = orderLines.filter(orderLine => orderLine.quantity)

  currentOrderLines.forEach(orderLine => {
    orderLine['total_amount'] = orderLine.quantity * orderLine.unit_price
    orderLine['total_tax_amount'] = orderLine['total_amount'] - orderLine['total_amount'] * 10000 / (10000 + orderLine.tax_rate)
    orderLine['total_discount_amount'] = 0

    amount += orderLine['total_amount']
    taxAmount += orderLine['total_tax_amount']
  })
  
  return {
    amount,
    taxAmount,
    orderLines: currentOrderLines,
  }
}

const create = async (req) => {
  const reqData = JSON.parse(req.body)
  const { amount, taxAmount, orderLines } = calculateOrderLinesValues(reqData.orderLines)
  
  const data = {
    ...defaultData,
    'order_amount': amount,
    'order_tax_amount': taxAmount,
    'order_lines': orderLines,
  }

  return axios.post(checkoutUrl, data, config)
}

const update = async (req, orderId) => {
  const reqData = JSON.parse(req.body)
  const { amount, taxAmount, orderLines } = calculateOrderLinesValues(reqData.orderLines)
  
  const data = {
    ...defaultData,
    'order_amount': amount,
    'order_tax_amount': taxAmount,
    'order_lines': orderLines,
  }

  return axios.post(`${checkoutUrl}/${orderId}`, data, config)
}

export default {
  read: async (orderId) => {
    if (!orderId) {
      return undefined
    }

    let response

    try {
      response = await axios.get(`${checkoutUrl}/${orderId}`, config)
    } catch (e) { }

    return response
  },
  updateOrCreate: async (req) => {
    const orderId = getOrderIdFromCookie(req.headers.cookie)
    let response

    if (orderId) {
      try {
        response = await update(req, orderId)
      } catch (e) {
        response = await create(req)
      }
    } else {
      response = await create(req)
    }

    return response
  },
}
