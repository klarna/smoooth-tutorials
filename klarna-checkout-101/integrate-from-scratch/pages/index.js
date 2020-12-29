import { useState, useEffect } from 'react'
import Head from 'next/head'
import defaultOrderLines from './db/order_lines'
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
                  <span>Price: <b>{orderLine.unit_price}</b></span>
                  { orderLine.quantity === 0 &&
                    <button onClick={() => addToCartHandle(orderLine.reference)}>Add to cart</button>
                  }
                  { orderLine.quantity > 0 &&
                    <div>
                      <button onClick={() => addToCartHandle(orderLine.reference, false)}>-</button>
                      <span>{orderLine.quantity}</span>
                      <button onClick={() => addToCartHandle(orderLine.reference)}>+</button>
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
            <span>You cart is empty. Please add some items to your cart to render the checkout.</span>
          }
          { snippet &&
            <div
              ref={ref => checkoutRef = ref}
              suppressHydrationWarning={true}
            />
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

const getCartFromCookie = (cookie) => {
  const cookieMatch = cookie.match(/(merchantCart=)(?<merchantCart>\S*);?/)
  return cookieMatch ? cookieMatch.groups.merchantCart : undefined
}

Checkout.getInitialProps = async ({ req }) => {
  let initialSnippet
  const initialCart = defaultOrderLines
  const cartFromCookie = getCartFromCookie(req.headers.cookie)

  if (cartFromCookie) {
    const checkoutResponse = await api.read(req)
    initialSnippet = checkoutResponse?.data?.html_snippet

    const parseCart = JSON.parse(cartFromCookie)
    initialCart.forEach(orderLine => {
      const quantityFromCookie = parseCart[orderLine.reference]
      if (quantityFromCookie) {
        orderLine.quantity = quantityFromCookie
      }
    })
  }

  return {
    initialSnippet,
    initialCart,
  }
}

export default Checkout