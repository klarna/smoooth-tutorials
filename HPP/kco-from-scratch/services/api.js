import axios from 'axios'

const kcoUrl = 'https://api.playground.klarna.com/checkout/v3/orders'
const hppUrl = 'https://api.playground.klarna.com/hpp/v1/sessions'
const config = {
  headers: {
    Authorization: `Basic ${Buffer.from(
      `${process.env.KCO_USERNAME}:${process.env.KCO_PASSWORD}`
    ).toString('base64')}`,
    'Content-Type': 'application/json',
  },
}

const defaultDataKco = {
  purchase_country: 'SE',
  purchase_currency: 'SEK',
  locale: 'en-GB',
  merchant_urls: {
    terms: 'http://localhost:3000/terms',
    checkout: 'http://localhost:3000?order_id={checkout.order.id}',
    confirmation:
      'http://localhost:3000/confirmation?order_id={checkout.order.id}',
    push: 'http://localhost:3000/api/push?order_id={checkout.order.id}',
  },
}

const defaultDataHpp = {
  payment_session_url: 'https://api.playground.klarna.com/checkout/v3/orders/',
  merchant_urls: {
    //   success: 'http://localhost:3000/success?sid={{session_id}}&token={{authorization_token}}',
    //   cancel: 'http://localhost:3000/cancel?sid={{session_id}}',
    back: 'http://localhost:3000',
    //   failure: 'http://localhost:3000/fail?sid={{session_id}}',
    //   error: 'http://localhost:3000/error?sid={{session_id}}'
  },
  options: {
    background_images: [
      {
        url:
          'https://www.freecodecamp.org/news/content/images/size/w2000/2020/04/w-qjCHPZbeXCQ-unsplash.jpg',
        width: 1280,
      },
    ],
  },
}

const calculateOrderLinesValues = (orderLines) => {
  let amount = 0,
    taxAmount = 0
  const currentOrderLines = orderLines.filter((orderLine) => orderLine.quantity)

  currentOrderLines.forEach((orderLine) => {
    orderLine['total_amount'] = orderLine.quantity * orderLine.unit_price
    orderLine['total_tax_amount'] =
      orderLine['total_amount'] -
      (orderLine['total_amount'] * 10000) / (10000 + orderLine.tax_rate)
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

const kcoCreate = async (initialOrderLines) => {
  const { amount, taxAmount, orderLines } = calculateOrderLinesValues(
    initialOrderLines
  )

  const data = {
    ...defaultDataKco,
    order_amount: amount,
    order_tax_amount: taxAmount,
    order_lines: orderLines,
  }

  return axios.post(kcoUrl, data, config)
}

const hppCreate = async (kcoOrderId) => {
  const data = {
    ...defaultDataHpp,
    payment_session_url: `${defaultDataHpp.payment_session_url}${kcoOrderId}`,
  }

  return axios.post(hppUrl, data, config)
}

const kcoUpdate = async (orderId, initialOrderLines) => {
  const { amount, taxAmount, orderLines } = calculateOrderLinesValues(
    initialOrderLines
  )

  const data = {
    ...defaultDataKco,
    order_amount: amount,
    order_tax_amount: taxAmount,
    order_lines: orderLines,
  }

  return axios.post(`${kcoUrl}/${orderId}`, data, config)
}

export default {
  read: async (orderId) => {
    if (!orderId) {
      return undefined
    }

    let response

    try {
      response = await axios.get(`${hppUrl}/${orderId}`, config)
    } catch (e) {}

    return response
  },
  updateOrCreate: async (orderId, initialOrderLines) => {
    let kcoResponse, response

    if (orderId) {
      try {
        kcoResponse = await kcoUpdate(orderId, initialOrderLines)
      } catch (e) {
        kcoResponse = await kcoCreate(initialOrderLines)
      }
    } else {
      kcoResponse = await kcoCreate(initialOrderLines)
    }

    if (kcoResponse.data.order_id) {
      response = await hppCreate(kcoResponse.data.order_id)
    }

    return response
  },
}
