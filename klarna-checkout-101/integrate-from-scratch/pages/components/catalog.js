import { useState } from 'react'
import styles from '../../styles/Home.module.css'

export default function Catalog({ initialCart, setSnippet }) {
  const [ orderLines, setOrderLines ] = useState(initialCart)

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

  return orderLines.map(orderLine => (
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