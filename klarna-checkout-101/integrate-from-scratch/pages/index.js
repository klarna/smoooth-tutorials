import { useState } from 'react'
import Head from 'next/head'
import defaultOrderLines from './db/order_lines'
import styles from '../styles/Home.module.css'
import api from './services/api'
import { getCartFromCookie, getOrderIdFromCookie } from './helpers/cookie'
import KlarnaCheckout from './components/klarnaCheckout'
import Catalog from './components/catalog'

function Checkout({ initialSnippet, initialCart }) {
  const [ snippet, setSnippet ] = useState(initialSnippet)

  return (
    <div className={styles.container}>
      <Head>
        <title>Smoooth Merchant</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.main}>
        <div className={styles.left}>
          { initialCart &&
            <Catalog initialCart={initialCart} setSnippet={setSnippet} />
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
    </div>
  )
}

export const getServerSideProps = async ({ req }) => {
  let initialSnippet = null
  const initialCart = defaultOrderLines
  const cartFromCookie = getCartFromCookie(req.headers.cookie)
  const parseCart = cartFromCookie && JSON.parse(cartFromCookie)

  if (parseCart && Object.keys(parseCart).length) {
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
    props: {
      initialSnippet,
      initialCart,
    }
  }
}

export default Checkout
