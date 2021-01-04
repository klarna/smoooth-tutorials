import { useState, useEffect } from 'react'
import Head from 'next/head'
import defaultOrderLines from './db/order_lines'
import styles from '../styles/Home.module.css'
import api from './services/api'
import { getCartFromCookie, getOrderIdFromCookie } from './helpers/cookie'
import KlarnaCheckout from './components/klarnaCheckout'

function Checkout({ initialSnippet, initialCart }) {
  const [ orderLines, setOrderLines ] = useState(initialCart)
  const [ snippet, setSnippet ] = useState(initialSnippet)

  const addToCartHandle = (reference, shouldIncrease = true) => {
    const orderLine = orderLines.find(orderLine => orderLine.reference === reference)
    orderLine.quantity += shouldIncrease ? 1 : -1

    fetch('/api/updateOrder', {
      method: 'POST',
      body: JSON.stringify({
        orderLines
      })
    }).then(response => response.json())
    .then(response => {
      setSnippet(response.snippet)
      setOrderLines([...orderLines])
    })
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Smoooth Merchant</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.main}>
        <div className={styles.left}>
          { orderLines &&
            orderLines.map(orderLine => (
              <div className={styles.card} key={orderLine.reference}>
                <img src={orderLine.imgSrc} alt={orderLine.name} />
                <div className={styles.details}>
                  <h2>{orderLine.name}</h2>
                  <span>Color: <b>{orderLine.color}</b></span>
                  <span>Size: <b>{orderLine.size}</b></span>
                  <span>Price: <b>{(orderLine.unit_price/100).toFixed(2)}</b></span>
                  { orderLine.quantity === 0 &&
                    <button className={styles.button} onClick={() => addToCartHandle(orderLine.reference)}>Add to cart</button>
                  }
                  { orderLine.quantity > 0 &&
                    <div>
                      <button className={styles.button} onClick={() => addToCartHandle(orderLine.reference, false)}>-</button>
                      <b className={styles.quantity}>{orderLine.quantity}</b>
                      <button className={styles.button} onClick={() => addToCartHandle(orderLine.reference)}>+</button>
                    </div>
                  }
                </div>
              </div>
            ))
          }
        </div>
        <hr className={styles.hr} />
        <div className={styles.right}>
          { !snippet &&
            <span>Your cart is empty. Please add some items to your cart to render the checkout.</span>
          }
          { snippet &&
            <KlarnaCheckout snippet={snippet} />
          }
        </div>
      </div>

      <footer className={styles.footer}>
        <a
          href="https://klarna.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <img src="/klarna.svg" alt="Klarna Logo" className={styles.logo} />
        </a>
      </footer>
    </div>
  )
}

Checkout.getInitialProps = async ({ req }) => {
  let initialSnippet
  const initialCart = defaultOrderLines
  const cartFromCookie = getCartFromCookie(req.headers.cookie)
  const parseCart = cartFromCookie && JSON.parse(cartFromCookie)

  if (Object.keys(parseCart).length) {
    const orderId = getOrderIdFromCookie(req.headers.cookie)
    const checkoutResponse = await api.read(orderId)

    if (checkoutResponse?.data?.status !== 'checkout_complete') {
      initialSnippet = checkoutResponse?.data?.html_snippet

      initialCart.forEach(orderLine => {
        const quantityFromCookie = parseCart[orderLine.reference]
        if (quantityFromCookie) {
          orderLine.quantity = quantityFromCookie
        }
      })
    }
  }

  return {
    initialSnippet,
    initialCart,
  }
}

export default Checkout