import axios from 'axios'
import { getOrderIdFromCookie } from './helpers/cookie'

const checkoutUrl = 'https://api.playground.klarna.com/checkout/v3/orders'
const config = {
  headers: {
    Authorization: `Basic ${Buffer.from(`${process.env.KCO_USERNAME}:${process.env.KCO_PASSWORD}`).toString('base64')}`,
    'Content-Type': 'application/json',
  }
}

const create = async (req) => {
  const reqData = JSON.parse(req.body)
  const orderLines = reqData.orderLines.filter(orderLine => orderLine.quantity) || []
  const orderAmount = orderLines.reduce((acc, orderLine) => (orderLine.unit_price * orderLine.quantity) + acc, 0)
  const orderTaxAmount = orderLines.reduce((acc, orderLine) => (orderLine.total_tax_amount * orderLine.quantity) + acc, 0)

  if (orderLines.length) {
    // TODO: fix this
    orderLines[0].quantity = 5
    orderLines[0].unit_price = 10000
    orderLines[0].tax_rate = 1000
    orderLines[0].total_amount = 50000
    orderLines[0].total_discount_amount = 0
    orderLines[0].total_tax_amount = 4545
  }
  
  const data = {
    'purchase_country': 'SE',
    'purchase_currency': 'SEK',
    'locale': 'en-GB',
    'order_amount': 50000,
    'order_tax_amount': 4545,
    'order_lines': orderLines,
    'merchant_urls': {
      'terms': 'https://www.example.com/terms.html',
      'checkout': 'https://www.example.com/checkout.html?order_id={checkout.order.id}',
      'confirmation': 'https://www.example.com/confirmation.html?order_id={checkout.order.id}',
      'push': 'https://www.example.com/api/push?order_id={checkout.order.id}'
    },
  }

  return axios.post(checkoutUrl, data, config)
}

const update = async (req, orderId) => {
  const reqData = JSON.parse(req.body)
  const orderLines = reqData.orderLines.filter(orderLine => orderLine.quantity) || []
  const orderAmount = orderLines.reduce((acc, orderLine) => (orderLine.unit_price * orderLine.quantity) + acc, 0)
  const orderTaxAmount = orderLines.reduce((acc, orderLine) => (orderLine.total_tax_amount * orderLine.quantity) + acc, 0)

  if (orderLines.length) {
    // TODO: fix this
    orderLines[0].quantity = 5
    orderLines[0].unit_price = 10000
    orderLines[0].tax_rate = 1000
    orderLines[0].total_amount = 50000
    orderLines[0].total_discount_amount = 0
    orderLines[0].total_tax_amount = 4545
  }
  
  const data = {
    'purchase_country': 'SE',
    'purchase_currency': 'SEK',
    'locale': 'en-GB',
    'order_amount': 50000,
    'order_tax_amount': 4545,
    'order_lines': orderLines,
    'merchant_urls': {
      'terms': 'https://www.example.com/terms.html',
      'checkout': 'https://www.example.com/checkout.html?order_id={checkout.order.id}',
      'confirmation': 'https://www.example.com/confirmation.html?order_id={checkout.order.id}',
      'push': 'https://www.example.com/api/push?order_id={checkout.order.id}'
    },
  }

  return axios.post(`${checkoutUrl}/${orderId}`, data, config)
}

export default {
  read: async (req) => {
    const orderId = getOrderIdFromCookie(req.headers.cookie)

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
