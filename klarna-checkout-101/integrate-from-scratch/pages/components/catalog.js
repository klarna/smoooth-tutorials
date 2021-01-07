import { useState } from 'react'
import styles from '../../styles/Home.module.css'

export default function Catalog({ initialCart, setSnippet }) {
  const [ orderLines, setOrderLines ] = useState(initialCart)

  const addToCartHandle = async (reference, shouldIncrease = true) => {
    const orderLine = orderLines.find(orderLine => orderLine.reference === reference)
    orderLine.quantity += shouldIncrease ? 1 : -1

    const response = await fetch('/api/updateOrder', {
      method: 'POST',
      body: JSON.stringify({
        orderLines
      })
    })
    const order = await response.json()
    
    setSnippet(order.snippet)
    setOrderLines([...orderLines])
  }

  return orderLines.map(orderLine => (
    <div className={styles.card} key={orderLine.reference}>
      <img src={orderLine.imgSrc} alt={orderLine.name} />
      <div className={styles.details}>
        <span>{orderLine.name}</span>
        <b>{(orderLine.unit_price/100).toFixed(2)}</b>
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