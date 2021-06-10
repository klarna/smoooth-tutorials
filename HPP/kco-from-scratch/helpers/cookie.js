export const getSessionIdFromCookie = (cookie) => {
  if (!cookie) return undefined

  const cookieMatch = cookie.match(/(hppSessionId=)(?<sessionId>\S*);?/)
  return cookieMatch ? cookieMatch.groups.sessionId.replace(';', '') : undefined
}

export const getCartFromCookie = (cookie) => {
  if (!cookie) return undefined

  const cookieMatch = cookie.match(/(merchantCart=)(?<merchantCart>\S*);?/)
  return cookieMatch
    ? cookieMatch.groups.merchantCart.replace(';', '')
    : undefined
}

export const getHppUrlsFromCookie = (cookie) => {
  if (!cookie) return undefined

  const cookieMatch = cookie.match(/(hppUrls=)(?<hppUrls>\S*);?/)
  return cookieMatch ? cookieMatch.groups.hppUrls.replace(';', '') : undefined
}
