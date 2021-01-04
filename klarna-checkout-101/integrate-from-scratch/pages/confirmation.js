import { useEffect } from 'react'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import api from './services/api'

let checkoutRef = null
function setDangerousHtml (html) {
  if (checkoutRef === null) {
    return
  }

  const range = document.createRange()

  range.selectNodeContents(checkoutRef)
  range.deleteContents()

  checkoutRef.appendChild(range.createContextualFragment(html))
}

function Confirmation({ snippet }) {
  useEffect(() => {
    if (snippet) {
      setDangerousHtml(snippet)
    }
  }, [snippet])

  return (
    <div className={styles.container}>
      <Head>
        <title>Smoooth Merchant</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.confirmation}>
        { !snippet &&
          <span>Error getting order id from the query string.</span>
        }
        { snippet &&
          <div
            ref={ref => checkoutRef = ref}
            suppressHydrationWarning={true}
          />
        }
        <button className={styles.button} onClick={() => window.location.href = '/'}>Continue Shopping</button>
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

Confirmation.getInitialProps = async ({ query }) => {
  let snippet
  if (query.order_id) {
    const checkoutResponse = await api.read(query.order_id)
    snippet = checkoutResponse?.data?.html_snippet
  }
  
  return {
    snippet,
  }
}

export default Confirmation