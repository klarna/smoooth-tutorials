import Head from 'next/head'
import styles from '../styles/Home.module.css'
import KlarnaCheckout from './components/klarnaCheckout'

function Confirmation({ snippet }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Smoooth Merchant</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.confirmation}>
        {!snippet && <span>Error getting order id from the query string.</span>}
        {snippet && <KlarnaCheckout snippet={snippet} />}
        <button
          className={styles.button}
          onClick={() => (window.location.href = '/')}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  )
}

export const getServerSideProps = async ({ query }) => {
  // not implemented

  return {
    props: {},
  }
}

export default Confirmation
