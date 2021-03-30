import axios from 'axios'

const kpUrl = 'https://api.playground.klarna.com/payments/v1/sessions'
const hppUrl = 'https://api.playground.klarna.com/hpp/v1/sessions'
const config = {
  headers: {
    Authorization: `Basic ${Buffer.from(
      `${process.env.KCO_USERNAME}:${process.env.KCO_PASSWORD}`
    ).toString('base64')}`,
    'Content-Type': 'application/json',
  },
}

const defaultDataKp = {
  purchase_country: 'se',
  purchase_currency: 'sek',
  locale: 'en-US',
  acquiring_channel: 'IN_STORE',
  billing_address: {
    given_name: 'John',
    family_name: 'Doe',
    email: 'email@example.com',
    title: 'Mr',
    street_address: '2425 Example Rd',
    street_address2: '',
    postal_code: '43221',
    city: 'Columbus',
    region: 'OH',
    phone: '6145675309',
    country: 'se',
  },
}

const defaultDataHpp = {
  payment_session_url:
    'https://api.playground.klarna.com/payments/v1/sessions/',
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

const kpCreate = async (initialOrderLines) => {
  const { amount, taxAmount, orderLines } = calculateOrderLinesValues(
    initialOrderLines
  )

  const data = {
    ...defaultDataKp,
    order_amount: amount,
    order_tax_amount: taxAmount,
    order_lines: orderLines,
  }

  return axios.post(kpUrl, data, config)
}

const hppCreate = async (kpSessionId) => {
  const data = {
    ...defaultDataHpp,
    payment_session_url: `${defaultDataHpp.payment_session_url}${kpSessionId}`,
  }

  return axios.post(hppUrl, data, config)
}

const kpUpdate = async (sessionId, initialOrderLines) => {
  const { amount, taxAmount, orderLines } = calculateOrderLinesValues(
    initialOrderLines
  )

  const data = {
    ...defaultDataKp,
    order_amount: amount,
    order_tax_amount: taxAmount,
    order_lines: orderLines,
  }

  return axios.post(`${kpUrl}/${sessionId}`, data, config)
}

export default {
  read: async (sessionId) => {
    if (!sessionId) {
      return undefined
    }

    let response

    try {
      response = await axios.get(`${hppUrl}/${sessionId}`, config)
    } catch (e) {}

    return response
  },
  updateOrCreate: async (sessionId, initialOrderLines) => {
    let kpResponse, response

    if (sessionId) {
      try {
        kpResponse = await kpUpdate(sessionId, initialOrderLines)
      } catch (e) {
        kpResponse = await kpCreate(initialOrderLines)
      }
    } else {
      kpResponse = await kpCreate(initialOrderLines)
    }

    if (kpResponse.data.session_id) {
      response = await hppCreate(kpResponse.data.session_id)
    }

    return response
  },
}
