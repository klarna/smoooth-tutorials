import { useState } from 'react'
import styles from '../styles/Home.module.css'

export default function Catalog({ initialCart, InitialSessionResponse }) {
  const [orderLines, setOrderLines] = useState(initialCart)
  const [sessionResponse, setSessionResponse] = useState(InitialSessionResponse)

  const addToCartHandle = async (reference, shouldIncrease = true) => {
    const orderLine = orderLines.find(
      (orderLine) => orderLine.reference === reference
    )
    orderLine.quantity += shouldIncrease ? 1 : -1

    await fetch('/api/updateCatalog', {
      method: 'POST',
      body: JSON.stringify({
        orderLines,
      }),
    })
    setOrderLines([...orderLines])
  }

  const continueToHostedPage = async () => {
    const response = await fetch('/api/createSession', {
      method: 'POST',
      body: JSON.stringify({
        orderLines,
      }),
    })
    const sessionResponse = await response.json()
    setSessionResponse(sessionResponse)
  }

  return orderLines.map((orderLine) => (
    <>
      {!sessionResponse && (
        <div className={styles.card} key={orderLine.reference}>
          <img
            className={styles.imgSmall}
            src={orderLine.image_url}
            alt={orderLine.name}
          />
          <div className={styles.details}>
            <span>{orderLine.name}</span>
            <b>{(orderLine.unit_price / 100).toFixed(2)}</b>
            {orderLine.quantity === 0 && (
              <button
                className={styles.button}
                onClick={() => addToCartHandle(orderLine.reference)}
              >
                Add to cart
              </button>
            )}
            {orderLine.quantity > 0 && (
              <div>
                <button
                  className={styles.button}
                  onClick={() => addToCartHandle(orderLine.reference, false)}
                >
                  -
                </button>
                <b className={styles.quantity}>{orderLine.quantity}</b>
                <button
                  className={styles.button}
                  onClick={() => addToCartHandle(orderLine.reference)}
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {!sessionResponse &&
        orderLines.some((orderLine) => orderLine.quantity > 0) && (
          <button className={styles.button} onClick={continueToHostedPage}>
            Create HPP session
          </button>
        )}
      {sessionResponse && (
        <div>
          <p>Scan to complete the purchase</p>
          <img
            className={styles.imgSmall}
            src={sessionResponse.qr_code_url}
            alt="qr code"
          />

          <p>Or continue on the browser</p>
          <button
            className={styles.button}
            onClick={() =>
              (window.location.href = sessionResponse.redirect_url)
            }
          >
            Continue to HPP
          </button>
        </div>
      )}
    </>
  ))
}
