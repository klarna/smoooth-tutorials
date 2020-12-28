import Head from 'next/head'
import styles from '../styles/Home.module.css'

function Checkout() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Smoooth Merchant</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.main}>
        <div className={styles.left}>
          <div className={styles.card}>
            <img src="/sunglasses2-min.jpg" alt="Product image" />
            <div className={styles.details}>
              <h2>Classic Low Bridge Sunglasses</h2>
              <span>Color: <b>White</b></span>
              <span>Size: <b>Small</b></span>
              <span>Price: <b>250kr</b></span>
              <button>Add to cart</button>
            </div>
          </div>
          <div className={styles.card}>
            <img src="/shoe1-min.jpg" alt="Product image" />
            <div className={styles.details}>
              <h2>Original Canvas Slip-On</h2>
              <span>Color: <b>Black and White</b></span>
              <span>Size: <b>39</b></span>
              <span>Price: <b>500kr</b></span>
              <button>Add to cart</button>
            </div>
          </div>
          <div className={styles.card}>
            <img src="/t-shirt.jpg" alt="Product image" />
            <div className={styles.details}>
              <h2>Round neck organic t-shirt</h2>
              <span>Color: <b>White</b></span>
              <span>Size: <b>Small</b></span>
              <span>Price: <b>340kr</b></span>
              <button>Add to cart</button>
            </div>
          </div>
        </div>
        <hr className={styles.hr} />
        <div className={styles.right}>right</div>
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

export async function getStaticProps() {
  return {
    props: {
    },
  }
}

export default Checkout