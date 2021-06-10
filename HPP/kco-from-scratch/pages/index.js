import Head from 'next/head'
import defaultOrderLines from '../db/order_lines'
import styles from '../styles/Home.module.css'
import {
  getCartFromCookie,
  getSessionIdFromCookie,
  getHppUrlsFromCookie,
} from '../helpers/cookie'
import Catalog from '../components/catalog'
import api from '../services/api'

function Checkout({ initialCart, sessionResponse }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Smoooth Merchant</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.main}>
        <div className={styles.left}>
          {initialCart && (
            <Catalog
              initialCart={initialCart}
              InitialSessionResponse={sessionResponse}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps = async ({ req }) => {
  let sessionResponse = null
  const initialCart = defaultOrderLines
  const cartFromCookie = getCartFromCookie(req.headers.cookie)
  const parseCart = cartFromCookie && JSON.parse(cartFromCookie)

  if (parseCart && Object.keys(parseCart).length) {
    const sessionId = getSessionIdFromCookie(req.headers.cookie)
    const response = await api.read(sessionId)

    if (
      response &&
      !['COMPLETED', 'CANCELLED'].find(
        (status) => status === response.data.status
      )
    ) {
      const hppUrlsFromCookie = getHppUrlsFromCookie(req.headers.cookie)
      const parseUrls = hppUrlsFromCookie && JSON.parse(hppUrlsFromCookie)
      sessionResponse = parseUrls
      initialCart.forEach((orderLine) => {
        const quantityFromCookie = parseCart[orderLine.reference]
        if (quantityFromCookie) {
          orderLine.quantity = quantityFromCookie
        }
      })
    }
  }

  return {
    props: {
      initialCart,
      sessionResponse,
    },
  }
}

export default Checkout
