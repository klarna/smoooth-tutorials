export const getOrderIdFromCookie = (cookie) => {
  const cookieMatch = cookie.match(/(kcoOrderId=)(?<orderId>\S*);?/)
  return cookieMatch ? cookieMatch.groups.orderId.replace(';', '') : undefined
}

export const getCartFromCookie = (cookie) => {
  const cookieMatch = cookie.match(/(merchantCart=)(?<merchantCart>\S*);?/)
  return cookieMatch
    ? cookieMatch.groups.merchantCart.replace(';', '')
    : undefined
}
