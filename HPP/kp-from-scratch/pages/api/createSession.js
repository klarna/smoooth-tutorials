import api from '../../services/api'
import { getSessionIdFromCookie } from '../../helpers/cookie'

export default async (req, res) => {
  const sessionId = getSessionIdFromCookie(req.headers.cookie)
  const reqData = JSON.parse(req.body)
  let hppResponse = await api.updateOrCreate(sessionId, reqData.orderLines)
  const hppUrls = {
    qr_code_url: hppResponse.data.qr_code_url,
    redirect_url: hppResponse.data.redirect_url,
  }

  res.setHeader('Set-Cookie', [
    `hppSessionId=${hppResponse.data.session_id}; path=/;`,
    `hppUrls=${JSON.stringify(hppUrls)}; path=/;`,
  ])
  res.statusCode = hppResponse.status
  res.json(hppResponse.data)
}
