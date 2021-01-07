import { useState } from 'react'
import Head from 'next/head'
import defaultOrderLines from './db/order_lines'
import styles from '../styles/Home.module.css'
import KlarnaCheckout from './components/klarnaCheckout'
import Catalog from './components/catalog'

function Checkout({ initialSnippet, initialCart }) {
  const [snippet, setSnippet] = useState(initialSnippet)

  return (
    <div className={styles.container}>
      <Head>
        <title>Smoooth Merchant</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.main}>
        <div className={styles.left}>
          {initialCart && (
            <Catalog initialCart={initialCart} setSnippet={setSnippet} />
          )}
        </div>
        <hr className={styles.hr} />
        <div className={styles.right}>
          {!snippet && (
            <span>
              Your cart is empty. Please add some items to your cart to render
              the checkout.
            </span>
          )}
          {snippet && <KlarnaCheckout snippet={snippet} />}
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps = async () => {
  return {
    props: {
      initialCart: defaultOrderLines,
    },
  }
}

export default Checkout
